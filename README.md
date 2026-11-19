🍕 Pizza Map

A map that shows where I've had pizza, including places I'd recommend and pizzerias I think are excellent. 

Live map: https://s4xton.github.io/pizza-map/

Reads a published Google Sheets CSV feed via Papa Parse. Custom Leaflet map panes ensure higher recommendations show above others. Full-viewport responsive interface with interactive popups displaying venue notes, addresses, and website links. 

**Tech Stack**

* [Leaflet](https://leafletjs.com/): Interactive mapping library
* [OpenStreetMap](https://www.openstreetmap.org/): Map tiles and geographic data
* [Papa Parse](https://www.papaparse.com/): In-browser CSV parsing for live data feeds 
* [GitHub Pages](https://pages.github.com/): Static site hosting directly from the source

Visits are logged to Google Sheets using a Google Form. A Google Apps Script extracts verified venue coordinates from the shared Google Maps link. The list of pizzerias visited has a public CSV. When the page loads, Leaflet fetches the latest CSV and plots every pin live.
