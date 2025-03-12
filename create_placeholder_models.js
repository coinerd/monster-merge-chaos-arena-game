// Script to create placeholder GLB files for monster models
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'models', 'monsters');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// List of monster types
const monsterTypes = [
    'dragon',
    'slime',
    'golem',
    'demon',
    'drake',
    'hydra',
    'impling',
    'ogroid',
    'wraith'
];

// Create a placeholder GLB file for each monster type
function createPlaceholderGLBFiles() {
    console.log('Creating placeholder GLB files for all monster types...');
    
    // Create a minimal valid GLB file structure (empty model)
    // This is a minimal binary GLB structure that can be loaded by Three.js
    const placeholderGLB = Buffer.from([
        // GLB header (12 bytes)
        0x67, 0x6C, 0x54, 0x46, // magic: 'glTF'
        0x02, 0x00, 0x00, 0x00, // version: 2
        0x20, 0x00, 0x00, 0x00, // length: 32 bytes (header + 1 chunk)
        
        // JSON chunk header (8 bytes)
        0x10, 0x00, 0x00, 0x00, // JSON chunk length: 16 bytes
        0x4A, 0x53, 0x4F, 0x4E, // chunk type: 'JSON'
        
        // JSON chunk data (minimal valid glTF JSON)
        0x7B, 0x22, 0x61, 0x73, 0x73, 0x65, 0x74, 0x73, 0x22, 0x3A, 0x7B, 0x7D, 0x7D, 0x00, 0x00, 0x00 // {"assets":{}} + padding
    ]);
    
    // Write a placeholder file for each monster type
    for (const monsterType of monsterTypes) {
        const outputPath = path.join(outputDir, `${monsterType}.glb`);
        fs.writeFileSync(outputPath, placeholderGLB);
        console.log(`Created placeholder for ${monsterType}.glb`);
    }
    
    console.log('All placeholder GLB files created successfully!');
    console.log(`Files are located in: ${outputDir}`);
    console.log('Note: These are placeholder files. Use the generate_models.html web interface to create actual models.');
}

// Run the function
createPlaceholderGLBFiles();
