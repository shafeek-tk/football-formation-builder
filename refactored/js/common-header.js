// Common header component
function createHeader(config) {
    const {
        title = 'EASY FOOTBALL LINEUP',
        subtitle = 'Build your team formation and get an instant shareable link. No saving, no accounts - just share.',
        showFormationSelectors = true,
        formations = [],
        gameType = '11v11'
    } = config;
    
    let formationSelectorsHTML = '';
    if (showFormationSelectors && formations.length > 0) {
        const options = formations.map(f => 
            `<option value="${f.value}">${f.label}</option>`
        ).join('\n                    ');
        
        formationSelectorsHTML = `
        <div class="formation-container">
            <div class="formation-group">
                <span class="formation-label">Home:</span>
                <select id="myTeamFormation" onchange="formationBuilder.loadFormation()" class="formation-select">
                    ${options}
                </select>
            </div>
            <div class="formation-group">
                <span class="formation-label">Away:</span>
                <select id="awayTeamFormation" onchange="formationBuilder.loadFormation()" class="formation-select">
                    ${options}
                </select>
            </div>
        </div>`;
    }
    
    return `
    <div class="header">
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
        
        <div id="loadingIndicator" class="loading-indicator">
            <span>⚽</span> Loading formation...
        </div>
        
        <div class="controls">
            <button onclick="formationBuilder.shareFormation()">SHARE FORMATION</button>
            <button onclick="formationBuilder.downloadImage()" id="downloadBtn">
                <span class="desktop-text">DOWNLOAD IMAGE</span>
                <span class="mobile-text">SHARE IMAGE</span>
            </button>
        </div>
        ${formationSelectorsHTML}
        
        <div style="text-align: center; margin: 15px 0; color: #ccc; font-size: 14px;">
            💡 Click on player names to edit them directly
        </div>
    </div>`;
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('headerContainer');
    if (headerContainer) {
        const config = JSON.parse(headerContainer.getAttribute('data-config') || '{}');
        headerContainer.outerHTML = createHeader(config);
    }
});
