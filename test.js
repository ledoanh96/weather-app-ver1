const weatherKey = "3f396c019636440fbc663145182412";
const weatherBaseURL = "http://api.apixu.com/v1/current.json?";
const defaultCheckedBox = "C";
const ggkey = "AIzaSyCXjMCgV4xSa1GV_qZijGu7ZJHbdNLKEBU";
const proxyURL = "https://cors-anywhere.herokuapp.com/";
const autocompleteBaseURL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json?types=(cities)";

const placeDetailBaseURL =
  "https://maps.googleapis.com/maps/api/place/details/json?";
const defaultDisplayURL =
  "http://api.apixu.com/v1/current.json?key=3f396c019636440fbc663145182412&q=39.2903848,-76.6121893";
let currentSuggestion = -1;
let fetched = false;
const display = (json, state) => {
  const {
    location: { name },
    current: {
      condition: { icon, text },
      last_updated,
      humidity,
      temp_c,
      temp_f
    }
  } = json;
  console.log(json);
  document.querySelector(".city > span").innerHTML = name;
  document.querySelector(
    ".icon > span"
  ).innerHTML = `<img src="${icon}" alt="Cannot Load">`;
  document.querySelector(".time > span").innerHTML = last_updated;
  document.querySelector(".condition > span").innerHTML = text;
  document.querySelector(".temperature > span").innerHTML =
    state === "C" ? `${temp_c}°C` : `${temp_f}°F`;
  document.querySelector(".humidity > span").innerHTML = humidity;
};

const checkValue = json => {
  const radioButtons = document.getElementsByName("degree");
  radioButtons.forEach(e => {
    if (e.checked) {
      display(json, e.value);
    }
  });
};

const fetchWeatherURL = url => {
  fetch(url)
    .then(res => res.json())
    .then(myJson => {
      display(myJson, defaultCheckedBox);
      document
        .getElementById("buttons")
        .addEventListener("click", () => checkValue(myJson));
    });
};

fetchWeatherURL(defaultDisplayURL);

const fetchAutocomplete = places => {
  const autocompleteURL = `${proxyURL}${autocompleteBaseURL}&input=${places}&key=${ggkey}`;

  fetch(autocompleteURL)
    .then(res => res.json())
    .then(myJson => {
      const { status, predictions } = myJson;
      console.log(myJson);
      if (status !== "OK") {
        alert("AutocompleteAPI error!!!");
      }

      const suggestions = predictions.reduce(
        (acc, { description, place_id }, index) => {
          return (
            acc +
            `<a class="suggestionLink index_${index}" id="${place_id}">${description}</a>`
          );
        },
        ""
      );
      document.querySelector(".suggestions").innerHTML = suggestions;
      fetched = true;
    });
};

const fetchGeoCode = placeId => {
  const placeDetailURL = `${proxyURL}${placeDetailBaseURL}placeid=${placeId}&key=${ggkey}`;
  fetch(placeDetailURL)
    .then(res => res.json())
    .then(myJson => {
      const {
        result: {
          geometry: {
            location: { lat, lng }
          }
        }
      } = myJson;
      const weatherURL = `${weatherBaseURL}key=${weatherKey}&q=${lat},${lng}`;

      fetchWeatherURL(weatherURL);
    });
};

const resetCurrentSuggestion = () => {
  currentSuggestion = -1;
};

const changeCurrentSuggestion = (step, suggestionLength) => {
  if (
    !(currentSuggestion === suggestionLength - 1 && step === 1) &&
    !(currentSuggestion === -1 && step === -1)
  ) {
    currentSuggestion += step;
  }
};
const removeSelectedEffect = (index, suggestionLength) => {
  if (index > -1 || index < suggestionLength) {
    document.querySelector(`.index_${index}`).classList.remove("selected");
  }
};

const addSelectedEffect = index => {
  document.querySelector(`.index_${index}`).classList.add("selected");
};

document.querySelector("body").addEventListener("keydown", event => {
  if (event.keyCode === 13) {
    const places = document.getElementById("textfield").value;
    console.log(places);
    fetchAutocomplete(places);
    resetCurrentSuggestion();
  }
  if (fetched) {
    //down arrow
    if (event.keyCode === 40) {
      changeCurrentSuggestion(+1, 5);
      removeSelectedEffect(currentSuggestion - 1);
    }
    //up arrow
    if (event.keyCode === 38) {
      changeCurrentSuggestion(-1, 5);
      removeSelectedEffect(currentSuggestion + 1);
    }
    if (currentSuggestion > -1) {
      addSelectedEffect(currentSuggestion);
    }
  }
});

document.querySelector("body").addEventListener("click", event => {
  if (event.target.classList.contains("suggestionLink")) {
    fetchGeoCode(event.target.id);
  }
});

