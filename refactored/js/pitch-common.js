// Common pitch initialization
function initializePitch() {
    const field = document.getElementById('field');
    if (field) {
        // Always ensure pitch markings are present
        if (!field.querySelector('.penalty-area')) {
            const markings = `
                <div class="halfway-line"></div>
                <svg class="center-circle" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                <div class="center-spot"></div>
                <div class="penalty-area top"></div>
                <div class="goal-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area bottom"></div>
                <div class="penalty-spot top"></div>
                <div class="penalty-spot bottom"></div>
                <svg class="penalty-arc top" width="100" height="30" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 0 Q 50 30 100 0" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                <svg class="penalty-arc bottom" width="100" height="30" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 30 Q 50 0 100 30" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                <div class="corner-arc top-left"></div>
                <div class="corner-arc top-right"></div>
                <div class="corner-arc bottom-left"></div>
                <div class="corner-arc bottom-right"></div>
            `;
            field.innerHTML = markings + field.innerHTML;
        }
    }
}
