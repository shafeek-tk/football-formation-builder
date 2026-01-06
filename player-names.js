// Universal Player Name Management System
class PlayerNameManager {
    constructor() {
        this.globalPlayerNames = {
            home: []
        };
        this.seedNames = {
            home: ['MBAPPE', 'HAALAND', 'MESSI', 'RONALDO', 'PEDRI', 'MODRIC', 'YAMAL', 'BELLINGHAM', 'SALAH', 'DE BRUYNE', 'NEYMAR']
        };
        this.initialize();
    }

    initialize() {
        // Priority: localStorage > seed names (removed URL params)
        const storedNames = this.getFromStorage();
        
        if (storedNames && storedNames.home) {
            this.globalPlayerNames.home = [...storedNames.home];
            if (storedNames.away) {
                this.globalPlayerNames.away = [...storedNames.away];
            }
        } else {
            // Initialize with seed names (already uppercase)
            this.globalPlayerNames.home = [...this.seedNames.home];
        }
    }

    loadFromPlayerIds(playerIdNames) {
        // Convert old playerId format to global arrays
        this.globalPlayerNames.home = [];
        
        // Extract names from player IDs and populate arrays
        Object.keys(playerIdNames).forEach(playerId => {
            if (playerId.includes('my-team')) {
                const index = parseInt(playerId.split('-').pop()) - 1;
                this.globalPlayerNames.home[index] = playerIdNames[playerId];
            }
        });
        
        // Fill gaps with seed names
        this.fillMissingNames();
    }

    fillMissingNames() {
        for (let i = 0; i < 11; i++) {
            if (!this.globalPlayerNames.home[i]) {
                this.globalPlayerNames.home[i] = this.seedNames.home[i % this.seedNames.home.length];
            }
        }
    }

    // Remove getFromURL method since we're not using URL parameters anymore

    getFromStorage() {
        const stored = localStorage.getItem('footballLineup_globalNames');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse stored names');
            }
        }
        return null;
    }

    getCurrentMode() {
        const path = window.location.pathname;
        if (path.includes('7s')) return '7v7';
        if (path.includes('6s')) return '6v6';
        return '11v11';
    }

    getPlayerCount() {
        const mode = this.getCurrentMode();
        return mode === '11v11' ? 11 : mode === '7v7' ? 7 : 6;
    }

    getName(playerId) {
        const isHome = playerId.includes('my-team');
        const index = parseInt(playerId.split('-').pop());
        
        if (isHome) {
            // For home team, return saved name or fallback to seed names
            return this.globalPlayerNames.home[index] || this.seedNames.home[index % this.seedNames.home.length] || `PLAYER ${index + 1}`;
        } else {
            // Return away team names if they exist
            return this.globalPlayerNames.away?.[index] || '';
        }
    }

    setName(playerId, name) {
        const isHome = playerId.includes('my-team');
        const index = parseInt(playerId.split('-').pop());
        
        if (isHome) {
            this.globalPlayerNames.home[index] = name.toUpperCase();
            this.saveToStorage();
        } else {
            // Initialize away team array if it doesn't exist
            if (!this.globalPlayerNames.away) {
                this.globalPlayerNames.away = [];
            }
            this.globalPlayerNames.away[index] = name.toUpperCase();
            this.saveToStorage();
        }
    }

    saveToStorage() {
        localStorage.setItem('footballLineup_globalNames', JSON.stringify(this.globalPlayerNames));
    }

    updatePlayerName(playerId, newName) {
        this.setName(playerId, newName);
        const playerElement = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerElement) {
            const nameElement = playerElement.querySelector('.player-name');
            if (nameElement) {
                nameElement.textContent = newName.toUpperCase();
            }
        }
    }

    editPlayerName(element) {
        const currentName = element.textContent;
        const playerId = element.getAttribute('data-player-id') || element.parentElement.getAttribute('data-player-id');
        const input = document.createElement('input');
        input.className = 'player-name-input';
        input.value = currentName;
        
        input.onblur = () => {
            const newName = input.value || currentName;
            element.textContent = newName.toUpperCase();
            element.style.display = 'block';
            input.remove();
            
            this.setName(playerId, newName);
            
            // Update corresponding input field
            if (playerId) {
                const inputField = document.querySelector(`input[data-player-id="${playerId}"]`);
                if (inputField) {
                    inputField.value = newName;
                }
            }
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Tab' && playerId) {
                e.preventDefault();
                input.blur();
                
                const currentTeam = playerId.split('-')[0] + '-' + playerId.split('-')[1];
                const allTeamPlayers = document.querySelectorAll(`[data-player-id^="${currentTeam}"] .player-name`);
                const currentIndex = Array.from(allTeamPlayers).indexOf(element);
                const nextIndex = (currentIndex + 1) % allTeamPlayers.length;
                
                setTimeout(() => {
                    this.editPlayerName(allTeamPlayers[nextIndex]);
                }, 50);
            }
        };
        
        element.style.display = 'none';
        element.parentNode.appendChild(input);
        input.focus();
        input.select();
    }

    switchMode(page) {
        // Just navigate to the page - localStorage will handle persistence
        window.location.href = page;
    }

    // Initialize player names for current mode
    initializeForCurrentMode() {
        // Ensure global arrays are initialized
        if (!this.globalPlayerNames.home.length) {
            this.globalPlayerNames.home = [...this.seedNames.home];
        }
        
        // Update all player elements with names
        document.querySelectorAll('[data-player-id]').forEach(element => {
            const playerId = element.getAttribute('data-player-id');
            const name = this.getName(playerId);
            
            const nameElement = element.querySelector('.player-name');
            if (nameElement) {
                nameElement.textContent = name ? name.toUpperCase() : '';
            }
        });
        
        // Update input fields
        document.querySelectorAll('input[data-player-id]').forEach(input => {
            const playerId = input.getAttribute('data-player-id');
            const name = this.getName(playerId);
            input.value = name || '';
        });
    }
}

// Global instance
window.playerNameManager = new PlayerNameManager();

// Global functions for backward compatibility
function updatePlayerName(playerId, newName) {
    window.playerNameManager.updatePlayerName(playerId, newName);
}

function editPlayerName(element) {
    window.playerNameManager.editPlayerName(element);
}

function switchMode(page) {
    window.playerNameManager.switchMode(page);
}

// Initialize names for current mode - call this after page loads
function initializePlayerNames() {
    window.playerNameManager.initializeForCurrentMode();
}
