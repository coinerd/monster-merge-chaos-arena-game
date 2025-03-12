/**
 * Bug fixes for Monster Merge: Chaos Arena
 * This script fixes various issues in the game:
 * 1. Adds compatibility between Game.buyMonster and OverlayManager (already fixed in OverlayManager.js)
 * 2. Fixes the CombatManager method name issue (setCurrentWave vs setWave)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the game to be initialized
    setTimeout(() => {
        if (window.game) {
            console.log('Applying bug fixes...');
            
            // Fix 1: Add purchaseMonster as an alias to buyMonster (backup in case OverlayManager fix doesn't work)
            if (typeof window.game.purchaseMonster !== 'function' && typeof window.game.buyMonster === 'function') {
                window.game.purchaseMonster = function(tier) {
                    return this.buyMonster(tier);
                };
                console.log('Added purchaseMonster alias to Game class');
            }
            
            // Fix 2: Add setCurrentWave as an alias to setWave in CombatManager
            if (window.game.combatManager) {
                const originalSetWave = window.game.combatManager.setWave;
                window.game.combatManager.setCurrentWave = function(wave) {
                    console.log('Using setCurrentWave alias for setWave');
                    return originalSetWave.call(this, wave);
                };
                console.log('Added setCurrentWave alias to CombatManager');
            }
            
            // Fix 3: Patch the initialize method to avoid the error
            const originalInitialize = window.game.initialize;
            window.game.initialize = function() {
                try {
                    originalInitialize.call(this);
                } catch (error) {
                    console.error('Error in initialize method:', error);
                    
                    // Try to recover from the error
                    if (!this.gameState) {
                        this.gameState = { wave: 1, coins: 100 };
                    }
                    
                    // Make sure UI is updated
                    if (this.uiManager) {
                        this.uiManager.updateMoneyDisplay(this.gameState.coins || 100);
                        this.uiManager.updateWaveDisplay(this.gameState.wave || 1);
                    }
                    
                    // Set the wave properly
                    if (this.combatManager && typeof this.combatManager.setWave === 'function') {
                        this.combatManager.setWave(this.gameState.wave || 1);
                    }
                }
            };
            
            console.log('Bug fixes applied successfully!');
        } else {
            console.error('Game object not found, bug fixes not applied');
        }
    }, 1000);
});
