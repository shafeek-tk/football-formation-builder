// Feature: phone layout.
// On small screens the header shrinks to one line, the share buttons move
// to a bar fixed at the bottom of the screen (always in reach of a thumb),
// the tools row scrolls sideways instead of wrapping, and the pitch is
// sized to fill the space between the controls and the bottom bar.
EFL.css('css/feature-mobile-layout.css?v=1795664498');

(function () {
    const PHONE = window.matchMedia('(max-width: 600px)');

    function fitPitch() {
        const field = document.getElementById('field');
        const bar = document.querySelector('.share-bar');
        if (!field) return;
        if (!PHONE.matches || !bar) { field.style.height = ''; return; }
        const top = field.getBoundingClientRect().top + window.scrollY;
        const free = window.innerHeight - top - bar.offsetHeight - 8;
        // Never taller than a real pitch shape, never too short to use
        const max = field.clientWidth * 1.75;
        field.style.height = Math.round(Math.max(440, Math.min(free, max))) + 'px';
    }

    // Drop the right-edge fade once the tools row is scrolled to its end
    function markEnd() {
        const tools = document.getElementById('toolsBar');
        if (!tools) return;
        tools.classList.toggle('is-scrolled-end', tools.scrollLeft + tools.clientWidth >= tools.scrollWidth - 4);
    }

    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fitPitch); };
    EFL.on('ready', () => {
        schedule();
        window.addEventListener('resize', schedule);
        PHONE.addEventListener?.('change', schedule);
        if (document.fonts) document.fonts.ready.then(schedule);
        // Tools may be added after ready (e.g. Install app)
        const tools = document.getElementById('toolsBar');
        if (tools && window.ResizeObserver) new ResizeObserver(() => { schedule(); markEnd(); }).observe(tools);
        if (tools) tools.addEventListener('scroll', markEnd, { passive: true });
        markEnd();
    });
})();
