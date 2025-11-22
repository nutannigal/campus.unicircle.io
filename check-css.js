const fs = require('fs');
const path = require('path');

console.log('🔍 Checking CSS files for errors...');

function checkCSSFiles(dir) {
  let hasErrors = false;
  
  function scanDirectory(directory) {
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.css') || item.endsWith('.scss') || item.endsWith('.sass')) {
        checkFile(fullPath);
      }
    });
  }
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for unclosed comments
    const openComments = (content.match(/\/\*/g) || []).length;
    const closeComments = (content.match(/\*\//g) || []).length;
    
    if (openComments > closeComments) {
      console.log(`❌ ERROR: Unclosed comment in: ${filePath}`);
      hasErrors = true;
    }
    
    // Check for JavaScript-style comments
    if (content.includes('//')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.trim().startsWith('//')) {
          console.log(`❌ ERROR: JavaScript comment in ${filePath}:${index + 1}`);
          console.log(`   ${line.trim()}`);
          hasErrors = true;
        }
      });
    }
    
    // Check for special characters that might need escaping
    if (content.match(/[^\\]\/[^*]/) && content.includes('/*')) {
      console.log(`⚠️  WARNING: Potential special character issue in: ${filePath}`);
    }
  }
  
  scanDirectory(dir);
  return hasErrors;
}

const hasErrors = checkCSSFiles('./src');

if (hasErrors) {
  console.log('\n❌ CSS errors found. Please fix them before building.');
  process.exit(1);
} else {
  console.log('\n✅ No CSS syntax errors found.');
}