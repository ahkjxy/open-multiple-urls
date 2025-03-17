export function initializeTheme() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
        applyTheme();
    }
}

function applyTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
} 