// Applies the colour theme before first paint to avoid a flash of the wrong
// theme, including the browser UI colour (<meta name="theme-color">, which
// index.html places before this script). Loaded as a classic blocking script
// from <head>: CSP forbids inline scripts. Keep the storage key and the
// colours in sync with src/utils/theme.ts.
//
// Light is the default: a stored choice (the theme switch) wins, then an OS
// set to dark, and everything else (no preference, storage blocked, no
// matchMedia) gets the light theme.
;(function () {
  var theme = null
  try {
    var stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') theme = stored
  } catch (e) {
    // Storage blocked: fall back to the OS preference below.
  }
  if (!theme) {
    var prefersDark = false
    try {
      prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
      // No matchMedia: keep the light default.
    }
    theme = prefersDark ? 'dark' : 'light'
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
