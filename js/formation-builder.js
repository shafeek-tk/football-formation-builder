// Formation Builder Core Logic
class FormationBuilder {
    constructor(config) {
        this.config = config;
        this.formations = config.formations;
        this.playerNames = {};
        this.mode = 'edit';
        this.selectedPlayer = null;
        this.init();
    }

    init() {
        this.restoreNamesFromStorage();
        this.loadFromURL(); // Load URL after storage so URL takes priority
        this.setupEventListeners();
        this.createInteractionToggle();
        this.loadFormation();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadFormation();
            this.restoreNamesFromStorage();
        });
    }

    createInteractionToggle() {
        const container = document.getElementById('interactionToggleContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="interaction-toggle">
                <button class="toggle-pill active" data-mode="edit">EDIT NAMES</button>
                <button class="toggle-pill" data-mode="swap">SWAP PLAYERS</button>
            </div>
            <div class="interaction-hint">Click on player names to edit them directly</div>
        `;

        container.querySelectorAll('.toggle-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.mode === this.mode) return;
                this.toggleMode();
            });
        });
    }

    toggleMode() {
        this.mode = this.mode === 'edit' ? 'swap' : 'edit';
        const field = document.getElementById('field');
        const pills = document.querySelectorAll('.toggle-pill');
        const hint = document.querySelector('.interaction-hint');

        // Update toggle pills
        pills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.mode === this.mode);
        });

        // Update field class
        if (field) {
            field.classList.toggle('swap-mode', this.mode === 'swap');
        }

        // Toggle contentEditable on all player names
        document.querySelectorAll('.player-name').forEach(el => {
            el.contentEditable = this.mode === 'edit';
        });

        // Clear any selection when switching modes
        this.deselectPlayer();

        // Update hint text
        if (hint) {
            hint.textContent = this.mode === 'edit'
                ? 'Click on player names to edit them directly'
                : 'Tap a player, then tap another to swap them';
        }
    }

    handlePlayerTap(playerElement) {
        if (this.mode !== 'swap') return;

        if (!this.selectedPlayer) {
            this.selectPlayer(playerElement);
        } else if (this.selectedPlayer === playerElement) {
            this.deselectPlayer();
        } else {
            this.executeSwap(this.selectedPlayer, playerElement);
        }
    }

    selectPlayer(playerElement) {
        this.deselectPlayer();
        this.selectedPlayer = playerElement;
        playerElement.classList.add('swap-selected');
        const hint = document.querySelector('.interaction-hint');
        if (hint) hint.textContent = 'Now tap another player to swap';
    }

    deselectPlayer() {
        if (this.selectedPlayer) {
            this.selectedPlayer.classList.remove('swap-selected');
        }
        this.selectedPlayer = null;
        const hint = document.querySelector('.interaction-hint');
        if (hint && this.mode === 'swap') {
            hint.textContent = 'Tap a player, then tap another to swap them';
        }
    }

    executeSwap(playerA, playerB) {
        const teamA = playerA.dataset.team;
        const indexA = playerA.dataset.index;
        const teamB = playerB.dataset.team;
        const indexB = playerB.dataset.index;

        const keyA = `${teamA}_${indexA}`;
        const keyB = `${teamB}_${indexB}`;

        const nameA = this.playerNames[keyA] || this.getPlayerName(teamA, parseInt(indexA));
        const nameB = this.playerNames[keyB] || this.getPlayerName(teamB, parseInt(indexB));

        // Swap in data store
        this.playerNames[keyA] = nameB;
        this.playerNames[keyB] = nameA;
        localStorage.setItem('playerNames', JSON.stringify(this.playerNames));

        const nameElA = playerA.querySelector('.player-name');
        const nameElB = playerB.querySelector('.player-name');

        // Phase 1: Fly out (names shrink + fade + slide up)
        playerA.classList.add('swap-fly-out');
        playerB.classList.add('swap-fly-out');

        // Phase 2: Swap text while invisible, then fly in
        setTimeout(() => {
            nameElA.textContent = nameB;
            nameElB.textContent = nameA;
            playerA.classList.remove('swap-fly-out');
            playerB.classList.remove('swap-fly-out');
            playerA.classList.add('swap-fly-in');
            playerB.classList.add('swap-fly-in');

            // Haptic feedback
            navigator.vibrate?.(50);

            // Phase 3: Flash green on land
            setTimeout(() => {
                playerA.classList.remove('swap-fly-in');
                playerB.classList.remove('swap-fly-in');
                playerA.classList.add('swap-complete');
                playerB.classList.add('swap-complete');

                setTimeout(() => {
                    playerA.classList.remove('swap-complete');
                    playerB.classList.remove('swap-complete');
                }, 400);
            }, 350);
        }, 250);

        this.deselectPlayer();
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
        
        let range, startPos;
        if (this.config.gameType === '5v5') {
            range = 18;
            startPos = isMyTeam ? 80 : 20;
        } else if (outfieldLayers >= 3) {
            range = 24;
            startPos = isMyTeam ? 82 : 18;
        } else {
            range = 27;
            startPos = isMyTeam ? 85 : 15;
        }
        
        let y;
        if (isMyTeam) {
            if (outfieldLayers === 1) {
                y = 70;
            } else {
                const spacing = range / (outfieldLayers - 1);
                y = startPos - (spacing * outfieldIndex);
            }
        } else {
            if (outfieldLayers === 1) {
                y = 30;
            } else {
                const spacing = range / (outfieldLayers - 1);
                y = startPos + (spacing * outfieldIndex);
            }
        }
        
        return y;
    }

    createPlayer(x, y, position, team, index, sequentialIndex = null) {
        const player = document.createElement('div');
        player.className = `player ${team}`;
        player.style.left = x + '%';
        player.style.top = y + '%';
        player.dataset.team = team;
        player.dataset.index = sequentialIndex !== null ? sequentialIndex : index;
        
        const icon = document.createElement('div');
        icon.className = 'player-icon';
        icon.innerHTML = `<svg class="jersey" viewBox="0 0 24 24" aria-hidden="true"><path class="jersey-body" d="${JERSEY_BODY_PATH}"/><path class="jersey-trim" d="${JERSEY_TRIM_PATH}"/></svg>`;
        
        const number = document.createElement('div');
        number.className = 'player-number';
        number.textContent = sequentialIndex !== null ? sequentialIndex + 1 : index + 1;
        
        const name = document.createElement('div');
        name.className = 'player-name';
        name.contentEditable = true;
        name.textContent = this.getPlayerName(team, sequentialIndex !== null ? sequentialIndex : index);
        
        name.addEventListener('blur', () => {
            const upperName = name.textContent.toUpperCase();
            this.savePlayerName(team, sequentialIndex !== null ? sequentialIndex : index, upperName);
            name.textContent = upperName;
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

        // Swap mode click handler on the whole player div
        player.addEventListener('click', (e) => {
            if (this.mode === 'swap') {
                e.preventDefault();
                e.stopPropagation();
                this.handlePlayerTap(player);
            }
        });

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

        // Add penalty arcs after players so they render on top
        addPenaltyArcs();
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

        if (team === 'my-team') {
            return this.config.defaultNames[index] || `Player ${index + 1}`;
        }

        // Away team: use away defaults if provided
        if (this.config.defaultAwayNames) {
            return this.config.defaultAwayNames[index] || `Player ${index + 1}`;
        }

        return `Player ${index + 1}`;
    }

    savePlayerName(team, index, name) {
        const key = `${team}_${index}`;
        this.playerNames[key] = name.toUpperCase();
        localStorage.setItem('playerNames', JSON.stringify(this.playerNames));
    }

    updatePlayerDisplay(team, index, name) {
        const players = document.querySelectorAll(`.${team} .player-name`);
        if (players[index]) {
            players[index].textContent = name.toUpperCase();
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
        
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}#f=${compressed}`;
        
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
        
        if (!hash.startsWith('#f=') && !hash.startsWith('#formation=')) return;
        
        const compressed = hash.startsWith('#f=') ? hash.substring(3) : hash.substring(11);
        
        try {
            const decoded = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
            let data;
            
            // Handle old array format: [homeFormation, awayFormation, homeNames, awayNames]
            if (Array.isArray(decoded)) {
                // Convert old array format to new flat object format
                const playerNames = {};
                const homeNames = decoded[2] || [];
                const awayNames = decoded[3] || [];
                
                homeNames.forEach((name, i) => {
                    playerNames[`my-team_${i}`] = name;
                });
                
                awayNames.forEach((name, i) => {
                    playerNames[`opp-team_${i}`] = name;
                });
                
                data = {
                    h: decoded[0],
                    a: decoded[1],
                    n: playerNames
                };
            } else {
                // New object format: {h, a, n}
                data = decoded;
            }
            
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
            
            this.loadFormation();
        } catch (e) {
            console.error('Failed to load formation from URL:', e);
        }
    }

    async downloadImage() {
        const field = document.getElementById('field');
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        try {
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            const canvas = await this.renderFieldToCanvas(field);
            this.downloadCanvas(canvas, `formation-${this.config.gameType}.png`);
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Pixel ratio for the exported image: aim for ~2800px on the long side
     * (sharp on any phone and after WhatsApp compression), between 3x and 6x.
     */
    getExportScale(width, height) {
        return Math.min(6, Math.max(3, EXPORT_LONG_SIDE_PX / Math.max(width, height)));
    }

    /**
     * Draw the field natively onto a high-resolution canvas: the vector pitch
     * is rasterised at full export size, then every jersey, number and name
     * is drawn as vector shapes/text at the positions they have on screen.
     */
    async renderFieldToCanvas(field) {
        const W = field.clientWidth;
        const H = field.clientHeight;
        const scale = this.getExportScale(W, H);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(W * scale);
        canvas.height = Math.round(H * scale);
        const ctx = canvas.getContext('2d');
        ctx.scale(canvas.width / W, canvas.height / H);

        const radius = parseFloat(getComputedStyle(field).borderTopLeftRadius) || 0;
        roundedRectPath(ctx, 0, 0, W, H, radius);
        ctx.clip();

        const pitch = await loadSvgImage(buildPitchSVG(W, H), canvas.width, canvas.height);
        ctx.drawImage(pitch, 0, 0, W, H);

        const origin = field.getBoundingClientRect();
        field.querySelectorAll('.player').forEach(player => {
            this.drawPlayer(ctx, player, origin, scale);
        });
        return canvas;
    }

    drawPlayer(ctx, player, origin, scale) {
        const rel = el => {
            const r = el.getBoundingClientRect();
            return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
        };
        const icon = player.querySelector('.player-icon');
        const body = player.querySelector('.jersey-body');
        const number = player.querySelector('.player-number');
        const name = player.querySelector('.player-name');

        if (icon && body) {
            const r = rel(icon);
            ctx.save();
            ctx.translate(r.x, r.y);
            ctx.scale(r.w / 24, r.h / 24);
            ctx.shadowColor = 'rgba(0,0,0,0.45)';
            ctx.shadowBlur = 1.5 * scale;
            ctx.shadowOffsetY = 1 * scale;
            ctx.fillStyle = getComputedStyle(body).fill;
            ctx.fill(new Path2D(JERSEY_BODY_PATH));
            ctx.shadowColor = 'transparent';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.lineWidth = 0.7;
            ctx.stroke(new Path2D(JERSEY_BODY_PATH));
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1.1;
            ctx.stroke(new Path2D(JERSEY_TRIM_PATH));
            ctx.restore();
        }
        if (number) {
            const r = rel(number);
            drawCenteredText(ctx, number.textContent, r.x + r.w / 2, r.y + r.h / 2, getComputedStyle(number), r.w + 20, scale);
        }
        if (name && name.textContent.trim()) {
            const r = rel(name);
            const cs = getComputedStyle(name);
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3 * scale;
            ctx.shadowOffsetY = 1 * scale;
            const grad = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
            grad.addColorStop(0, 'rgba(0,0,0,0.9)');
            grad.addColorStop(1, 'rgba(0,0,0,0.7)');
            roundedRectPath(ctx, r.x, r.y, r.w, r.h, parseFloat(cs.borderTopLeftRadius) || 4);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            roundedRectPath(ctx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, parseFloat(cs.borderTopLeftRadius) || 4);
            ctx.stroke();
            ctx.restore();
            const maxW = r.w - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
            drawCenteredText(ctx, name.textContent.trim(), r.x + r.w / 2, r.y + r.h / 2, cs, maxW, scale);
        }
    }

    downloadCanvas(canvas, filename) {
        // Try multiple methods for Chrome compatibility
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            // Mobile sharing
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], filename, { type: 'image/png' });
                    navigator.share({ files: [file] }).catch(err => {
                        console.log('Share failed, falling back to download:', err);
                        this.forceDownload(canvas, filename);
                    });
                } else {
                    this.forceDownload(canvas, filename);
                }
            }, 'image/png', 0.95);
        } else {
            // Desktop download with Chrome-specific handling
            this.forceDownload(canvas, filename, isChrome);
        }
    }

    forceDownload(canvas, filename, isChrome = false) {
        try {
            const link = document.createElement('a');
            link.download = filename;
            
            if (isChrome) {
                // Chrome-specific: use blob URL
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                }, 'image/png');
            } else {
                // Other browsers: use data URL
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download failed:', error);
            // Last resort: open in new tab
            const newTab = window.open();
            newTab.document.write(`<img src="${canvas.toDataURL()}" alt="Formation"/>`);
        }
    }
}

// Shared jersey shape (24x24 box) used by the on-screen icon and the export
const JERSEY_BODY_PATH = 'M8.2 2.4 L4.6 3.7 L1.2 7.4 L3.9 11 L6.1 9.7 L6.1 21 Q6.1 22 7.1 22 L16.9 22 Q17.9 22 17.9 21 L17.9 9.7 L20.1 11 L22.8 7.4 L19.4 3.7 L15.8 2.4 Q14.6 4.4 12 4.4 Q9.4 4.4 8.2 2.4 Z';
const JERSEY_TRIM_PATH = 'M8.2 2.4 Q9.4 4.4 12 4.4 Q14.6 4.4 15.8 2.4 M2.5 6.1 L5.2 9.7 M21.5 6.1 L18.8 9.7';
const EXPORT_LONG_SIDE_PX = 2800;

function roundedRectPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function loadSvgImage(svgMarkup, width, height) {
    // Give the SVG its export pixel size so it is rasterised sharply
    const sized = svgMarkup.replace(/ width="[^"]*" height="[^"]*"/, ` width="${width}" height="${height}"`);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not render pitch image'));
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
    });
}

/** Draw text centred (by cap height) on a point, using an element's computed font. */
function drawCenteredText(ctx, text, cx, cy, cs, maxWidth, scale) {
    ctx.save();
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    let label = text;
    if (maxWidth > 0 && ctx.measureText(label).width > maxWidth) {
        while (label.length > 1 && ctx.measureText(label + '…').width > maxWidth) label = label.slice(0, -1);
        label += '…';
    }
    const capHeight = ctx.measureText('H').actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.7;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2 * scale;
    ctx.shadowOffsetX = 0.5 * scale;
    ctx.shadowOffsetY = 1 * scale;
    ctx.fillStyle = cs.color || '#fff';
    ctx.fillText(label, cx, cy + capHeight / 2);
    ctx.restore();
}
