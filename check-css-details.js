const fs = require('fs');
const path = require('path');

console.log('🔍 Detailed CSS Analysis...\n');

const problemFiles = [
  'src/App.css',
  'src/components/AdminLogin.css', 
  'src/components/Students/StudentTable.css',
  'src/components/SummerNote/SummerNote.css',
  'src/index.css'
];

problemFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`\n📁 Checking: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Look for patterns that might cause issues
      if (line.includes('/*') && !line.includes('*/')) {
        console.log(`   Line ${index + 1}: Unclosed comment start: ${line.trim()}`);
      }
      if (line.match(/[^\\]\//) && line.includes('/*')) {
        console.log(`   Line ${index + 1}: Potential special char: ${line.trim()}`);
      }
      if (line.includes('//')) {
        console.log(`   Line ${index + 1}: JS-style comment: ${line.trim()}`);
      }
    });
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});