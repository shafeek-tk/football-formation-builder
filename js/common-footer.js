// Common footer component - Pitch Heritage theme
function createFooter() {
    return `
        <div class="footer">
            <a target="_blank" href="https://icons8.com/icon/y1jile6KU9QN/t-shirt">t shirt</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
        </div>
    `;
}

// Initialize footer on page load
document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', createFooter());
});
