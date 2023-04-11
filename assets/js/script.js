var apiKey = "eda476c11bccb95f73cbcbb9c9577dfa";
var searchBtn = document.getElementById("search-btn");
var priorSearches = document.getElementById("prior-searches")
var priorSearchArr = []
var weatherSection = document.getElementById("weather");
var cityDateEl = document.getElementById("city-date");
var weatherIconImg = document.getElementById("weather-icon");
var currentSection = document.getElementById("current");
var containerSection = document.getElementById("card-container");


// On page load: run event listeners and pull prior searches from localStorage
getPriorSearches();
searchBtn.addEventListener("click", searchGeocode);
priorSearches.addEventListener("click", function() {
    if (event.target.matches("li")) {
        var cityObj = priorSearchArr.find(obj => obj.name == event.target.textContent)
        searchCurrent(cityObj.name, cityObj.lat, cityObj.lon);
        searchForecast(cityObj.lat, cityObj.lon);
    }
});



// Callback functions: 

// Retrieve prior searches from localStorage and populate page
function getPriorSearches() {
    if (localStorage.getItem("PriorSearches")) {
        priorSearchArr = JSON.parse(localStorage.getItem("PriorSearches"));
        // console.log(priorSearchArr);
        priorSearchArr.forEach(element => { 
            var newPrior = document.createElement("li");
            newPrior.textContent = element.name;
            priorSearches.appendChild(newPrior);
        });
    }
}

// Fetch latitude and longitude data from API
function searchGeocode(event) {
    event.preventDefault();
    var cityStr = document.getElementById("search-input").value.trim();
    if (cityStr) {
        fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + cityStr + "&limit=1&appid=" + apiKey).then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    if (data.length > 0) {
                        var lat = data[0].lat;
                        var lon = data[0].lon;
                        cityStr = data[0].name
                        if (data[0].state) { cityStr += ", " + data[0].state}
                        if (data[0].country) { cityStr += ", " + data[0].country}
                        saveSearch(cityStr, lat, lon);
                        searchCurrent(cityStr, lat, lon);
                        searchForecast(lat, lon);
                    } else { alert("City not found. Try again") };
                });
            } else { alert("An error has occured, try again later.") };
        }); 
    };
};

// If current city search isn't already saved, add it local storage and populate the page with a new element
function saveSearch(cityStr, lat, lon) {
    if (!(priorSearchArr.find(obj => obj.name == cityStr))) {
        priorSearchArr.push({
            name: cityStr,
            lat: lat,
            lon: lon,
        });
        localStorage.setItem("PriorSearches", JSON.stringify(priorSearchArr));
        var newPrior = document.createElement("li");
        newPrior.textContent = cityStr;
        priorSearches.appendChild(newPrior);
    };
};

// Fetch current weather data from API
function searchCurrent(cityStr, lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial").then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var iconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
                var currentWeather = {
                    temperature: "Temp: " + data.main.temp + "°F",
                    wind: "Wind: " + data.wind.speed + "MPH",
                    humidity: "Humidity: " + data.main.humidity + "%"
                };
                deleteCurrentAndForecast()
                writeCurrent (cityStr, iconURL, currentWeather);
            });
        } else { alert( "An error has occured, try again later,") };
    })
};

// Delete any exisiting current weather and forecast data
function deleteCurrentAndForecast () {
    for (let i = 0; i < currentSection.children.length;) {
        if (currentSection.children[i].matches("p")) { 
            currentSection.removeChild(currentSection.children[i]);
        } else { i++ };
    };

    do {
        containerSection.removeChild(containerSection.firstChild);
    } while (containerSection.firstChild);
}

// Populate page with current weather data
function writeCurrent (cityStr, iconURL, currentWeather) {
    cityDateEl.textContent = cityStr + " (" + dayjs().format("M/D/YYYY") + ") ";
    weatherIconImg.setAttribute("src", iconURL);
    for (key in currentWeather) {
        var conditionEl = document.createElement("p");
        conditionEl.textContent = currentWeather[key];
        currentSection.appendChild(conditionEl);
    };
    weatherSection.removeAttribute("class");

};

// Fetch 5 day forecast data from API
function searchForecast(lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial").then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
                for (let i = 2; i <= 34; i+=8) {
                    var dateData = data.list[i]
                    dateStr = dayjs.unix(dateData.dt).format("M/D/YYYY");
                    var iconURL = "https://openweathermap.org/img/wn/" + dateData.weather[0].icon + "@2x.png";
                    var forecastWeather = {
                            temperature: "Temp: " + dateData.main.temp + "°F",
                            wind: "Wind: " + dateData.wind.speed + "MPH",
                            humidity: "Humidity: " + dateData.main.humidity + "%"
                        };
                        writeForecast (dateStr, iconURL, forecastWeather);
                    }
            });
        } else { alert( "An error has occured, try again later,") };
    });
};

// Populate page with forecast data
function writeForecast (dateStr, iconURL, forecastWeather) {

    var newCard = document.createElement("section");
    newCard.setAttribute("class", "card");
    containerSection.appendChild(newCard);

    var newTitle = document.createElement("h5");
    newTitle.textContent = dateStr;
    newCard.appendChild(newTitle);

    var iconImg = document.createElement("img");
    iconImg.setAttribute("src", iconURL);
    newCard.appendChild(iconImg);

    for (key in forecastWeather) {
        var conditionEl = document.createElement("p");
        conditionEl.textContent = forecastWeather[key];
        newCard.appendChild(conditionEl);
    };
};