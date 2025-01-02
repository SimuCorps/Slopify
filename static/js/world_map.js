// Description: This script loads cities.json and displays markers on a world map.
const MAP_WIDTH = 800;
const MAP_HEIGHT = 403;

// The world map is 800x403 pixels, with lat/long corners at:
let LEFT_LON = -180;
let RIGHT_LON = 180;
let TOP_LAT = 90;
let BOTTOM_LAT = -90;

/** Additional pixel-based offsets after the math. */
const SHIFT_X = 0;
const SHIFT_Y = 0;
/** We'll store our entire cities.json data in memory after loading. */
let citiesData = [];

/** We'll remember which city IDs have been chosen (markers). */
let chosenCityIds = [];

/** Reference to #mapOverlay in the HTML. */
let mapOverlay = null;

document.addEventListener("DOMContentLoaded", () => {
  mapOverlay = document.getElementById("mapOverlay");
  const cityInput = document.getElementById("cityInput");
  const suggestions = document.getElementById("suggestions");

  // Load any previously chosen city IDs from localStorage
  const stored = localStorage.getItem("chosenCityIds");
  if (stored) {
    chosenCityIds = JSON.parse(stored);
  }

  // Fetch the local cities.json once
  fetch("data/cities.json")
    .then((resp) => resp.json())
    .then((data) => {
      citiesData = data;
      // Draw markers for previously chosen cities
      chosenCityIds.forEach((cityId) => drawCityMarker(cityId));
    })
    .catch((err) => console.error("Error loading cities.json:", err));

  /**
   * Setup the auto-suggest logic:
   */
  let typingTimer;
  cityInput.addEventListener("input", () => {
    clearTimeout(typingTimer);
    const query = cityInput.value.trim().toLowerCase();

    if (!query) {
      suggestions.innerHTML = "";
      return;
    }

    // Debounce: only do the filter after 200 ms of no typing
    typingTimer = setTimeout(() => {
      showSuggestions(query);
    }, 200);
  });

  // If user presses Enter, optionally pick the top suggestion
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const firstLi = suggestions.querySelector("li");
      if (firstLi) {
        pickSuggestion(firstLi.dataset.cityId);
      }
    }
  });

  // If user clicks on a suggestion <li>
  suggestions.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "li") {
      pickSuggestion(e.target.dataset.cityId);
    }
  });
});

/**
 * showSuggestions(query)
 *  - Filter the local 'citiesData' where city.name starts with query
 *  - Create up to 10 <li> items in #suggestions
 *  - Display cityName, admin1, country
 */
function showSuggestions(query) {
  const suggestionsEl = document.getElementById("suggestions");

  // Filter by city.name that starts with the typed query
  const matches = citiesData.filter((city) =>
    city.name.toLowerCase().startsWith(query),
  );

  // Limit to top 10
  const top10 = matches.slice(0, 10);

  // Build the HTML list
  let html = "";
  top10.forEach((city) => {
    const cityName = city.name || "";
    const admin1 = city.admin1 || "";
    const country = city.country || "";

    // Example: "Rio de Janeiro, RJ, BR" or "New York, NY, US"
    const display = [
      cityName,
      admin1 && admin1 !== cityName ? admin1 : null,
      country && country !== cityName ? country : null,
    ]
      .filter(Boolean) // remove null/empty
      .join(", ");

    html += `<li data-city-id="${city.id}">${display}</li>`;
  });

  // Insert into #suggestions
  suggestionsEl.innerHTML = html;
}

/**
 * pickSuggestion(cityId)
 *  - Called when user clicks a suggestion (or hits Enter)
 *  - Add the marker if not already chosen
 *  - Clear input, suggestions
 */
function pickSuggestion(cityId) {
  if (!chosenCityIds.includes(cityId)) {
    chosenCityIds.push(cityId);
    localStorage.setItem("chosenCityIds", JSON.stringify(chosenCityIds));
    drawCityMarker(cityId);
  }
  // Clear input and suggestion list
  document.getElementById("cityInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
}

/**
 * drawCityMarker(cityId)
 *  - Equirectangular projection: lat/long => x,y
 *  - Then shift by SHIFT_X, SHIFT_Y
 *  - Create a red dot at (x, y)
 */
function drawCityMarker(cityId) {
  const city = citiesData.find((c) => c.id === cityId);
  if (!city) return;

  const lat = parseFloat(city.lat);
  const lon = parseFloat(city.lon);

  // Equirectangular conversion
  let x = ((lon - LEFT_LON) / (RIGHT_LON - LEFT_LON)) * MAP_WIDTH;
  let y = ((TOP_LAT - lat) / (TOP_LAT - BOTTOM_LAT)) * MAP_HEIGHT;

  // Apply small shift
  x += SHIFT_X;
  y -= SHIFT_Y; // subtract SHIFT_Y to move up

  // Create marker
  const marker = document.createElement("div");
  marker.className = "city-marker";
  marker.title = city.name; // or the full "city, admin1, country"

  // Position the marker
  marker.style.left = x + "px";
  marker.style.top = y + "px";

  // Add to the overlay
  mapOverlay.appendChild(marker);
}

// Initialize the map after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initWorldMap("world-map", "../data/cities.json");
});
