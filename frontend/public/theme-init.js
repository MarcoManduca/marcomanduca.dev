// Applies the colour theme before first paint to avoid a flash of the wrong
// theme, including the browser UI colour (<meta name="theme-color">, which
// index.html places before this script). Loaded as a classic blocking script
// from <head>: CSP forbids inline scripts. Keep the storage key and the
// colours in sync with src/utils/theme.ts.
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
  var themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) {
    themeColor.setAttribute(
      'content',
      theme === 'light' ? '#EFE3C8' : '#0D1B1F',
    )
  }
})()
