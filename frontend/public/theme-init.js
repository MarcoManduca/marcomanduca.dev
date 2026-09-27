// Applies the colour theme before first paint to avoid a flash of the wrong
// theme. Loaded as a classic blocking script from <head>: CSP forbids inline
// scripts. Keep the storage key in sync with src/utils/theme.ts.
;(function () {
  var theme = 'dark'
  try {
    var stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') theme = stored
    else if (window.matchMedia('(prefers-color-scheme: light)').matches)
      theme = 'light'
  } catch (e) {
    // Storage blocked: keep the default dark theme.
  }
  document.documentElement.setAttribute('data-theme', theme)
})()
