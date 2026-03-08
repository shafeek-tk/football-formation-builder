// Common pitch initialization
function initializePitch() {
    const field = document.getElementById('field');
    if (field) {
        // Always ensure pitch markings are present
        if (!field.querySelector('.penalty-area')) {
            const markings = `
                <div class="goal top"></div>
                <div class="goal bottom"></div>
                <div class="center-spot"></div>
                <div class="penalty-area top"></div>
                <div class="goal-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area bottom"></div>
                <div class="penalty-spot top"></div>
                <div class="penalty-spot bottom"></div>
                <div class="penalty-arc-clip top"><div class="penalty-arc top"></div></div>
                <div class="penalty-arc-clip bottom"><div class="penalty-arc bottom"></div></div>
                <div class="corner-arc top-left"></div>
                <div class="corner-arc top-right"></div>
                <div class="corner-arc bottom-left"></div>
                <div class="corner-arc bottom-right"></div>
            `;
            field.innerHTML = markings + field.innerHTML;
        }
    }
}

// No-op kept for compatibility
function addPenaltyArcs() {}
