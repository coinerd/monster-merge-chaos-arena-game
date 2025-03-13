/**
 * TextureManager handles the creation and management of textures for the game
 */
class TextureManager {
    constructor() {
        this.textures = {};
    }
    
    /**
     * Generate a grid texture with customizable properties
     * @param {number} size - Size of the texture in pixels
     * @param {string} primaryColor - Primary color of the grid (hex or CSS color)
     * @param {string} secondaryColor - Secondary color for grid details (hex or CSS color)
     * @param {string} highlightColor - Color for highlighted cells (hex or CSS color)
     * @param {number} lineWidth - Width of grid lines
     * @returns {THREE.Texture} The generated grid texture
     */
    generateGridTexture(size = 512, primaryColor = '#283655', secondaryColor = '#1e2747', highlightColor = '#4ade80', lineWidth = 4) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const context = canvas.getContext('2d');
        
        // Fill background with primary color
        context.fillStyle = primaryColor;
        context.fillRect(0, 0, size, size);
        
        // Draw grid pattern
        context.strokeStyle = secondaryColor;
        context.lineWidth = lineWidth;
        
        // Draw grid lines
        const cellSize = size / 8; // Divide into 8 sections for a more detailed texture
        
        // Draw vertical lines
        for (let i = 1; i < 8; i++) {
            const x = i * cellSize;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, size);
            context.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 1; i < 8; i++) {
            const y = i * cellSize;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(size, y);
            context.stroke();
        }
        
        // Add subtle gradient overlay
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        // Add subtle corner details
        const cornerSize = size / 16;
        context.fillStyle = secondaryColor;
        
        // Top-left corner
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(cornerSize, 0);
        context.lineTo(0, cornerSize);
        context.fill();
        
        // Top-right corner
        context.beginPath();
        context.moveTo(size, 0);
        context.lineTo(size - cornerSize, 0);
        context.lineTo(size, cornerSize);
        context.fill();
        
        // Bottom-left corner
        context.beginPath();
        context.moveTo(0, size);
        context.lineTo(cornerSize, size);
        context.lineTo(0, size - cornerSize);
        context.fill();
        
        // Bottom-right corner
        context.beginPath();
        context.moveTo(size, size);
        context.lineTo(size - cornerSize, size);
        context.lineTo(size, size - cornerSize);
        context.fill();
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        // Store the texture
        this.textures['grid'] = texture;
        
        return texture;
    }
    
    /**
     * Generate a highlighted version of the grid texture
     * @param {string} highlightColor - Color for highlighted cells
     * @returns {THREE.Texture} The generated highlight texture
     */
    generateHighlightTexture(highlightColor = '#4ade80') {
        // Create a canvas element
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const context = canvas.getContext('2d');
        
        // Fill background with highlight color
        context.fillStyle = highlightColor;
        context.fillRect(0, 0, size, size);
        
        // Add grid pattern (more subtle)
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 2;
        
        // Draw grid lines
        const cellSize = size / 8;
        
        // Draw vertical lines
        for (let i = 1; i < 8; i++) {
            const x = i * cellSize;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, size);
            context.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 1; i < 8; i++) {
            const y = i * cellSize;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(size, y);
            context.stroke();
        }
        
        // Add glow effect
        const gradient = context.createRadialGradient(size/2, size/2, size/4, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        // Store the texture
        this.textures['highlight'] = texture;
        
        return texture;
    }
    
    /**
     * Generate a texture for monster materials
     * @param {number} size - Size of the texture in pixels
     * @param {string} baseColor - Base color for the monster (hex or CSS color)
     * @param {Object} options - Additional options for texture generation
     * @returns {THREE.Texture} The generated monster texture
     */
    generateMonsterTexture(size = 512, baseColor = '#4ade80', options = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const context = canvas.getContext('2d');
        
        // Fill background with base color
        context.fillStyle = baseColor;
        context.fillRect(0, 0, size, size);
        
        // Add texture pattern based on monster type
        if (options.textureType === 'slime') {
            this.generateSlimeTexture(context, size, options);
        } else if (options.textureType === 'rocky') {
            this.generateRockyTexture(context, size, options);
        } else if (options.textureType === 'scaly') {
            this.generateScalyTexture(context, size, options);
        } else if (options.textureType === 'ghostly') {
            this.generateGhostlyTexture(context, size, options);
        } else {
            // Default texture pattern
            this.generateDefaultMonsterTexture(context, size, options);
        }
        
        // Add damage effects if monster is damaged
        if (options.damaged) {
            this.addDamageEffects(context, size, options);
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Store the texture with a unique key
        const textureKey = `monster_${options.tier || 'default'}_${options.textureType || 'default'}${options.damaged ? '_damaged_' + Math.floor(options.damageLevel * 10) : ''}`;
        this.textures[textureKey] = texture;
        
        return texture;
    }
    
    /**
     * Generate a slime-like texture pattern
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    generateSlimeTexture(context, size, options) {
        // Add bubble-like patterns for slime
        const bubbleCount = 30 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < bubbleCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 5 + Math.random() * 15;
            
            // Create bubble gradient
            const bubbleGradient = context.createRadialGradient(x, y, 0, x, y, radius);
            bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            bubbleGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
            bubbleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = bubbleGradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        // Add glossy highlight
        const glossGradient = context.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.6);
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = glossGradient;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Generate a rocky texture pattern
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    generateRockyTexture(context, size, options) {
        // Add cracks and texture for rocky appearance
        const crackCount = 15 + Math.floor(Math.random() * 10);
        
        context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        context.lineWidth = 1;
        
        for (let i = 0; i < crackCount; i++) {
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            
            context.beginPath();
            context.moveTo(startX, startY);
            
            // Create jagged crack line
            let x = startX;
            let y = startY;
            const segments = 3 + Math.floor(Math.random() * 5);
            
            for (let j = 0; j < segments; j++) {
                x += (Math.random() - 0.5) * size * 0.2;
                y += (Math.random() - 0.5) * size * 0.2;
                context.lineTo(x, y);
            }
            
            context.stroke();
        }
        
        // Add noise texture
        for (let x = 0; x < size; x += 4) {
            for (let y = 0; y < size; y += 4) {
                if (Math.random() > 0.5) {
                    context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
                    context.fillRect(x, y, 4, 4);
                }
            }
        }
    }
    
    /**
     * Generate a scaly texture pattern
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    generateScalyTexture(context, size, options) {
        // Create scale pattern
        const scaleSize = size / 20;
        const rows = Math.ceil(size / scaleSize);
        const cols = Math.ceil(size / scaleSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Offset every other row
                const offsetX = (row % 2) * (scaleSize / 2);
                const x = col * scaleSize + offsetX;
                const y = row * scaleSize;
                
                // Draw scale
                context.fillStyle = `rgba(0, 0, 0, 0.2)`;
                context.beginPath();
                context.arc(x, y, scaleSize / 2, 0, Math.PI);
                context.fill();
                
                // Add highlight to scales
                context.fillStyle = `rgba(255, 255, 255, 0.1)`;
                context.beginPath();
                context.arc(x, y, scaleSize / 3, 0, Math.PI);
                context.fill();
            }
        }
        
        // Add overall sheen
        const sheenGradient = context.createLinearGradient(0, 0, size, size);
        sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        sheenGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        context.fillStyle = sheenGradient;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Generate a ghostly texture pattern
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    generateGhostlyTexture(context, size, options) {
        // Create wispy, ethereal pattern
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        // Add swirling patterns
        const swirlCount = 5;
        
        for (let i = 0; i < swirlCount; i++) {
            const centerX = size * (0.3 + Math.random() * 0.4);
            const centerY = size * (0.3 + Math.random() * 0.4);
            const radius = size * (0.1 + Math.random() * 0.2);
            
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.lineWidth = 2;
            
            context.beginPath();
            for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
                const x = centerX + (radius * angle / (Math.PI * 2)) * Math.cos(angle);
                const y = centerY + (radius * angle / (Math.PI * 2)) * Math.sin(angle);
                
                if (angle === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            }
            context.stroke();
        }
    }
    
    /**
     * Generate a default texture pattern for monsters
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    generateDefaultMonsterTexture(context, size, options) {
        // Add subtle noise
        for (let x = 0; x < size; x += 4) {
            for (let y = 0; y < size; y += 4) {
                if (Math.random() > 0.8) {
                    context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
                    context.fillRect(x, y, 4, 4);
                }
            }
        }
        
        // Add gradient overlay
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Add damage effects to a monster texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Size of the texture
     * @param {Object} options - Additional options
     */
    addDamageEffects(context, size, options) {
        const damageLevel = options.damageLevel || 0.5; // 0-1 scale, higher = more damage
        
        // Add cracks
        const crackCount = Math.floor(10 * damageLevel) + 5;
        
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.lineWidth = 2;
        
        for (let i = 0; i < crackCount; i++) {
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            
            context.beginPath();
            context.moveTo(startX, startY);
            
            // Create jagged crack line
            let x = startX;
            let y = startY;
            const segments = 3 + Math.floor(Math.random() * 5);
            
            for (let j = 0; j < segments; j++) {
                x += (Math.random() - 0.5) * size * 0.2;
                y += (Math.random() - 0.5) * size * 0.2;
                context.lineTo(x, y);
            }
            
            context.stroke();
        }
        
        // Add scorch marks/burns
        const burnCount = Math.floor(5 * damageLevel);
        
        for (let i = 0; i < burnCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 10 + Math.random() * 30;
            
            const burnGradient = context.createRadialGradient(x, y, 0, x, y, radius);
            burnGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
            burnGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
            burnGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            context.fillStyle = burnGradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        // Add overall darkening effect
        context.fillStyle = `rgba(0, 0, 0, ${damageLevel * 0.3})`;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Generate a button texture for UI elements
     * @param {number} width - Width of the texture in pixels
     * @param {number} height - Height of the texture in pixels
     * @param {string} baseColor - Base color for the button (hex or CSS color)
     * @param {Object} options - Additional options for texture generation
     * @returns {HTMLCanvasElement} The generated button texture canvas
     */
    generateButtonTexture(width = 200, height = 60, baseColor = '#e94560', options = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const context = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, 0, height);
        const lighterColor = this.lightenColor(baseColor, 20);
        const darkerColor = this.darkenColor(baseColor, 20);
        
        gradient.addColorStop(0, lighterColor);
        gradient.addColorStop(1, darkerColor);
        
        // Draw rounded rectangle
        const radius = height / 3;
        context.fillStyle = gradient;
        this.roundRect(context, 0, 0, width, height, radius, true, false);
        
        // Add highlight at the top
        const highlightGradient = context.createLinearGradient(0, 0, 0, height / 2);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = highlightGradient;
        this.roundRect(context, 2, 2, width - 4, height / 2 - 2, radius - 2, true, false);
        
        // Add subtle border
        context.strokeStyle = darkerColor;
        context.lineWidth = 2;
        this.roundRect(context, 1, 1, width - 2, height - 2, radius - 1, false, true);
        
        // Add text if provided
        if (options.text) {
            context.font = options.fontSize ? `bold ${options.fontSize}px Arial` : `bold ${height / 2}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = options.textColor || '#ffffff';
            
            // Add text shadow
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            
            context.fillText(options.text, width / 2, height / 2);
            
            // Reset shadow
            context.shadowColor = 'transparent';
        }
        
        // Store the canvas element for later use
        const buttonKey = `button_${baseColor.replace('#', '')}_${width}x${height}`;
        this.textures[buttonKey] = canvas;
        
        return canvas;
    }
    
    /**
     * Generate a hover state for a button
     * @param {number} width - Width of the texture in pixels
     * @param {number} height - Height of the texture in pixels
     * @param {string} baseColor - Base color for the button (hex or CSS color)
     * @param {Object} options - Additional options for texture generation
     * @returns {HTMLCanvasElement} The generated button hover texture canvas
     */
    generateButtonHoverTexture(width = 200, height = 60, baseColor = '#e94560', options = {}) {
        // Create a brighter version of the button
        const brighterColor = this.lightenColor(baseColor, 40);
        
        // Generate the button with the brighter color
        const canvas = this.generateButtonTexture(width, height, brighterColor, options);
        
        // Add glow effect
        const context = canvas.getContext('2d');
        
        // Store the hover texture
        const buttonKey = `button_hover_${baseColor.replace('#', '')}_${width}x${height}`;
        this.textures[buttonKey] = canvas;
        
        return canvas;
    }
    
    /**
     * Generate an active/pressed state for a button
     * @param {number} width - Width of the texture in pixels
     * @param {number} height - Height of the texture in pixels
     * @param {string} baseColor - Base color for the button (hex or CSS color)
     * @param {Object} options - Additional options for texture generation
     * @returns {HTMLCanvasElement} The generated button active texture canvas
     */
    generateButtonActiveTexture(width = 200, height = 60, baseColor = '#e94560', options = {}) {
        // Create a darker version of the button
        const darkerColor = this.darkenColor(baseColor, 20);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const context = canvas.getContext('2d');
        
        // Create inverted gradient (darker at top)
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, darkerColor);
        gradient.addColorStop(1, baseColor);
        
        // Draw rounded rectangle
        const radius = height / 3;
        context.fillStyle = gradient;
        this.roundRect(context, 0, 0, width, height, radius, true, false);
        
        // Add subtle inner shadow
        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
        context.shadowBlur = 5;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 1;
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        this.roundRect(context, 3, 3, width - 6, height - 6, radius - 3, true, false);
        
        // Reset shadow
        context.shadowColor = 'transparent';
        
        // Add subtle border
        context.strokeStyle = this.darkenColor(darkerColor, 20);
        context.lineWidth = 2;
        this.roundRect(context, 1, 1, width - 2, height - 2, radius - 1, false, true);
        
        // Add text if provided
        if (options.text) {
            context.font = options.fontSize ? `bold ${options.fontSize}px Arial` : `bold ${height / 2}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = options.textColor || '#ffffff';
            
            // Offset text slightly to give pressed effect
            context.fillText(options.text, width / 2 + 1, height / 2 + 1);
        }
        
        // Store the active texture
        const buttonKey = `button_active_${baseColor.replace('#', '')}_${width}x${height}`;
        this.textures[buttonKey] = canvas;
        
        return canvas;
    }
    
    /**
     * Helper function to draw rounded rectangles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {number} radius - Corner radius
     * @param {boolean} fill - Whether to fill the rectangle
     * @param {boolean} stroke - Whether to stroke the rectangle
     */
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) {
            ctx.fill();
        }
        
        if (stroke) {
            ctx.stroke();
        }
    }
    
    /**
     * Helper function to lighten a color
     * @param {string} color - Color in hex format
     * @param {number} percent - Percentage to lighten
     * @returns {string} Lightened color in hex format
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
    
    /**
     * Helper function to darken a color
     * @param {string} color - Color in hex format
     * @param {number} percent - Percentage to darken
     * @returns {string} Darkened color in hex format
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
            (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
            (B > 0 ? (B < 255 ? B : 255) : 0)
        ).toString(16).slice(1);
    }
    
    /**
     * Apply button textures to HTML elements
     * @param {string} selector - CSS selector for buttons
     * @param {string} baseColor - Base color for buttons
     */
    applyButtonTextures(selector, baseColor = '#e94560') {
        const buttons = document.querySelectorAll(selector);
        
        buttons.forEach(button => {
            const width = button.offsetWidth;
            const height = button.offsetHeight;
            const text = button.textContent.trim();
            
            // Generate button textures
            const normalTexture = this.generateButtonTexture(width, height, baseColor, { text });
            const hoverTexture = this.generateButtonHoverTexture(width, height, baseColor, { text });
            const activeTexture = this.generateButtonActiveTexture(width, height, baseColor, { text });
            
            // Set background images
            button.style.backgroundImage = `url(${normalTexture.toDataURL()})`;
            button.style.backgroundSize = '100% 100%';
            button.style.color = 'transparent'; // Hide original text
            
            // Add hover and active state handlers
            button.addEventListener('mouseenter', () => {
                button.style.backgroundImage = `url(${hoverTexture.toDataURL()})`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundImage = `url(${normalTexture.toDataURL()})`;
            });
            
            button.addEventListener('mousedown', () => {
                button.style.backgroundImage = `url(${activeTexture.toDataURL()})`;
            });
            
            button.addEventListener('mouseup', () => {
                button.style.backgroundImage = `url(${hoverTexture.toDataURL()})`;
            });
        });
    }
    
    /**
     * Get a texture by name
     * @param {string} name - Name of the texture
     * @returns {THREE.Texture|null} The requested texture or null if not found
     */
    getTexture(name) {
        return this.textures[name] || null;
    }
    
    /**
     * Dispose of all textures to free memory
     */
    dispose() {
        for (const name in this.textures) {
            if (this.textures[name] && this.textures[name].dispose) {
                this.textures[name].dispose();
            }
        }
        this.textures = {};
    }
}
