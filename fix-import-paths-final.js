// Fix incorrect import paths for formatters in nested directories
const fs = require('fs');
const path = require('path');

// Files that need fixing (nested in carrier/ and customer/ subdirectories)
const nestedFilesToFix = [
  'src/pages/carrier/CarrierDashboard.tsx',
  'src/pages/carrier/CarrierMyLoadsPage.tsx',
  'src/pages/carrier/LoadAssignmentPage.tsx',
  'src/pages/customer/CustomerDashboard.tsx',
  'src/pages/customer/CustomerMyLoadsPage.tsx'
];

// Files in components/analytics/ that also need fixing
const analyticsFilesToFix = [
  'src/components/analytics/CarrierAnalytics.tsx',
  'src/components/analytics/CustomerAnalytics.tsx'
];

function fixImportPath(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the incorrect import path - nested files need ../../utils/formatters
    const oldImport = "from '../utils/formatters'";
    const newImport = "from '../../utils/formatters'";
    
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed import path: ${filePath}`);
    } else {
      console.log(`⚪ No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing import paths for nested files...\n');

// Fix nested files (carrier/ and customer/ subdirectories)
nestedFilesToFix.forEach(fixImportPath);

console.log('\n🔧 Fixing import paths for analytics files...\n');

// Fix analytics files
analyticsFilesToFix.forEach(fixImportPath);

console.log('\n✅ Import path fixes completed!');
