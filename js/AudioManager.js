/**
 * AudioManager handles all game audio and sound effects
 */
class AudioManager {
    constructor() {
        // Initialize audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Audio buffers
        this.buffers = new Map();
        
        // Active sounds
        this.activeSounds = new Set();
        
        // Master volume
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.connect(this.audioContext.destination);
        
        // Volume settings
        this.settings = {
            master: 1.0,
            music: 0.5,
            sfx: 0.7
        };
        
        // Background music
        this.musicTrack = null;
        this.musicVolume = this.audioContext.createGain();
        this.musicVolume.connect(this.masterVolume);
        
        // SFX volume
        this.sfxVolume = this.audioContext.createGain();
        this.sfxVolume.connect(this.masterVolume);
        
        // Update volume nodes
        this.updateVolumes();
    }
    
    /**
     * Load an audio file
     * @param {string} name - Name to reference the sound
     * @param {string} url - URL of the audio file
     * @returns {Promise} Promise that resolves when the audio is loaded
     */
    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} name - Name of the sound to play
     * @param {Object} options - Playback options
     * @returns {Object} Sound object with controls
     */
    playSound(name, options = {}) {
        const {
            volume = 1,
            loop = false,
            pitch = 1,
            pan = 0
        } = options;
        
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`Sound ${name} not found`);
            return null;
        }
        
        // Create nodes
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const pannerNode = this.audioContext.createStereoPanner();
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.sfxVolume);
        
        // Configure source
        source.buffer = buffer;
        source.loop = loop;
        source.playbackRate.value = pitch;
        
        // Configure volume and panning
        gainNode.gain.value = volume;
        pannerNode.pan.value = pan;
        
        // Start playback
        source.start(0);
        
        // Create sound object
        const sound = {
            source,
            gainNode,
            pannerNode,
            stop: () => {
                try {
                    source.stop();
                } catch (error) {
                    // Ignore errors if sound already stopped
                }
            },
            setVolume: (value) => {
                gainNode.gain.value = value;
            },
            setPan: (value) => {
                pannerNode.pan.value = value;
            },
            setPitch: (value) => {
                source.playbackRate.value = value;
            }
        };
        
        // Add to active sounds
        this.activeSounds.add(sound);
        
        // Remove from active sounds when finished
        source.onended = () => {
            this.activeSounds.delete(sound);
            source.disconnect();
            gainNode.disconnect();
            pannerNode.disconnect();
        };
        
        return sound;
    }
    
    /**
     * Play background music
     * @param {string} name - Name of the music track
     * @param {Object} options - Playback options
     */
    playMusic(name, options = {}) {
        const {
            fadeIn = 1,
            volume = 1
        } = options;
        
        // Stop current music
        if (this.musicTrack) {
            this.stopMusic();
        }
        
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`Music track ${name} not found`);
            return;
        }
        
        // Create and configure source
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.musicVolume);
        
        // Fade in
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + fadeIn
        );
        
        // Start playback
        source.start(0);
        
        // Store music track
        this.musicTrack = {
            source,
            gainNode,
            volume
        };
    }
    
    /**
     * Stop background music
     * @param {number} fadeOut - Fade out duration in seconds
     */
    stopMusic(fadeOut = 1) {
        if (this.musicTrack) {
            const { source, gainNode, volume } = this.musicTrack;
            
            // Fade out
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + fadeOut
            );
            
            // Stop and cleanup after fade
            setTimeout(() => {
                source.stop();
                source.disconnect();
                gainNode.disconnect();
                this.musicTrack = null;
            }, fadeOut * 1000);
        }
    }
    
    /**
     * Update volume settings
     * @param {Object} newSettings - New volume settings
     */
    updateVolumes(newSettings = {}) {
        // Update settings
        Object.assign(this.settings, newSettings);
        
        // Update volume nodes
        this.masterVolume.gain.value = this.settings.master;
        this.musicVolume.gain.value = this.settings.music;
        this.sfxVolume.gain.value = this.settings.sfx;
    }
    
    /**
     * Stop all sounds
     */
    stopAllSounds() {
        // Stop all active sounds
        for (const sound of this.activeSounds) {
            sound.stop();
        }
        this.activeSounds.clear();
        
        // Stop music
        this.stopMusic(0);
    }
    
    /**
     * Resume audio context if suspended
     */
    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Play a combat sound
     * @param {string} type - Type of combat sound
     * @param {Object} options - Sound options
     */
    playCombatSound(type, options = {}) {
        switch (type) {
            case 'attack':
                this.playSound('attack', {
                    volume: 0.6,
                    pitch: 1 + (Math.random() * 0.2 - 0.1),
                    ...options
                });
                break;
            case 'hit':
                this.playSound('hit', {
                    volume: 0.5,
                    pitch: 1 + (Math.random() * 0.2 - 0.1),
                    ...options
                });
                break;
            case 'death':
                this.playSound('death', {
                    volume: 0.7,
                    ...options
                });
                break;
        }
    }
    
    /**
     * Play a UI sound
     * @param {string} type - Type of UI sound
     * @param {Object} options - Sound options
     */
    playUISound(type, options = {}) {
        switch (type) {
            case 'click':
                this.playSound('click', {
                    volume: 0.4,
                    ...options
                });
                break;
            case 'hover':
                this.playSound('hover', {
                    volume: 0.2,
                    ...options
                });
                break;
            case 'purchase':
                this.playSound('purchase', {
                    volume: 0.5,
                    ...options
                });
                break;
            case 'error':
                this.playSound('error', {
                    volume: 0.4,
                    ...options
                });
                break;
        }
    }
    
    /**
     * Play a monster sound
     * @param {string} type - Type of monster sound
     * @param {Object} options - Sound options
     */
    playMonsterSound(type, options = {}) {
        switch (type) {
            case 'spawn':
                this.playSound('monster_spawn', {
                    volume: 0.5,
                    pitch: 1 + (Math.random() * 0.2 - 0.1),
                    ...options
                });
                break;
            case 'merge':
                this.playSound('monster_merge', {
                    volume: 0.6,
                    ...options
                });
                break;
            case 'upgrade':
                this.playSound('monster_upgrade', {
                    volume: 0.6,
                    ...options
                });
                break;
        }
    }
}