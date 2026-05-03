// Common footer component
function createFooter() {
    return `
        <div class="feature-cards">
            <h3>Perfect for weekly kickabouts and pickup games:</h3>
            <div class="feature-cards-grid">
                <div>
                    <strong>Instant Shareable Links</strong><br>
                    Create formations and get shareable links instantly - no saving needed
                </div>
                <div>
                    <strong>No Setup Required</strong><br>
                    No saving, no accounts, no setup - just open and start creating
                </div>
                <div>
                    <strong>Works Everywhere</strong><br>
                    Use on any device - phone, tablet, or computer
                </div>
            </div>
        </div>

        <nav class="internal-nav">
            Also try:
            <a href="5s.html">5-a-side</a><span>|</span>
            <a href="6s.html">6-a-side</a><span>|</span>
            <a href="7s.html">7-a-side</a><span>|</span>
            <a href="8s.html">8-a-side</a><span>|</span>
            <a href="9s.html">9-a-side</a><span>|</span>
            <a href="10s.html">10-a-side</a><span>|</span>
            <a href="index.html">11-a-side</a>
        </nav>

        <div class="footer">
            <a target="_blank" href="https://icons8.com/icon/y1jile6KU9QN/t-shirt">t shirt</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a> |
            Need help? <a href="mailto:easyfootballlineup@gmail.com">easyfootballlineup@gmail.com</a>
        </div>
    `;
}

// Initialize footer on page load
document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', createFooter());
});
