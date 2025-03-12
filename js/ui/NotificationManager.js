/**
 * NotificationManager handles all notifications and confirmation dialogs
 */
class NotificationManager {
    constructor() {
        this.setupNotifications();
    }
    
    setupNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create confirmation dialog if it doesn't exist
        if (!document.getElementById('confirmation-overlay')) {
            const confirmationOverlay = document.createElement('div');
            confirmationOverlay.id = 'confirmation-overlay';
            confirmationOverlay.className = 'overlay hidden';
            
            const confirmationContent = document.createElement('div');
            confirmationContent.className = 'overlay-content';
            
            const confirmationMessage = document.createElement('div');
            confirmationMessage.id = 'confirmation-message';
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            
            const confirmButton = document.createElement('div');
            confirmButton.id = 'confirm-button';
            confirmButton.className = 'button';
            confirmButton.textContent = 'CONFIRM';
            
            const cancelButton = document.createElement('div');
            cancelButton.id = 'cancel-button';
            cancelButton.className = 'button';
            cancelButton.textContent = 'CANCEL';
            
            buttonContainer.appendChild(confirmButton);
            buttonContainer.appendChild(cancelButton);
            
            confirmationContent.appendChild(confirmationMessage);
            confirmationContent.appendChild(buttonContainer);
            confirmationOverlay.appendChild(confirmationContent);
            document.body.appendChild(confirmationOverlay);
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The notification type ('error', 'success', 'info')
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300); // match with CSS transition time
        }, 3000);
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Function to call if confirmed
     */
    showConfirmation(message, onConfirm) {
        const overlay = document.getElementById('confirmation-overlay');
        const messageElement = document.getElementById('confirmation-message');
        const confirmButton = document.getElementById('confirm-button');
        const cancelButton = document.getElementById('cancel-button');
        
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
        
        // Remove old event listeners
        const newConfirmButton = confirmButton.cloneNode(true);
        const newCancelButton = cancelButton.cloneNode(true);
        
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
        
        // Add new event listeners
        newConfirmButton.addEventListener('click', () => {
            overlay.classList.add('hidden');
            if (onConfirm) onConfirm();
        });
        
        newCancelButton.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }
}