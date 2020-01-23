const mapboxgl = require("mapbox-gl");
require("mapbox-gl/dist/mapbox-gl.css");
const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");
require("@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css");
const MapboxDraw = require("@mapbox/mapbox-gl-draw");
require("@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css");
const moment = require("moment");
const length = require("@turf/length").default;
const area = require("@turf/area").default;
const csv2geojson = require("csv2geojson");
const shp2geojson = require("shapefile");
const tj = require("@mapbox/togeojson");
const axios = require("axios");
const DOMParser = require("xmldom").DOMParser;
const StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");
let geojsonArray = [];

const instance = axios.create({ baseURL: "http://localhost:3000" });

var modes = MapboxDraw.modes;
modes.static = StaticMode;
const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  },
  modes: modes,
  styles: [
    {
      id: "gl-draw-polygon-fill-inactive",
      type: "fill",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"]
      ],
      paint: {
        "fill-color": "#3bb2d0",
        "fill-outline-color": "#3bb2d0",
        "fill-opacity": 0.1
      }
    },
    {
      id: "gl-draw-polygon-fill-active",
      type: "fill",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": "#fbb03b",
        "fill-outline-color": "#fbb03b",
        "fill-opacity": 0.1
      }
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 3,
        "circle-color": "#fbb03b"
      }
    },
    {
      id: "gl-draw-polygon-stroke-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"]
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#62b5b5",
        "line-width": 2
      }
    },
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#fbb03b",
        "line-dasharray": [0.2, 2],
        "line-width": 2
      }
    },
    {
      id: "gl-draw-line-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"]
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#62b5b5",
        "line-width": 2
      }
    },
    {
      id: "gl-draw-line-active",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#fbb03b",
        "line-dasharray": [0.2, 2],
        "line-width": 2
      }
    },
    {
      id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"]
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": "#fff"
      }
    },
    {
      id: "gl-draw-polygon-and-line-vertex-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"]
      ],
      paint: {
        "circle-radius": 3,
        "circle-color": "#fbb03b"
      }
    },
    {
      id: "gl-draw-point-point-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"]
      ],
      paint: {
        "circle-radius": 5,
        "circle-opacity": 1,
        "circle-color": "#fff"
      }
    },
    {
      id: "gl-draw-point-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"]
      ],
      paint: {
        "circle-radius": 3,
        "circle-color": "#62b5b5"
      }
    },
    {
      id: "gl-draw-point-stroke-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "active", "true"],
        ["!=", "meta", "midpoint"]
      ],
      paint: {
        "circle-radius": 7,
        "circle-color": "#fff"
      }
    },
    {
      id: "gl-draw-point-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["!=", "meta", "midpoint"],
        ["==", "active", "true"]
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": "#fbb03b"
      }
    },
    {
      id: "gl-draw-polygon-fill-static",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
      paint: {
        "fill-color": "#9bebcd",
        "fill-outline-color": "#62b5b5",
        "fill-opacity": 0.5
      }
    },
    {
      id: "gl-draw-polygon-stroke-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#62b5b5",
        "line-width": 2
      }
    },
    {
      id: "gl-draw-line-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#62b5b5",
        "line-width": 2
      }
    },
    {
      id: "gl-draw-point-static",
      type: "circle",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#62b5b5"
      }
    }
  ]
});

const basemapToggle = document.getElementById("basemap-toggle");
const buttons = basemapToggle.getElementsByTagName("button");
const totalLength = document.getElementById("total_length");
const totalLengthTitle = document.getElementById("total_length_title");
const selectedLength = document.getElementById("selected_length");
const selectedLengthTitle = document.getElementById("selected_length_title");
const totalArea = document.getElementById("total_area");
const totalAreaTitle = document.getElementById("total_area_title");
const selectedArea = document.getElementById("selected_area");
const selectedAreaTitle = document.getElementById("selected_area_title");
const dndArea = document.getElementById("map");
const layerList = document.getElementById("layer_list");
const annotationBanner = document.getElementById("annotation_banner");
const annotationToggle = document.getElementById("annotation_toggle");
const annotationOnOff = document.getElementById("annotation_onoff");
const annotationId = document.getElementById("annotation_id");
const annotationInfo = document.getElementById("annotation_panel");
const annotationName = document.getElementById("annotation_name");
const annotationDesc = document.getElementById("annotation_desc");
const annotationNotes = document.getElementById("annotation_notes");
const annotationSave = document.getElementById("annotation_save");
const layersAdded = document.getElementById("layers_added");
let mode = "map";
let drawTools;

//Update below for Mapbox URL and Token
mapboxgl.accessToken = "{accessToken}";
mapboxgl.baseApiUrl = "{url}";

const transformRequest = url => {
  const hasQuery = url.indexOf("?") !== -1;
  const suffix = hasQuery
    ? "&pluginName=quickLaunch"
    : "?pluginName=quickLaunch";
  return {
    url: url + suffix
  };
};

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v9",
  center: [-104.37, 38.67],
  zoom: 3.68,
  attributionControl: false,
  transformRequest: transformRequest
});

const popupOffsets = {
  bottom: [0, -10]
};

const popup = new mapboxgl.Popup({
  offset: popupOffsets
});

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

map.addControl(draw);

map.on("click", "gl-draw-polygon-fill-static.hot", function() {
  getFeatureInfo(e);
});

map.on("click", "gl-draw-polygon-fill-static.cold", function(e) {
  getFeatureInfo(e);
});

function getFeatureInfo(e) {
  let id = e.features[0].properties.id;
  let desiredFeature;

  instance
    .get("/getannotations")
    .then(function(response) {
      let features = response.data;
      features.forEach((ft, idx) => {
        let feature = ft.feature.features[idx];
        if (id === feature.id) {
          desiredFeature = feature;
        }
      });
    })
    .then(() => {
      createTooltip(desiredFeature, e.lngLat);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function createTooltip(feature, coords) {
  let properties = feature.properties;

  // Populate the popup and set its coordinates
  // based on the feature found.
  popup
    .setLngLat(coords)
    .setHTML(
      `
        <ul>
          <li>Description: ${properties.description}</li>
          <li>Name: ${properties.name}</li>
          <li>Notes: ${properties.notes}</li>
        </ul>
      `
    )
    .addTo(map);
}

// Change the cursor to a pointer when the mouse is over the states layer.
map.on("mouseenter", "gl-draw-polygon-fill-static.cold", function() {
  map.getCanvas().style.cursor = "pointer";
});

// Change it back to a pointer when it leaves.
map.on("mouseleave", "gl-draw-polygon-fill-static.cold", function() {
  map.getCanvas().style.cursor = "";
});
// Change the cursor to a pointer when the mouse is over the states layer.
map.on("mouseenter", "gl-draw-polygon-fill-static.hot", function() {
  map.getCanvas().style.cursor = "pointer";
});

// Change it back to a pointer when it leaves.
map.on("mouseleave", "gl-draw-polygon-fill-static.hot", function() {
  map.getCanvas().style.cursor = "";
});

map.on("draw.create", () => {
  // add properties to feature
  let newFeature = draw.getAll().features[draw.getAll().features.length - 1];
  popSidePanel(newFeature);
});
map.on("draw.delete", e => {
  instance.post("/deleteannotation", e.features).catch(function(error) {
    console.log(error);
  });
  // close side panel
  annotationInfo.classList.add("hide");
});
map.on("draw.selectionchange", () => {
  // Change side panel
  if (draw.getSelected().features.length > 0) {
    popSidePanel(draw.getSelected().features[0]);
  } else {
    annotationInfo.classList.add("hide");
  }
});

map.on("style.load", () => {
  drawTools = document.getElementsByClassName("mapboxgl-ctrl-group")[0];
  drawTools.classList.add("hide");

  instance
    .get("/getannotations")
    .then(function(response) {
      let features = response.data;
      features.forEach(feature => {
        draw.add(feature.feature);
      });
    })
    .then(() => {
      draw.changeMode("static");
    })
    .catch(function(error) {
      console.log(error);
    });
});

annotationToggle.addEventListener("click", toggleAnnotationMode);
annotationSave.addEventListener("click", saveDataToGeojson);

function addLoading() {
  map.getCanvas().style.cursor = "wait";
}

function removeLoading() {
  map.getCanvas().style.cursor = "";
}

function convertDate(date) {
  return moment(date).format("MMMM Do YYYY, h:mm a");
}

function switchLayer(layer) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("btn--pill");
    buttons[i].classList.add("btn--stroke");
  }
  const layerId = layer.target.id;
  layer.target.classList.remove("btn--stroke");
  layer.target.classList.add("btn--pill");
  if (layerId.indexOf("mapbox") >= 0) {
    map.setStyle("mapbox://styles/" + layerId + "-v9");
    map.once("idle", () => {
      if (geojsonArray.length > 0) {
        const file = geojsonArray[0].filename.split(".")[0].replace(/\s/g, "");
        const geojson = geojsonArray[0].geojson;
        addLayerToMap(file, geojson, "geojson");
      }
    });
  } else {
    map.setStyle("mapbox://styles/" + layerId);
    map.once("idle", () => {
      if (geojsonArray.length > 0) {
        const file = geojsonArray[0].filename.split(".")[0].replace(/\s/g, "");
        const geojson = geojsonArray[0].geojson;
        addLayerToMap(file, geojson, "geojson");
      }
    });
  }
}

for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = switchLayer;
}

function addToLayerList(file, type) {
  layersAdded.classList.remove("hide");
  // Create li and close button with file name of what has been added to the map
  layerList.insertAdjacentHTML(
    "beforeend",
    `
    <li id="${file}-${type}" class="my6">
      ${file}
      <button id="${file}-${type}-remove-button" class="btn btn--s fr">X</button>
    </li>
  `
  );

  document.getElementById(
    `${file}-${type}-remove-button`
  ).onclick = function() {
    map.removeLayer(`${file}-${type}-layer`);
    map.removeSource(`${file}-${type}-source`);
    geojsonArray = geojsonArray.filter(i => {
      return i.file !== file;
    });

    this.parentNode.remove();

    if (layerList.children.length === 0) {
      layersAdded.classList.add("hide");
    }
  };
}

function addLayerToMap(file, geojson, type) {
  if (
    map.getSource(`${file}-${type}-source`) &&
    map.getLayer(`${file}-${type}-layer`)
  ) {
    alert(
      "Your map already has a source and layer with that name. Please rename your file and try again."
    );
    return false;
  } else if (map.getSource(`${file}-${type}-source`)) {
    alert(
      "Your map already has a source with that name. Please rename your file and try again."
    );
    return false;
  } else if (map.getLayer(`${file}-${type}-layer`)) {
    alert(
      "Your map already has a layer with that name. Please rename your file and try again."
    );
    return false;
  } else {
    let parseData = type === "geojson" ? JSON.parse(geojson) : geojson;
    if (!map.getSource(`${file}-${type}-source`)) {
      map.addSource(`${file}-${type}-source`, {
        type: "geojson",
        data: parseData
      });
    }

    if (!("color" in geojsonArray[0])) {
      const randomColor = getRandomColor();
      geojsonArray[0].color = randomColor;
    }

    switch (parseData.features[0].geometry.type) {
      case "MultiPolygon":
      case "Polygon":
        if (!map.getLayer(`${file}-${type}-layer`)) {
          map.addLayer({
            id: `${file}-${type}-layer`,
            type: "fill",
            source: `${file}-${type}-source`,
            paint: {
              "fill-color": geojsonArray[0].color,
              "fill-opacity": 0.4
            }
          });
        }
        break;
      case "MultiPoint":
      case "Point":
        if (!map.getLayer(`${file}-${type}-layer`)) {
          map.addLayer({
            id: `${file}-${type}-layer`,
            type: "circle",
            source: `${file}-${type}-source`,
            paint: {
              "circle-radius": 6,
              "circle-color": geojsonArray[0].color
            }
          });
        }
        break;
      case "MultiLineString":
      case "LineString":
        if (!map.getLayer(`${file}-${type}-layer`)) {
          map.addLayer({
            id: `${file}-${type}-layer`,
            type: "line",
            source: `${file}-${type}-source`,
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": geojsonArray[0].color,
              "line-width": 1
            }
          });
        }
        break;
      default:
        alert("Type is not supported. Please try again.");
        break;
    }
  }
}

function loadGeojson(filename, geojson, type = "geojson") {
  const file = filename.split(".")[0].replace(/\s/g, "");

  geojsonArray.push({
    geojson: geojson,
    type: type,
    filename: filename,
    file: file
  });

  addLayerToMap(file, geojson, type);
  addToLayerList(file, type);
}

function loadCsv(filename, csv) {
  csv2geojson.csv2geojson(csv, (err, data) => {
    loadGeojson(filename, data, "csv");
  });
}

function loadKml(filename, kml) {
  const newKML = new DOMParser().parseFromString(kml);
  const converted = tj.kml(newKML);
  loadGeojson(filename, converted, "kml");
}

function loadShp(filename, shp) {
  const geojson = {
    type: "FeatureCollection",
    features: []
  };
  const features = [];

  shp2geojson
    .open(shp)
    .then(source =>
      source
        .read()
        .then(function cycle(result) {
          if (result.done) return;
          features.push(result.value);
          return source.read().then(cycle);
        })
        .then(() => {
          geojson.features = features;
        })
    )
    .then(() => {
      loadGeojson(filename, geojson, "shp");
    })
    .catch(error => console.error(error.stack));
}

function dragEnter() {
  dndArea.classList.add("drag");
}

function dragLeave() {
  dndArea.classList.remove("drag");
}

function preventDefault(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}

function droppedData(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  const files = evt.dataTransfer.files;

  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    if (
      files[i].name.indexOf(".shp") > 0 ||
      files[i].name.indexOf(".zip") > 0
    ) {
      reader.readAsArrayBuffer(files[i]);
    } else {
      reader.readAsText(files[i], "UTF-8");
    }

    reader.onload = function(evt) {
      if (files[i].name.indexOf(".geojson") > 0) {
        loadGeojson(files[i].name, evt.target.result);
      } else if (files[i].name.indexOf(".csv") > 0) {
        loadCsv(files[i].name, evt.target.result);
      } else if (files[i].name.indexOf(".kml") > 0) {
        loadKml(files[i].name, evt.target.result);
      } else if (files[i].name.indexOf(".shp") > 0) {
        loadShp(files[i].name, evt.target.result);
      } else {
        alert(
          "That data type is not supported. Please use files ending in .geojson, .kml, .csv, or .shp"
        );
      }
    };
  }

  dndArea.classList.remove("drag");
}

function popSidePanel(feature) {
  annotationInfo.classList.remove("hide");
  annotationId.value = `${feature.id}`;
  if (isEmpty(feature.properties)) {
    annotationName.value = "";
    annotationDesc.value = "";
    annotationNotes.value = "";
  } else {
    annotationName.value = feature.properties.name;
    annotationDesc.value = feature.properties.description;
    annotationNotes.value = feature.properties.notes;
  }
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
  dndArea.addEventListener("dragenter", dragEnter);
  dndArea.addEventListener("dragleave", dragLeave);
  dndArea.addEventListener("dragover", preventDefault);
  dndArea.addEventListener("drop", droppedData);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function toggleAnnotationMode() {
  if (mode === "map" && annotationOnOff.innerHTML === "On") {
    annotationOnOff.innerHTML = "Off";
    annotationBanner.classList.remove("hide");
    drawTools.classList.remove("hide");
    draw.changeMode("simple_select");
    mode = "annotate";
  } else {
    annotationOnOff.innerHTML = "On";
    annotationBanner.classList.add("hide");
    annotationInfo.classList.add("hide");
    drawTools.classList.add("hide");
    draw.changeMode("static");
    mode = "map";
  }
}

function saveDataToGeojson(e) {
  e.preventDefault();
  document.getElementById("annotation_spinner").classList.remove("hide");
  let featuresArray = draw.getAll();
  for (var i = 0; i < featuresArray.features.length; i++) {
    if (
      featuresArray.features[i].id === annotationId.value &&
      featuresArray.features[i]
    ) {
      featuresArray.features[i].properties["name"] = annotationName.value;
      featuresArray.features[i].properties["description"] =
        annotationDesc.value;
      featuresArray.features[i].properties["notes"] = annotationNotes.value;
      draw.set(featuresArray);
      instance.post("/saveannotation", featuresArray).catch(function(error) {
        console.log(error);
      });
    }
  }
  setTimeout(() => {
    document.getElementById("annotation_spinner").classList.add("hide");
  }, 1247);
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}
