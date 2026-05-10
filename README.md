# Simple Weather (Temperature & Conditions)

This is a minimal static demo using the Open-Meteo API. It shows two pages:

- Temperatures — requests only `hourly=temperature_2m` and shows hourly temps.
- Conditions — requests only `hourly=weathercode` and shows human-friendly labels.

Navigation to (`#temperature`, `#conditions`). Each view issues its own GET request and only asks for the field it needs.

You can also type a city or place name into the search box to load weather for that location.

## Run locally

1. Open `index.html` in your browser (double-click).

2. Type a city name in the search box and press Enter, or click the **Temperatures** or **Conditions** links to load each view.

No build or install steps are required.

