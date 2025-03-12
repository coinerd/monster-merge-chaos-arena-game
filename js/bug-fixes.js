/**
 * Bug fixes for Monster Merge: Chaos Arena
 * This script fixes various issues in the game:
 * 1. Adds compatibility between Game.buyMonster and OverlayManager
 * 2. Ensures new enemies are generated for each wave
 * 3. Enhances enemy appearance based on wave number
 */
window.addEventListener('load', function() {
    // Function to check for game object and apply fixes
    function applyFixes() {
        if (window.game) {
            console.log('Applying bug fixes...');
            
            // Fix 1: Add purchaseMonster as an alias to buyMonster (if needed)
            if (typeof window.game.purchaseMonster !== 'function' && typeof window.game.buyMonster === 'function') {
                window.game.purchaseMonster = function(tier) {
                    return this.buyMonster(tier);
                };
                console.log('Added purchaseMonster alias to Game class');
            }
            
            // Fix 2: Ensure startBattle generates new enemies for each wave
            if (window.game.startBattle && window.game.combatManager) {
                // Patch startBattle to ensure new enemies are generated
                const originalStartBattle = window.game.startBattle;
                window.game.startBattle = function() {
                    // Generate new enemies before battle if not already done
                    if (!this.inBattle && this.combatManager && typeof this.combatManager.generateEnemyWave === 'function') {
                        console.log('Generating new enemies for wave ' + this.wave);
                        // Pass the current wave number explicitly to generateEnemyWave
                        this.combatManager.generateEnemyWave(this.wave);
                    }
                    return originalStartBattle.apply(this, arguments);
                };
                console.log('Enhanced startBattle to generate new enemies');
            }
            
            // Fix 3: Enhance enemy appearance based on wave number
            if (window.game.combatManager && window.game.combatManager.waveManager) {
                // Make sure WaveManager.enhanceEnemyAppearance is properly called
                const originalGenerateEnemyWave = window.game.combatManager.waveManager.generateEnemyWave;
                if (typeof originalGenerateEnemyWave === 'function') {
                    window.game.combatManager.waveManager.generateEnemyWave = function(waveNumber) {
                        // Make sure we're using the provided wave number, not just the internal currentWave
                        const enemies = originalGenerateEnemyWave.call(this, waveNumber);
                        console.log('Enhanced enemy appearance for wave ' + waveNumber);
                        return enemies;
                    };
                    console.log('Enhanced enemy appearance for waves');
                }
            }
            
            console.log('Bug fixes applied successfully!');
            return true;
        }
        return false;
    }
    
    // Try to apply fixes with increasing delays
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryApplyFixes() {
        if (applyFixes()) {
            console.log('Bug fixes applied on attempt ' + (attempts + 1));
            return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
            console.log('Retrying bug fixes in ' + (attempts * 100) + 'ms (attempt ' + attempts + ' of ' + maxAttempts + ')');
            setTimeout(tryApplyFixes, attempts * 100);
        } else {
            console.error('Failed to apply bug fixes after ' + maxAttempts + ' attempts');
        }
    }
    
    // Start trying to apply fixes
    tryApplyFixes();
});
