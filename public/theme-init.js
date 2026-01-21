// ABOUTME: Theme initialization script that runs before page render.
// ABOUTME: Applies dark/light theme class to prevent flash of unstyled content.
(function () {
  try {
    var ALLOWED_THEMES = ['dark', 'light'];
    var theme = localStorage.getItem('theme') || 'system';
    var actualTheme;

    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      actualTheme = theme;
    }

    // Validate theme against whitelist before adding to classList
    if (ALLOWED_THEMES.indexOf(actualTheme) !== -1) {
      document.documentElement.classList.add(actualTheme);
    }
  } catch (e) {
    // Silently fail - theme will be applied by React after hydration
  }
})();
