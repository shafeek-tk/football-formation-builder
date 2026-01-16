// Common pitch initialization
function initializePitch() {
    const field = document.getElementById('field');
    if (field) {
        // Always ensure pitch markings are present
        if (!field.querySelector('.penalty-area')) {
            const markings = `
                <div class="center-spot"></div>
                <div class="penalty-area top"></div>
                <div class="goal-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area bottom"></div>
                <div class="penalty-spot top"></div>
                <div class="penalty-spot bottom"></div>
                <div class="penalty-arc top"></div>
                <div class="penalty-arc bottom"></div>
                <div class="corner-arc top-left"></div>
                <div class="corner-arc top-right"></div>
                <div class="corner-arc bottom-left"></div>
                <div class="corner-arc bottom-right"></div>
            `;
            field.innerHTML = markings + field.innerHTML;
        }
    }
}
