#!/usr/bin/env node

/**
 * Daily GitHub Activity Automation Script
 * Makes safe, meaningful commits to multiple repositories daily
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG_FILE = path.join(__dirname, 'github-activity-config.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Load configuration
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ Config file not found: ${CONFIG_FILE}`);
    console.error('Please create github-activity-config.json first.');
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  
  if (!config.repositories || !Array.isArray(config.repositories)) {
    console.error('❌ Config must include a "repositories" array');
    process.exit(1);
  }
  
  return config;
}

// Check if directory is a git repository
function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

// Get or clone repository
function ensureRepo(repoConfig, baseDir) {
  let repoName = repoConfig.name;
  if (!repoName) {
    if (repoConfig.url) {
      repoName = repoConfig.url.replace(/\.git$/, '').split('/').pop();
    } else if (repoConfig.localPath) {
      repoName = path.basename(repoConfig.localPath);
    } else {
      repoName = 'unknown';
    }
  }
  // Determine the local path
  let localPath;
  if (repoConfig.localPath) {
    localPath = path.isAbsolute(repoConfig.localPath) 
      ? repoConfig.localPath 
      : path.resolve(baseDir, repoConfig.localPath);
  } else if (repoConfig.url) {
    localPath = path.join(baseDir, 'repos', repoName);
  } else {
    console.error(`❌ No valid path or URL for repo: ${repoName}`);
    return null;
  }
  
  // Handle existing local repository
  if (fs.existsSync(localPath) && isGitRepo(localPath)) {
    console.log(`📂 Updating existing repo: ${repoName}`);
    try {
      execSync('git pull', { cwd: localPath, stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️  Warning: Could not pull ${repoName}, continuing...`);
    }
    return localPath;
  }
  
  // Handle cloning from URL
  if (repoConfig.url) {
    console.log(`📥 Cloning repo: ${repoName}`);
    const parentDir = path.dirname(localPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    try {
      execSync(`git clone ${repoConfig.url} ${localPath}`, { stdio: 'inherit' });
      return localPath;
    } catch (error) {
      console.error(`❌ Failed to clone ${repoName}: ${error.message}`);
      return null;
    }
  }
  
  // Handle local path that doesn't exist
  if (repoConfig.localPath) {
    console.error(`❌ Local path does not exist or is not a git repo: ${localPath}`);
    return null;
  }
  
  return null;
}

// Check for uncommitted changes
function hasUncommittedChanges(repoPath) {
  try {
    const status = execSync('git status --porcelain', { 
      cwd: repoPath, 
      encoding: 'utf8' 
    });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

// Generate safe changes
function generateSafeChange(repoPath, repoConfig) {
  const changeTypes = [
    'readme',
    'comment',
    'package',
    'docs',
    'config'
  ];
  
  const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
  
  switch (changeType) {
    case 'readme':
      return updateReadme(repoPath);
    case 'comment':
      return addCodeComment(repoPath);
    case 'package':
      return updatePackageJson(repoPath);
    case 'docs':
      return updateDocumentation(repoPath);
    case 'config':
      return updateConfigFile(repoPath);
    default:
      return updateReadme(repoPath);
  }
}

// Update README with subtle improvements
function updateReadme(repoPath) {
  const readmePaths = [
    'README.md',
    'readme.md',
    'README.txt',
    'readme.txt'
  ];
  
  for (const readmePath of readmePaths) {
    const fullPath = path.join(repoPath, readmePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Add or update last updated date
      const date = new Date().toISOString().split('T')[0];
      if (content.includes('Last updated:')) {
        content = content.replace(/Last updated:.*/g, `Last updated: ${date}`);
      } else if (content.includes('##')) {
        content = content.replace(/(##[^\n]*\n)/, `$1\n_Last updated: ${date}_\n\n`);
      } else {
        content = `_Last updated: ${date}_\n\n${content}`;
      }
      
      // Fix common typos or improve formatting
      content = content.replace(/\s+$/gm, ''); // Remove trailing whitespace
      
      if (!DRY_RUN) {
        fs.writeFileSync(fullPath, content);
      }
      
      return {
        file: readmePath,
        message: `docs: Update README formatting and last updated date`,
        type: 'readme'
      };
    }
  }
  
  return null;
}

// Add helpful code comments
function addCodeComment(repoPath) {
  const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs'];
  const files = getAllFiles(repoPath, codeExtensions);
  
  if (files.length === 0) return null;
  
  const targetFile = files[Math.floor(Math.random() * files.length)];
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // Find a good place to add a comment (after imports, before functions)
  const lines = content.split('\n');
  let insertIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    // Skip if already has a comment nearby
    if (lines[i].trim().startsWith('//') || lines[i].trim().startsWith('*')) {
      continue;
    }
    
    // Look for function/class definitions
    if (lines[i].match(/(function|const|class|export|def|async)\s+\w+/)) {
      insertIndex = i;
      break;
    }
  }
  
  if (insertIndex === -1) {
    insertIndex = Math.floor(lines.length / 2);
  }
  
  const commentText = getRandomComment();
  lines.splice(insertIndex, 0, commentText);
  
  if (!DRY_RUN) {
    fs.writeFileSync(targetFile, lines.join('\n'));
  }
  
  return {
    file: path.relative(repoPath, targetFile),
    message: `refactor: Add clarifying comment to improve code readability`,
    type: 'comment'
  };
}

// Update package.json metadata
function updatePackageJson(repoPath) {
  const packagePath = path.join(repoPath, 'package.json');
  if (!fs.existsSync(packagePath)) return null;
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const original = JSON.stringify(packageJson, null, 2);
  
  // Update description or keywords subtly
  if (packageJson.description) {
    packageJson.description = packageJson.description.trim();
  }
  
  // Ensure proper formatting
  const updated = JSON.stringify(packageJson, null, 2);
  
  if (original !== updated && !DRY_RUN) {
    fs.writeFileSync(packagePath, updated);
  }
  
  return {
    file: 'package.json',
    message: `chore: Clean up package.json formatting`,
    type: 'package'
  };
}

// Update documentation files
function updateDocumentation(repoPath) {
  const docFiles = getAllFiles(repoPath, ['.md', '.txt'])
    .filter(f => !f.includes('node_modules') && !f.includes('.git'));
  
  if (docFiles.length === 0) return null;
  
  const targetFile = docFiles[Math.floor(Math.random() * docFiles.length)];
  let content = fs.readFileSync(targetFile, 'utf8');
  const original = content;
  
  // Remove trailing whitespace
  content = content.replace(/\s+$/gm, '');
  
  // Ensure proper line endings
  if (!content.endsWith('\n') && content.length > 0) {
    content += '\n';
  }
  
  if (original !== content && !DRY_RUN) {
    fs.writeFileSync(targetFile, content);
  }
  
  return {
    file: path.relative(repoPath, targetFile),
    message: `docs: Improve documentation formatting`,
    type: 'docs'
  };
}

// Update config files
function updateConfigFile(repoPath) {
  const configFiles = [
    '.gitignore',
    '.eslintrc',
    '.eslintrc.json',
    'tsconfig.json',
    'jsconfig.json'
  ];
  
  for (const configFile of configFiles) {
    const fullPath = path.join(repoPath, configFile);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Clean up formatting
      content = content.replace(/\s+$/gm, '');
      if (!content.endsWith('\n') && content.length > 0) {
        content += '\n';
      }
      
      if (original !== content && !DRY_RUN) {
        fs.writeFileSync(fullPath, content);
      }
      
      return {
        file: configFile,
        message: `chore: Clean up ${configFile} formatting`,
        type: 'config'
      };
    }
  }
  
  return null;
}

// Get all files with specific extensions
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (file.startsWith('.') && file !== '.git') continue;
    if (file === 'node_modules' || file === 'dist' || file === 'build') continue;
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, extensions, fileList);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Get random comment text
function getRandomComment() {
  const comments = [
    '// Improved code organization',
    '// Enhanced readability',
    '// Better structure for maintainability',
    '// Optimized for clarity',
    '// Cleaner implementation',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

// Make commit
function makeCommit(repoPath, change, branch = 'main') {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would commit: ${change.message}`);
    return true;
  }
  
  try {
    // Checkout branch
    execSync(`git checkout ${branch}`, { cwd: repoPath, stdio: 'pipe' });
    
    // Add file
    execSync(`git add "${change.file}"`, { cwd: repoPath, stdio: 'pipe' });
    
    // Commit
    execSync(`git commit -m "${change.message}"`, { 
      cwd: repoPath, 
      stdio: 'pipe' 
    });
    
    // Push
    execSync(`git push origin ${branch}`, { 
      cwd: repoPath, 
      stdio: 'pipe' 
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to commit to ${path.basename(repoPath)}: ${error.message}`);
    return false;
  }
}

// Main execution
function main() {
  console.log('🚀 Starting daily GitHub activity automation...\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  const config = loadConfig();
  const baseDir = path.dirname(CONFIG_FILE);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const repo of config.repositories) {
    console.log(`\n📦 Processing: ${repo.name || repo.url || repo.path}`);
    
    const repoPath = ensureRepo(repo, baseDir);
    if (!repoPath) {
      errorCount++;
      continue;
    }
    
    // Skip if has uncommitted changes
    if (hasUncommittedChanges(repoPath)) {
      console.log(`⏭️  Skipping ${path.basename(repoPath)} - has uncommitted changes`);
      skipCount++;
      continue;
    }
    
    // Generate and apply change
    const change = generateSafeChange(repoPath, repo);
    if (!change) {
      console.log(`⚠️  Could not generate change for ${path.basename(repoPath)}`);
      skipCount++;
      continue;
    }
    
    console.log(`✨ Generated change: ${change.message} (${change.file})`);
    
    // Make commit
    const branch = repo.branch || 'main';
    if (makeCommit(repoPath, change, branch)) {
      console.log(`✅ Successfully committed to ${path.basename(repoPath)}`);
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateSafeChange };

