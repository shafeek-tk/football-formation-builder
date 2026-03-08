// Common header component - Pitch Heritage theme
function createHeader(config) {
    const {
        title = 'Easy Football Lineup',
        formations = [],
    } = config;

    let formationSelectorsHTML = '';
    if (formations.length > 0) {
        const options = formations.map(f =>
            `<option value="${f.value}">${f.label}</option>`
        ).join('\n                    ');

        formationSelectorsHTML = `
        <div class="formation-group">
            <span class="formation-label">Blue:</span>
            <select id="myTeamFormation" onchange="formationBuilder.loadFormation()" class="formation-select">
                    ${options}
            </select>
        </div>
        <div class="formation-group">
            <span class="formation-label">Red:</span>
            <select id="awayTeamFormation" onchange="formationBuilder.loadFormation()" class="formation-select">
                    ${options}
            </select>
        </div>`;
    }

    return `
    <div class="header">
        <div class="header-left">
            <div class="header-crest">&#9917;</div>
            <h1>${title}</h1>
        </div>
        <div class="header-right">
            <button class="btn" onclick="formationBuilder.shareFormation()">SHARE</button>
            <button class="btn" onclick="formationBuilder.downloadImage()" id="downloadBtn">
                <span class="desktop-text">DOWNLOAD</span>
                <span class="mobile-text">IMAGE</span>
            </button>
        </div>
    </div>
    <div class="controls-row">
        ${formationSelectorsHTML}
        <div class="divider"></div>
        <div id="modeToggleContainer"></div>
        <div class="divider"></div>
        <div id="interactionToggleContainer"></div>
    </div>
    <div id="loadingIndicator" class="loading-indicator">
        <span>&#9917;</span> Loading formation...
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
