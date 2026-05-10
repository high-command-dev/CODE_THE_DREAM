let coords = {
  latitude: 20.0256,
  longitude: -99.1956,
  name: "Tulancingo, Hidalgo",
};

const app = document.getElementById("app");
const status = document.getElementById("status-message");
const locationLabel = document.getElementById("location-label");
const locationForm = document.getElementById("location-form");
const locationInput = document.getElementById("location-input");
const viewTitle = document.getElementById("view-title");
const viewDescription = document.getElementById("view-description");
const viewLinks = Array.from(document.querySelectorAll("[data-view-link]"));

const views = {
  temperature: {
    title: "Temperatures",
    description: "Hourly temperature data for the selected location.",
    field: "temperature_2m",
    format: function (value) {
      return Number(value).toFixed(1) + "°C";
    },
  },
  conditions: {
    title: "Conditions",
    description: "Hourly weather conditions for the selected location.",
    field: "weathercode",
    format: function (value) {
      return getWeather(value);
    },
  },
};

// show current location
locationLabel.textContent =
  coords.name + " (" + coords.latitude + ", " + coords.longitude + ")";

// search location
locationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  let city = locationInput.value.trim();

  if (city === "") {
    status.textContent = "Please enter a city name";
    return;
  }

  status.textContent = "Searching location...";

  try {
    let locationData = await findLocation(city);

    coords.latitude = locationData.latitude;
    coords.longitude = locationData.longitude;
    coords.name = locationData.name;

    locationLabel.textContent =
      coords.name + " (" + coords.latitude + ", " + coords.longitude + ")";

    renderWeather();
  } catch (error) {
    status.textContent = "Location not found";
  }
});

// load weather when page opens
window.addEventListener("DOMContentLoaded", function () {
  locationInput.value = coords.name;

  if (!window.location.hash) {
    window.location.hash = "#temperature";
  }

  window.addEventListener("hashchange", renderWeather);
  renderWeather();
});

function getCurrentView() {
  let key = window.location.hash.replace("#", "");

  if (!views[key]) {
    return "temperature";
  }

  return key;
}

function setActiveView(viewKey) {
  viewLinks.forEach(function (link) {
    let isActive = link.getAttribute("data-view-link") === viewKey;
    link.classList.toggle("active", isActive);
  });
}

// fetch weather
async function renderWeather() {
  let viewKey = getCurrentView();
  let view = views[viewKey];

  setActiveView(viewKey);
  viewTitle.textContent = view.title;
  viewDescription.textContent = view.description;
  status.textContent = "Loading weather...";

  app.innerHTML = "";

  let url =
    "https://api.open-meteo.com/v1/forecast?" +
    "latitude=" +
    coords.latitude +
    "&longitude=" +
    coords.longitude +
    "&hourly=" +
    view.field +
    "&timezone=auto";

  try {
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    let data = await response.json();

    if (!data.hourly) {
      throw new Error("No weather data returned");
    }

    let times = data.hourly.time;
    let values = data.hourly[view.field];

    status.textContent = "Weather loaded";

    // show only first 12 hours
    for (let i = 0; i < 12; i++) {
      let card = document.createElement("div");

      card.className = "card";

      let valueText = view.format(values[i]);

      card.innerHTML =
        "<h3>" +
        times[i] +
        "</h3>" +
        "<p>" +
        (viewKey === "temperature" ? "Temperature: " : "Condition: ") +
        valueText +
        "</p>";

      app.appendChild(card);
    }
  } catch (error) {
    status.textContent = "Error loading weather";
  }
}

// find location
async function findLocation(city) {
  let url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: city,
    count: "1",
  }).toString();

  let response = await fetch(url);

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  let data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No location");
  }

  let place = data.results[0];

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
  };
}

// weather code text
function getWeather(code) {
  if (code === 0) {
    return "Clear";
  }

  if (code >= 1 && code <= 3) {
    return "Cloudy";
  }

  if (code >= 51 && code <= 67) {
    return "Rain";
  }

  if (code >= 71 && code <= 77) {
    return "Snow";
  }

  if (code >= 95) {
    return "Thunderstorm";
  }

  return "Unknown";
}
