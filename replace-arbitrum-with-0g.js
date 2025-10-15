#!/usr/bin/env node

/**
 * Script to replace Arbitrum references with Stacks in frontend files
 * This script will replace Arbitrum network references while preserving technical/config references
 */

const fs = require('fs');
const path = require('path');

// Files and directories to process
const TARGET_DIRS = [
  'src/components',
  'src/app',
  'src/hooks',
  'src/utils',
  'src/services'
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Patterns to replace (Arbitrum network references, not technical configs)
const REPLACEMENT_PATTERNS = [
  // Network name references
  { pattern: /Arbitrum\s+Sepolia/gi, replacement: 'Stacks' },
  { pattern: /Arbitrum\s+One/gi, replacement: 'Stacks' },
  { pattern: /Arbitrum\s+Network/gi, replacement: 'Stacks' },
  { pattern: /Arbitrum\s+Testnet/gi, replacement: 'Stacks Testnet' },
  { pattern: /Arbitrum\s+Mainnet/gi, replacement: 'Stacks' },
  
  // Simple Arbitrum references (but not in URLs or technical contexts)
  { pattern: /(\s|^|"|'|>)Arbitrum(\s|$|"|'|<|\.|\,|\!|\?)/g, replacement: '$1Stacks$2' },
  { pattern: /"Arbitrum"/g, replacement: '"Stacks"' },
  { pattern: /'Arbitrum'/g, replacement: "'Stacks'" },
  { pattern: /`Arbitrum`/g, replacement: '`Stacks`' },
  
  // UI text and descriptions
  { pattern: /on\s+Arbitrum/gi, replacement: 'on Stacks' },
  { pattern: /using\s+Arbitrum/gi, replacement: 'using Stacks' },
  { pattern: /with\s+Arbitrum/gi, replacement: 'with Stacks' },
  { pattern: /from\s+Arbitrum/gi, replacement: 'from Stacks' },
  { pattern: /to\s+Arbitrum/gi, replacement: 'to Stacks' },
  { pattern: /via\s+Arbitrum/gi, replacement: 'via Stacks' },
  
  // Comments and descriptions
  { pattern: /\/\/.*Arbitrum.*/g, replacement: (match) => match.replace(/Arbitrum/gi, 'Stacks') },
  { pattern: /\/\*.*Arbitrum.*\*\//g, replacement: (match) => match.replace(/Arbitrum/gi, 'Stacks') },
  
  // Specific UI patterns
  { pattern: /Connected\s+to\s+Arbitrum/gi, replacement: 'Connected to Stacks' },
  { pattern: /Switch\s+to\s+Arbitrum/gi, replacement: 'Switch to Stacks' },
  { pattern: /Arbitrum\s+Casino/gi, replacement: 'Stacks Casino' },
  { pattern: /Casino.*Arbitrum/gi, replacement: 'Casino on Stacks' },
  
  // Token and coin references (but preserve technical names)
  { pattern: /Arbitrum\s+Coin/gi, replacement: 'Stacks Token' },
  { pattern: /Arbitrum\s+Token/gi, replacement: 'Stacks Token' },
  
  // Experience and gaming references
  { pattern: /found\s+on\s+Arbitrum/gi, replacement: 'found on Stacks' },
  { pattern: /experience.*Arbitrum/gi, replacement: (match) => match.replace(/Arbitrum/gi, 'Stacks') },
  { pattern: /gaming.*Arbitrum/gi, replacement: (match) => match.replace(/Arbitrum/gi, 'Stacks') },
  
  // Blockchain and network references
  { pattern: /Arbitrum\s+blockchain/gi, replacement: 'Stacks blockchain' },
  { pattern: /Arbitrum\s+layer/gi, replacement: 'Stacks layer' },
  { pattern: /Layer.*Arbitrum/gi, replacement: (match) => match.replace(/Arbitrum/gi, 'Stacks') },
];

// Patterns to EXCLUDE (preserve these technical references)
const EXCLUDE_PATTERNS = [
  // Technical configurations and URLs
  /arbitrum\.io/gi,
  /arbiscan\.io/gi,
  /arbitrumSepolia/g,
  /arbitrum-sepolia/g,
  /arbitrum-one/g,
  /ARBITRUM_/g,
  /arbitrum_/g,
  /\.arbitrum\./g,
  /arbitrum\./g,
  
  // Import statements and technical references
  /import.*arbitrum/gi,
  /from.*arbitrum/gi,
  /require.*arbitrum/gi,
  
  // Chain IDs and technical configs
  /chainId.*arbitrum/gi,
  /rpc.*arbitrum/gi,
  /explorer.*arbitrum/gi,
  
  // File names and paths
  /arbitrum.*config/gi,
  /arbitrum.*service/gi,
  /arbitrum.*hook/gi,
  
  // Contract and address references
  /0x.*arbitrum/gi,
  /address.*arbitrum/gi,
  /contract.*arbitrum/gi,
];

let totalFilesProcessed = 0;
let totalReplacements = 0;

/**
 * Check if a file should be excluded from processing
 */
function shouldExcludeFile(filePath) {
  const excludeFiles = [
    'arbitrum',
    'config/arbitrum',
    'arbitrumSepolia',
    'web3.js'
  ];
  
  return excludeFiles.some(exclude => filePath.toLowerCase().includes(exclude.toLowerCase()));
}

/**
 * Check if content contains patterns that should be preserved
 */
function shouldPreserveContent(line) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Process a single file
 */
function processFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    console.log(`⏭️  Skipping: ${filePath} (excluded file)`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;

    // Process line by line to avoid replacing in excluded contexts
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      // Skip lines that should be preserved
      if (shouldPreserveContent(line)) {
        return line;
      }

      let newLine = line;
      
      // Apply replacement patterns
      REPLACEMENT_PATTERNS.forEach(({ pattern, replacement }) => {
        const matches = newLine.match(pattern);
        if (matches) {
          newLine = newLine.replace(pattern, replacement);
          fileReplacements += matches.length;
        }
      });

      return newLine;
    });

    newContent = newLines.join('\n');

    // Only write if there were changes
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Processed: ${filePath} (${fileReplacements} replacements)`);
      totalReplacements += fileReplacements;
    }

    totalFilesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Skip node_modules and other unwanted directories
      if (!item.startsWith('.') && item !== 'node_modules') {
        processDirectory(itemPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (FILE_EXTENSIONS.includes(ext)) {
        processFile(itemPath);
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Arbitrum to Stacks replacement...\n');

  TARGET_DIRS.forEach(dir => {
    console.log(`📁 Processing directory: ${dir}`);
    processDirectory(dir);
    console.log('');
  });

  console.log('📊 Summary:');
  console.log(`   Files processed: ${totalFilesProcessed}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log('✅ Arbitrum to Stacks replacement completed!');
  
  console.log('\n📝 Note: Technical configurations (URLs, chain IDs, configs) were preserved.');
  console.log('   Only user-facing text and network names were changed.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };