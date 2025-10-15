const fs = require('fs');
const path = require('path');

// Değiştirilecek metin çiftleri
const replacements = [
  // Temel değişimler
  { from: /0G Network/g, to: 'Stacks' },
  { from: /0G Galileo/g, to: 'Stacks Testnet' },
  { from: /0G Chain/g, to: 'Stacks Blockchain' },
  { from: /0G Testnet/g, to: 'Stacks Testnet' },
  { from: /0G Mainnet/g, to: 'Stacks Mainnet' },
  
  // Token değişimleri
  { from: /\bOG\b/g, to: 'STX' },
  { from: /OG Token/g, to: 'STX Token' },
  { from: /OG Coin/g, to: 'STX' },
  
  // Teknik terimler
  { from: /0G Protocol/g, to: 'Stacks Protocol' },
  { from: /0G Blockchain/g, to: 'Stacks Blockchain' },
  { from: /0G ecosystem/g, to: 'Stacks ecosystem' },
  { from: /0G network/g, to: 'Stacks network' },
  
  // Büyük/küçük harf varyasyonları
  { from: /0g network/g, to: 'Stacks network' },
  { from: /0g Network/g, to: 'Stacks Network' },
  { from: /0G NETWORK/g, to: 'STACKS NETWORK' },
  
  // Wallet ve adres formatları
  { from: /0G wallet/g, to: 'Stacks wallet' },
  { from: /0G Wallet/g, to: 'Stacks Wallet' },
  { from: /0G address/g, to: 'Stacks address' },
  { from: /0G Address/g, to: 'Stacks Address' },
  
  // Casino spesifik
  { from: /0G Casino/g, to: 'Stacks Casino' },
  { from: /0G Gaming/g, to: 'Stacks Gaming' },
  
  // Diğer varyasyonlar
  { from: /Zero Gravity/g, to: 'Stacks' },
  { from: /zero gravity/g, to: 'Stacks' },
  { from: /ZeroG/g, to: 'Stacks' },
  { from: /0-G/g, to: 'Stacks' }
];

// İşlenecek dosya uzantıları
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.html'];

// Hariç tutulacak klasörler
const excludedDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

// Dosya okuma ve yazma fonksiyonu
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Tüm değişimleri uygula
    replacements.forEach(({ from, to }) => {
      if (from.test(newContent)) {
        newContent = newContent.replace(from, to);
        hasChanges = true;
      }
    });

    // Eğer değişiklik varsa dosyayı güncelle
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Klasör tarama fonksiyonu
function processDirectory(dirPath) {
  let totalFiles = 0;
  let updatedFiles = 0;

  function scanDir(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Hariç tutulan klasörleri atla
        if (!excludedDirs.includes(item)) {
          scanDir(itemPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        
        // Sadece belirtilen uzantılardaki dosyaları işle
        if (fileExtensions.includes(ext)) {
          totalFiles++;
          if (processFile(itemPath)) {
            updatedFiles++;
          }
        }
      }
    });
  }

  scanDir(dirPath);
  return { totalFiles, updatedFiles };
}

// Ana fonksiyon
function main() {
  console.log('🔄 Starting 0G Network → Stacks replacement...\n');
  
  const startTime = Date.now();
  const { totalFiles, updatedFiles } = processDirectory('./');
  const endTime = Date.now();
  
  console.log('\n📊 Summary:');
  console.log(`📁 Total files processed: ${totalFiles}`);
  console.log(`✏️  Files updated: ${updatedFiles}`);
  console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
  
  if (updatedFiles > 0) {
    console.log('\n🎉 Replacement completed successfully!');
    console.log('📝 Please review the changes and test your application.');
  } else {
    console.log('\n💡 No files needed updating.');
  }
}

// Güvenlik kontrolü
console.log('⚠️  This script will replace "0G Network" references with "Stacks" in your project.');
console.log('📋 Make sure you have a backup or use version control.');
console.log('🚀 Starting in 3 seconds...\n');

setTimeout(main, 3000);