// Script to generate GLB files for monster models
// This uses Three.js and Node.js to create the models

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'models', 'monsters');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Monster color mapping
const monsterColors = {
    dragon: 0xff0000,   // Red
    slime: 0x00ff00,    // Green
    golem: 0x8b4513,    // Brown
    demon: 0x800080,    // Purple
    drake: 0xffa500,    // Orange
    hydra: 0x00ffff,    // Cyan
    impling: 0xffff00,  // Yellow
    ogroid: 0x008000,   // Dark Green
    wraith: 0x000080    // Navy Blue
};

// Generate a dragon model
function generateDragon() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.ConeGeometry(1, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.dragon });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.dragon });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.2, 0);
    group.add(head);
    
    // Wings
    const wingGeometry = new THREE.ConeGeometry(0.8, 1.5, 4);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.dragon });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.rotation.z = Math.PI / 4;
    leftWing.position.set(-0.8, 0, 0);
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.rotation.z = -Math.PI / 4;
    rightWing.position.set(0.8, 0, 0);
    group.add(rightWing);
    
    return group;
}

// Generate a slime model
function generateSlime() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.SphereGeometry(1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: monsterColors.slime, 
        transparent: true, 
        opacity: 0.8 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.7, 1);
    group.add(body);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.7);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.7);
    group.add(rightEye);
    
    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.3, 0.3, 0.85);
    group.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.3, 0.3, 0.85);
    group.add(rightPupil);
    
    return group;
}

// Generate a golem model
function generateGolem() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 1.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.golem });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.golem });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.25, 0);
    group.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
    const armMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.golem });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1, 0, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1, 0, 0);
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.golem });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.5, -1.25, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.5, -1.25, 0);
    group.add(rightLeg);
    
    return group;
}

// Generate a demon model
function generateDemon() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.ConeGeometry(1, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.demon });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.demon });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.2, 0);
    group.add(head);
    
    // Horns
    const hornGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.3, 1.6, 0);
    leftHorn.rotation.z = -Math.PI / 6;
    group.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.3, 1.6, 0);
    rightHorn.rotation.z = Math.PI / 6;
    group.add(rightHorn);
    
    // Wings
    const wingGeometry = new THREE.PlaneGeometry(1.5, 1);
    const wingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-1, 0, 0);
    leftWing.rotation.y = Math.PI / 4;
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(1, 0, 0);
    rightWing.rotation.y = -Math.PI / 4;
    group.add(rightWing);
    
    return group;
}

// Generate a drake model
function generateDrake() {
    const group = new THREE.Group();
    
    // Body (smaller than dragon)
    const bodyGeometry = new THREE.ConeGeometry(0.7, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.drake });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.drake });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.9, 0);
    group.add(head);
    
    // Snout
    const snoutGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.drake });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 0.9, 0.4);
    snout.rotation.x = -Math.PI / 2;
    group.add(snout);
    
    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.2, 0.05, 1.5, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.drake });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -1, 0);
    tail.rotation.x = Math.PI / 2;
    group.add(tail);
    
    return group;
}

// Generate a hydra model
function generateHydra() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.hydra });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Heads (multiple)
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.hydra });
    
    // Create 5 heads in a circular pattern
    for (let i = 0; i < 5; i++) {
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 1, 8),
            headMaterial
        );
        const angle = (i / 5) * Math.PI * 2;
        neck.position.set(Math.cos(angle) * 0.5, 1.2, Math.sin(angle) * 0.5);
        
        // Rotate the neck to point outward
        neck.rotation.x = Math.PI / 4;
        neck.rotation.z = -angle;
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.6, 0);
        neck.add(head);
        
        group.add(neck);
    }
    
    return group;
}

// Generate an impling model
function generateImpling() {
    const group = new THREE.Group();
    
    // Body (small)
    const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.impling });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 1.2, 0.8);
    group.add(body);
    
    // Head (larger relative to body)
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.impling });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.6, 0);
    group.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.7, 0.3);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.7, 0.3);
    group.add(rightEye);
    
    // Ears (pointed)
    const earGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
    const earMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.impling });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.25, 0.9, 0);
    leftEar.rotation.z = -Math.PI / 6;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.25, 0.9, 0);
    rightEar.rotation.z = Math.PI / 6;
    group.add(rightEar);
    
    // Wings (small)
    const wingGeometry = new THREE.PlaneGeometry(0.8, 0.6);
    const wingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffcc00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.4, 0.2, -0.1);
    leftWing.rotation.y = Math.PI / 4;
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.4, 0.2, -0.1);
    rightWing.rotation.y = -Math.PI / 4;
    group.add(rightWing);
    
    return group;
}

// Generate an ogroid model
function generateOgroid() {
    const group = new THREE.Group();
    
    // Body (large and bulky)
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.ogroid });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Head (small relative to body)
    const headGeometry = new THREE.SphereGeometry(0.7, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.ogroid });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.5, 0);
    head.scale.set(1, 0.8, 1);
    group.add(head);
    
    // Jaw
    const jawGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.5);
    const jawMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.ogroid });
    const jaw = new THREE.Mesh(jawGeometry, jawMaterial);
    jaw.position.set(0, 1.2, 0.3);
    group.add(jaw);
    
    // Arms (very large)
    const armGeometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
    const armMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.ogroid });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.3, 0, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.3, 0, 0);
    group.add(rightArm);
    
    // Legs (thick)
    const legGeometry = new THREE.BoxGeometry(0.7, 1.2, 0.7);
    const legMaterial = new THREE.MeshStandardMaterial({ color: monsterColors.ogroid });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.5, -1.35, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.5, -1.35, 0);
    group.add(rightLeg);
    
    return group;
}

// Generate a wraith model
function generateWraith() {
    const group = new THREE.Group();
    
    // Main body (ghostly)
    const bodyGeometry = new THREE.ConeGeometry(1, 2.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: monsterColors.wraith,
        transparent: true,
        opacity: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    group.add(body);
    
    // Head/face area
    const headGeometry = new THREE.SphereGeometry(0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: monsterColors.wraith,
        transparent: true,
        opacity: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.8, 0);
    group.add(head);
    
    // Eyes (glowing)
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.8, 0.3);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.8, 0.3);
    group.add(rightEye);
    
    // Wispy tendrils
    const tendrilGeometry = new THREE.CylinderGeometry(0.05, 0.02, 1, 4);
    const tendrilMaterial = new THREE.MeshStandardMaterial({ 
        color: monsterColors.wraith,
        transparent: true,
        opacity: 0.5
    });
    
    // Add several tendrils around the bottom
    for (let i = 0; i < 5; i++) {
        const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial);
        const angle = (i / 5) * Math.PI * 2;
        tendril.position.set(
            Math.cos(angle) * 0.5,
            -1,
            Math.sin(angle) * 0.5
        );
        tendril.rotation.x = Math.PI / 6;
        tendril.rotation.z = Math.random() * Math.PI / 4;
        group.add(tendril);
    }
    
    return group;
}

// Map of monster generators
const monsterGenerators = {
    dragon: generateDragon,
    slime: generateSlime,
    golem: generateGolem,
    demon: generateDemon,
    drake: generateDrake,
    hydra: generateHydra,
    impling: generateImpling,
    ogroid: generateOgroid,
    wraith: generateWraith
};

// Function to export a model to GLB
async function exportToGLB(model, monsterType) {
    const exporter = new GLTFExporter();
    
    return new Promise((resolve, reject) => {
        exporter.parse(model, (gltf) => {
            const outputPath = path.join(outputDir, `${monsterType}.glb`);
            fs.writeFileSync(outputPath, Buffer.from(gltf));
            console.log(`Exported ${monsterType}.glb`);
            resolve();
        }, { binary: true });
    });
}

// Generate and export all models
async function generateAllModels() {
    console.log('Generating all monster models...');
    
    // Create a scene for each monster
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Process each monster type
    for (const [monsterType, generatorFn] of Object.entries(monsterGenerators)) {
        console.log(`Generating ${monsterType} model...`);
        
        // Clear previous models
        while (scene.children.length > 2) { // Keep lights
            scene.remove(scene.children[2]);
        }
        
        // Generate the model and add to scene
        const model = generatorFn();
        scene.add(model);
        
        // Export the model
        await exportToGLB(scene, monsterType);
    }
    
    console.log('All models generated successfully!');
}

// Run the generator
generateAllModels().catch(console.error);
