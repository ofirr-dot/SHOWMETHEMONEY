// loadHeader.js
(async function loadHeader() {
  try {
    const containerId = 'site-header';
    const el = document.getElementById(containerId);
    if (!el) return console.warn('loadHeader: no element with id', containerId);

    const resp = await fetch('/header.html', { cache: 'no-cache' });
    if (!resp.ok) throw new Error('Failed to fetch header: ' + resp.status);
    const html = await resp.text();
    el.innerHTML = html;

    // סימון קישור פעיל לפי שם הקובץ ב‑URL
    try {
      const path = location.pathname.split('/').pop() || 'index.html';
      const links = el.querySelectorAll('.top-nav .nav-item');
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.endsWith(path)) a.classList.add('active'); else a.classList.remove('active');
      });
    } catch (e) { /* ignore */ }

    // העבר את מצב ה‑theme אם נשמר ב‑localStorage
    try {
      const themeToggle = document.getElementById('themeToggle');
      const saved = localStorage.getItem('site-theme');
      if (saved === 'dark') document.body.classList.add('dark');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark');
          const isDark = document.body.classList.contains('dark');
          localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
          themeToggle.textContent = isDark ? '☀️' : '🌙';
        });
        // עדכון כפתור לפי מצב
        themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
      }
    } catch (e) { /* ignore */ }

  } catch (err) {
    console.error('loadHeader error:', err);
  }
})();
