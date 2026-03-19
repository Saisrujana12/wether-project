# wether-project
# SkyCast Weather Dashboard

## Overview
SkyCast is a progressive weather dashboard that ships as a static HTML/CSS/JavaScript bundle plus a matching WordPress theme. The root folder holds the stand alone experience while skycast-theme (and the zip archive) contains the WP theme that enqueues the same assets via functions.php.

## Key features
- Real time hero panel with temperature, feels like, humidity, wind, visibility, and pressure metrics.
- AQI gauge, pollutant breakdown, saved cities list, hourly scroll, 7 day rundown, and temperature/humidity/wind trend charts.
- Sun/moon details with UV bar and moon phase, alert banner for severe codes or extreme heat, Windy map tabs, animated weather layers, and toast notifications.
- Theme toggle (dark/light/auto), language selector (EN/HI/TE), Celsius/Fahrenheit switch, live clock, browser notifications, and LocalStorage backed settings.

## Static version (root)
- `index.html`: single page layout with Google Fonts, data attributes for localization, map tabs, saved city dropdown, alert/toast structures, and PWA install hooks wired to app.js.
- `style.css`: bespoke glassmorphic styling, responsive grid, animated orbs/canvas layers, and adaptive controls for the dashboard cards.
- `app.js`: orchestrates Open-Meteo forecast and Air Quality calls, Open-Meteo geocoding, IP-based boot location via ipapi.co (fallback to New Delhi), moon phase math, chart drawing, alerts, saved cities, notifications, toggles, and Windy iframe updates.
- `manifest.json` + `sw.js`: expose the PWA metadata and cache the shell assets (root, HTML, CSS, JS, manifest) for offline visits.
- `favicon.png` + `skycast-theme.zip`: icon asset plus a packaged WordPress theme archive.

## APIs & data sources
- https://api.open-meteo.com/v1/forecast for current/hourly/daily weather, UV, and precipitation data.
- https://air-quality-api.open-meteo.com/v1/air-quality for AQI and pollutant concentrations.
- https://geocoding-api.open-meteo.com/v1/search to transform text searches into lat/lon/timezone info.
- https://ipapi.co/json/ to resolve a visitor location on boot, with a safe fallback location defined in code.
- Windy embed frames (https://embed.windy.com/embed2.html) for live wind/rain/temp/cloud overlays.
- Browser Notification API plus LocalStorage for saved cities, theme/language/unit state, and alert suppression.

## Progressive Web App support
sw.js pre caches the shell so the dashboard can run offline, and manifest.json gives the site an icon, theme color, and standalone display. The beforeinstallprompt hook shows the install banner, while the service worker registers on load in both the static site and the WP theme.

## Previewing the static site
1. Start a simple HTTP server inside this folder (for example `npx http-server -p 4173` or `python -m http.server 4173`) so that the service worker can register and fetch behaves as expected.
2. Open `http://localhost:4173` in a modern browser, accept notification permission if desired, and use the search, saved cities, map tabs, and toggles.
3. Use DevTools to inspect network errors; each failed fetch lands inside the helper functions in app.js.

## WordPress theme (skycast-theme)
- Copy the folder or unzip skycast-theme.zip into `wp-content/themes/skycast` and activate it.
- `front-page.php`/`index.php` output the same markup as the static deck, while `functions.php` enqueues `assets/css/skycast.css` and `assets/js/skycast.js`, loads the Google Fonts, echoes the manifest/meta tags, and registers the service worker.
- Assets under `skycast-theme/assets` mirror the root files so updates can be synchronized by copying the CSS/JS and manifest.
- The theme also removes the admin bar on the front end so the dashboard stays immersive.

## Customization notes
- Edit the `i18n` object in `app.js`/`skycast.js` to add or tweak languages, and adjust the `alertCodes` table to surface custom warnings.
- Theme, language, and unit choices persist in LocalStorage, so the toggles and saved cities work without backend storage.
- Colors, spacing, and animations live in the CSS files; modify them to match your branding before deploying.

## Troubleshooting
- The service worker caches assets aggressively. If an update does not show, run a hard refresh (Ctrl+Shift+R) or clear site data from DevTools.
- Windy iframes require HTTPS. Serve the site over HTTPS if you are embedding the map on a secure host.
- Notifications fire only when the user grants permission and the page is in focus, so check `Notification.permission` if alerts vanish.

## Packaging
- `skycast-theme.zip` serves as a ready to upload WordPress theme archive for distribution or backup.

## Credits
- Layout fonts are Inter and Outfit from Google Fonts; live data comes from Open-Meteo and ipapi.co while the map tiles are from Windy.com.
