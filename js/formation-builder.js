// Formation Builder Core Logic
class FormationBuilder {
    constructor(config) {
        this.config = config;
        this.formations = config.formations;
        this.playerNames = {};
        this.init();
    }

    init() {
        this.loadFromURL();
        this.setupEventListeners();
        this.loadFormation();
        this.restoreNamesFromStorage();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadFormation();
            this.restoreNamesFromStorage();
        });
    }

    getLayerY(layerIndex, totalLayers, isMyTeam) {
        // Each team uses only their half of the field
        // My team (blue): bottom half (50-100%)
        // Away team (red): top half (0-50%)
        
        // Goalkeeper at the edge of their half
        if (layerIndex === 0) {
            return isMyTeam ? 95 : 5;  // My team GK at bottom, away GK at top
        }
        
        // Outfield players distributed in their half only
        const outfieldLayers = totalLayers - 1;
        const outfieldIndex = layerIndex - 1;
        
        let y;
        if (isMyTeam) {
            // My team (blue): bottom half only (55% to 85%)
            if (outfieldLayers === 1) {
                y = 70;
            } else {
                const spacing = 30 / (outfieldLayers - 1);
                y = 85 - (spacing * outfieldIndex);
            }
        } else {
            // Away team (red): top half only (15% to 45%) 
            if (outfieldLayers === 1) {
                y = 30;
            } else {
                const spacing = 30 / (outfieldLayers - 1);
                y = 15 + (spacing * outfieldIndex);
            }
        }
        
        return y;
    }

    createPlayer(x, y, position, team, index, sequentialIndex = null) {
        const player = document.createElement('div');
        player.className = `player ${team}`;
        player.style.left = x + '%';
        player.style.top = y + '%';
        
        const icon = document.createElement('div');
        icon.className = 'player-icon';
        
        const number = document.createElement('div');
        number.className = 'player-number';
        number.textContent = sequentialIndex !== null ? sequentialIndex + 1 : index + 1;
        
        const name = document.createElement('div');
        name.className = 'player-name';
        name.contentEditable = true;
        name.textContent = this.getPlayerName(team, sequentialIndex !== null ? sequentialIndex : index);
        
        name.addEventListener('blur', () => {
            this.savePlayerName(team, sequentialIndex !== null ? sequentialIndex : index, name.textContent);
        });
        
        name.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                name.blur();
            }
        });
        
        // Auto-select all text when clicked (like original)
        name.addEventListener('focus', () => {
            // Select all text when focused
            const range = document.createRange();
            range.selectNodeContents(name);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
        
        // Also select on click
        name.addEventListener('click', () => {
            const range = document.createRange();
            range.selectNodeContents(name);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
        
        icon.appendChild(number);
        player.appendChild(icon);
        player.appendChild(name);
        
        return player;
    }

    loadFormation() {
        const field = document.getElementById('field');
        const homeSelect = document.getElementById('myTeamFormation');
        const awaySelect = document.getElementById('awayTeamFormation');
        
        if (!field || !homeSelect) return;
        
        field.innerHTML = '';
        initializePitch();
        
        const homeFormation = this.formations[homeSelect.value];
        if (!homeFormation) return;
        
        // Always create home team
        this.createTeam(homeFormation, 'my-team', true);
        
        // Create away team based on config
        if (this.config.defaultAwayFormation) {
            // 11v11: Use away team selector or default
            const awayFormation = awaySelect ? 
                (this.formations[awaySelect.value] || homeFormation) : 
                this.config.defaultAwayFormation;
            this.createTeam(awayFormation, 'opp-team', false);
        }
    }

    createTeam(formation, teamClass, isMyTeam) {
        const field = document.getElementById('field');
        let sequentialIndex = 0;
        
        formation.forEach((layer, layerIndex) => {
            const layerY = this.getLayerY(layerIndex, formation.length, isMyTeam);
            const layerSize = layer.length;
            
            layer.forEach((x, playerIndex) => {
                // Adjust Y for wide players (push them forward slightly)
                let adjustedY = layerY;
                if (layerSize >= 3) {
                    const isWidePlayer = playerIndex === 0 || playerIndex === layerSize - 1;
                    if (isWidePlayer) {
                        // Push wide players 2% forward (towards opponent goal)
                        adjustedY = isMyTeam ? layerY - 2 : layerY + 2;
                    }
                }
                
                const player = this.createPlayer(x, adjustedY, `L${layerIndex}P${sequentialIndex}`, teamClass, sequentialIndex, sequentialIndex);
                field.appendChild(player);
                sequentialIndex++;
            });
        });
    }

    getPlayerX(playerIndex, layerSize) {
        if (layerSize === 1) return 50;
        
        // Increase spacing for smaller teams (6v6 and 7v7)
        let spread;
        if (this.config.gameType === '6v6') {
            spread = Math.min(80, layerSize * 25); // More spread for 6v6
        } else if (this.config.gameType === '7v7') {
            spread = Math.min(75, layerSize * 20); // More spread for 7v7
        } else {
            spread = Math.min(70, layerSize * 15); // Original for 11v11
        }
        
        const step = spread / (layerSize - 1);
        return 50 - spread/2 + playerIndex * step;
    }

    createPlayerInputs(containerId, formation, teamName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        let sequentialIndex = 0;
        
        formation.forEach((layer) => {
            layer.forEach(() => {
                const label = document.createElement('div');
                label.className = 'input-label';
                
                const number = document.createElement('span');
                number.className = 'input-number';
                number.textContent = `#${sequentialIndex + 1}`;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'player-input';
                input.value = this.getPlayerName(teamName, sequentialIndex);
                input.placeholder = `Player ${sequentialIndex + 1}`;
                
                input.addEventListener('input', () => {
                    this.savePlayerName(teamName, sequentialIndex, input.value);
                    this.updatePlayerDisplay(teamName, sequentialIndex, input.value);
                });
                
                label.appendChild(number);
                label.appendChild(input);
                container.appendChild(label);
                sequentialIndex++;
            });
        });
    }

    getPlayerName(team, index) {
        const key = `${team}_${index}`;
        if (this.playerNames[key]) {
            return this.playerNames[key];
        }
        
        // Default names for home team only
        if (team === 'my-team') {
            return this.config.defaultNames[index] || `Player ${index + 1}`;
        }
        
        // Away team: minimal placeholder that hints it's editable
        return '...';
    }

    savePlayerName(team, index, name) {
        const key = `${team}_${index}`;
        this.playerNames[key] = name;
        localStorage.setItem('playerNames', JSON.stringify(this.playerNames));
    }

    updatePlayerDisplay(team, index, name) {
        const players = document.querySelectorAll(`.${team} .player-name`);
        if (players[index]) {
            players[index].textContent = name;
        }
    }

    restoreNamesFromStorage() {
        const stored = localStorage.getItem('playerNames');
        if (stored) {
            this.playerNames = JSON.parse(stored);
        }
    }

    shareFormation() {
        const homeFormation = document.getElementById('myTeamFormation').value;
        const awayFormation = document.getElementById('awayTeamFormation')?.value || this.config.defaultAwayFormationKey;
        
        const data = {
            h: homeFormation,
            a: awayFormation,
            n: this.playerNames
        };
        
        const compressed = LZString.compressToBase64(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}?d=${compressed}`;
        
        this.shareURL(url);
    }

    shareURL(url) {
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            navigator.share({
                title: 'Football Formation',
                url: url
            });
        } else {
            this.copyToClipboard(url);
        }
    }

    copyToClipboard(url) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                alert('Formation link copied to clipboard!');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Formation link copied to clipboard!');
        }
    }

    loadFromURL() {
        const hash = window.location.hash;
        let compressed = null;
        
        // Support both old (#f=) and new (?d=) formats
        if (hash.startsWith('#f=')) {
            compressed = hash.substring(3);
        } else if (hash.startsWith('#formation=')) {
            compressed = hash.substring(11);
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            compressed = urlParams.get('d');
        }
        
        if (!compressed) return;
        
        try {
            const data = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
            
            if (data.h) {
                const homeSelect = document.getElementById('myTeamFormation');
                if (homeSelect) homeSelect.value = data.h;
            }
            
            if (data.a) {
                const awaySelect = document.getElementById('awayTeamFormation');
                if (awaySelect) awaySelect.value = data.a;
            }
            
            if (data.n) {
                this.playerNames = data.n;
                localStorage.setItem('playerNames', JSON.stringify(this.playerNames));
            }
            
            this.updateFormation();
        } catch (e) {
            console.error('Failed to load formation from URL:', e);
        }
    }

    async downloadImage() {
        const field = document.getElementById('field');
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        try {
            const canvas = await html2canvas(field, {
                backgroundColor: '#2d5a2d',
                scale: 2,
                width: field.offsetWidth,
                height: field.offsetHeight
            });
            
            this.downloadCanvas(canvas, `formation-${this.config.gameType}.png`);
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    downloadCanvas(canvas, filename) {
        if (/Mobi|Android/i.test(navigator.userAgent) && navigator.share) {
            canvas.toBlob(blob => {
                const file = new File([blob], filename, { type: 'image/png' });
                navigator.share({ files: [file] });
            });
        } else {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
    }
}
