// Common mode toggle component
function createModeToggle(activePage) {
    const modes = [
        { page: 'index.html', label: '11v11', id: '11v11' },
        { page: '9s.html', label: '9v9', id: '9v9' },
        { page: '8s.html', label: '8v8', id: '8v8' },
        { page: '7s.html', label: '7v7', id: '7v7' },
        { page: '6s.html', label: '6v6', id: '6v6' }
    ];
    
    const html = modes.map(mode => {
        if (mode.id === activePage) {
            return `<span class="mode-btn active">${mode.label}</span>`;
        } else {
            return `<a href="${mode.page}" class="mode-btn">${mode.label}</a>`;
        }
    }).join('\n        ');
    
    return `<div class="mode-toggle">\n        ${html}\n    </div>`;
}

// Initialize mode toggle on page load
document.addEventListener('DOMContentLoaded', () => {
    const modeToggleContainer = document.getElementById('modeToggleContainer');
    if (modeToggleContainer) {
        const activePage = modeToggleContainer.getAttribute('data-active');
        modeToggleContainer.outerHTML = createModeToggle(activePage);
    }
});
