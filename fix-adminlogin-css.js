const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing AdminLogin.css...');

const filePath = path.join(__dirname, 'src/components/AdminLogin.css');

function fixCSSFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changesMade = 0;

        console.log('📖 Reading CSS file...');

        // Fix 1: Check for unclosed comments and fix them
        const openComments = (content.match(/\/\*/g) || []).length;
        const closeComments = (content.match(/\*\//g) || []).length;
        
        if (openComments !== closeComments) {
            console.log('⚠️  Found unclosed comments. Attempting to fix...');
            // Add missing closing comments at the end
            const missingComments = openComments - closeComments;
            for (let i = 0; i < missingComments; i++) {
                content += '\n*/';
            }
            changesMade += missingComments;
        }

        // Fix 2: Replace JavaScript-style single-line comments with CSS comments
        const singleLineCommentRegex = /^(\s*)\/\/(.*)$/gm;
        const singleLineComments = (content.match(singleLineCommentRegex) || []).length;
        content = content.replace(singleLineCommentRegex, '$1/*$2*/');
        changesMade += singleLineComments;

        // Fix 3: Add quotes to URLs in url() functions
        const urlRegex = /url\(([^'")][^)]*)\)/gi;
        const urls = (content.match(urlRegex) || []).length;
        content = content.replace(urlRegex, 'url("$1")');
        changesMade += urls;

        // Fix 4: Fix content property values (escape special characters)
        const contentRegex = /content:\s*["']?([^"';]*)["']?/gi;
        content = content.replace(contentRegex, (match, p1) => {
            // Only escape if it contains special characters that need escaping
            if (/[\\']/.test(p1)) {
                const escaped = p1.replace(/([\\'])/g, '\\$1');
                return `content: "${escaped}"`;
            }
            return match;
        });

        // Fix 5: Remove duplicate imports
        const importRegex = /@import[^;]+;/gi;
        const imports = content.match(importRegex) || [];
        const uniqueImports = [...new Set(imports)];
        
        if (imports.length !== uniqueImports.length) {
            console.log('🔄 Removing duplicate imports...');
            uniqueImports.forEach(imp => {
                content = content.replace(new RegExp(imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g'), '');
            });
            // Add unique imports at the beginning
            content = uniqueImports.join('\n') + '\n' + content.replace(importRegex, '').trim();
            changesMade += (imports.length - uniqueImports.length);
        }

        // Fix 6: Fix media query syntax
        content = content.replace(/@media\s+screen\s+and\s*\(/g, '@media screen and (');
        content = content.replace(/@media\s+\(/g, '@media (');

        // Fix 7: Ensure all rules have proper closing braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            console.log('⚠️  Mismatched braces found. Adding missing braces...');
            const missingBraces = openBraces - closeBraces;
            for (let i = 0; i < missingBraces; i++) {
                content += '\n}';
            }
            changesMade += missingBraces;
        }

        // Fix 8: Fix invalid properties
        const invalidProperties = [
            { regex: /content-jump-tab:/g, replacement: 'content:' },
            { regex: /filter:\s*progid:/g, replacement: '/* filter: progid:' }
        ];

        invalidProperties.forEach(({ regex, replacement }) => {
            const matches = (content.match(regex) || []).length;
            if (matches > 0) {
                content = content.replace(regex, replacement);
                changesMade += matches;
            }
        });

        // Fix 9: Add missing semicolons
        const missingSemicolons = content.replace(/;*\s*}/g, ';}'); // Add semicolons before closing braces
        if (missingSemicolons !== content) {
            content = missingSemicolons;
            changesMade++;
        }

        // Fix 10: Remove empty rules
        content = content.replace(/[^{]+\{\s*\}/g, '');
        
        // Only write if changes were made
        if (content !== originalContent) {
            // Create backup
            const backupPath = filePath + '.backup';
            fs.writeFileSync(backupPath, originalContent, 'utf8');
            console.log('📦 Backup created:', backupPath);
            
            // Write fixed content
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('✅ AdminLogin.css has been fixed!');
            console.log(`📊 Changes made: ${changesMade}`);
            
            // Show summary
            if (singleLineComments > 0) console.log(`   - Fixed ${singleLineComments} single-line comments`);
            if (urls > 0) console.log(`   - Fixed ${urls} URL functions`);
            if (openComments !== closeComments) console.log(`   - Fixed ${Math.abs(openComments - closeComments)} comment blocks`);
            if (openBraces !== closeBraces) console.log(`   - Fixed ${Math.abs(openBraces - closeBraces)} braces`);
            
            return true;
        } else {
            console.log('ℹ️  No changes needed. File is already valid.');
            return true;
        }

    } catch (error) {
        console.log('❌ Error fixing CSS file:', error.message);
        return false;
    }
}

// Run the fix
const success = fixCSSFile(filePath);

if (success) {
    console.log('\n🎉 CSS fix completed successfully!');
} else {
    console.log('\n💥 CSS fix failed. Please check the errors above.');
}

// Export for use in other scripts
module.exports = { fixCSSFile };