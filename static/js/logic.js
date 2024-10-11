//Leaflet-Part-1 
//Past 30 Days_M4.5+ Earthquakes
// Store our API endpoint as queryUrl.
// Perform a GET request to the query URL
// Leaflet-Part-1
// Past 30 Days M4.5+ Earthquakes
// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Extract depths from data
  const depths = data.features.map(feature => feature.geometry.coordinates[2]);
  
  // Calculate minDepth and maxDepth using a for loop
  let minDepth = depths[0];
  let maxDepth = depths[0];

  for (let i = 1; i < depths.length; i++) {
    if (depths[i] < minDepth) minDepth = depths[i];
    if (depths[i] > maxDepth) maxDepth = depths[i];
  }

  // Define color function based on depth ranges
  function Color(depth) {
    const range = (maxDepth - minDepth) / 6;
    if (depth >= minDepth && depth < minDepth + range) return "#FFB6C1"; // Light pink
    else if (depth >= minDepth + range && depth < minDepth + 2 * range) return "#FF7F50"; // Light red
    else if (depth >= minDepth + 2 * range && depth < minDepth + 3 * range) return "#FF6347"; 
    else if (depth >= minDepth + 3 * range && depth < minDepth + 4 * range) return "#FF4500"; 
    else if (depth >= minDepth + 4 * range && depth < minDepth + 5 * range) return "#DC143C"; 
    else return "#8B0000"; // Dark red for deepest interval
  }

  // Send the data.features object to the createFeatures function
  createFeatures(data.features, Color, minDepth, maxDepth);
});

// Define a markerSize() function that will give each location a different radius based on its magnitude of earthquake.
function markerSize(magnitude) {
  return Math.sqrt(magnitude) * 5;
}

function createFeatures(earthquakeData, Color, minDepth, maxDepth) {
  // Define a function to bind popups and set marker style for each feature
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>Location: ${feature.properties.place}</h3>
       <hr>
       <p>Magnitude: ${feature.properties.mag}</p>
       <p>Depth: ${feature.geometry.coordinates[2]} km</p>
       <p>Date: ${new Date(feature.properties.time)}</p>`
    );
  }

  // Create a GeoJSON layer with circle markers based on magnitude
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag), // Radius scaled by magnitude
        fillColor: Color(feature.geometry.coordinates[2]),
        color: "white",
        weight: 0.5,
        fillOpacity: 0.75
      });
    },
    onEachFeature: onEachFeature,
    coordsToLatLng: function (coords) {
      return L.latLng(coords[1], coords[0]); // Adjust to latitude-longitude order
    }
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes, minDepth, maxDepth);
}

function createMap(earthquakes, minDepth, maxDepth) {
  // Create the base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object
  let baseMaps = {
    "Street Map": street
  };

  // Create an overlay object to hold our overlay
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

  // Set up the legend
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let limits = [
      minDepth.toFixed(1),
      (minDepth + (maxDepth - minDepth) / 6).toFixed(1),
      (minDepth + 2 * (maxDepth - minDepth) / 6).toFixed(1),
      (minDepth + 3 * (maxDepth - minDepth) / 6).toFixed(1),
      (minDepth + 4 * (maxDepth - minDepth) / 6).toFixed(1),
      maxDepth.toFixed(1)
    ];
    let colors = ["#FFB6C1", "#FF7F50", "#FF6347", "#FF4500", "#DC143C", "#8B0000"];
    let labels = [];

    // Add the minimum and maximum labels
    let legendInfo = "<h4>Earthquake Depth (km)</h4>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    // Add color boxes for each depth range
    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li> " + limit + " km");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
}
