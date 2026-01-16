// Common footer component
function createFooter() {
    return `
        <div style="text-align:center;padding:20px;background:#2a2a2a;margin:20px auto;max-width:800px;border-radius:8px;">
            <h3 style="color:#fff;margin-bottom:15px;font-size:18px;">Why coaches and players love this tool:</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;text-align:left;">
                <div style="color:#ccc;">
                    <strong style="color:#fff;">🔗 Instant Shareable Links</strong><br>
                    Create formations and get shareable links instantly - no saving needed
                </div>
                <div style="color:#ccc;">
                    <strong style="color:#fff;">🚀 No Setup Required</strong><br>
                    No saving, no accounts, no setup - just open and start creating
                </div>
                <div style="color:#ccc;">
                    <strong style="color:#fff;">📱 Works Everywhere</strong><br>
                    Use on any device - phone, tablet, or computer
                </div>
            </div>
        </div>
        
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
