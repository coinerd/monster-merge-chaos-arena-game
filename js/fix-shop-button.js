/**
 * Fix for the Shop button functionality
 * This script adds the missing purchaseMonster method to the Game class
 * to make it compatible with the OverlayManager's expectations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the game to be initialized
    setTimeout(() => {
        if (window.game) {
            // Add the purchaseMonster method as an alias to buyMonster
            window.game.purchaseMonster = function(tier) {
                return this.buyMonster(tier);
            };
            
            console.log('Shop button functionality fixed!');
        }
    }, 1000);
});
