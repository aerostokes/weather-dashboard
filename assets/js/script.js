var apiKey = "eda476c11bccb95f73cbcbb9c9577dfa";
var searchBtn = document.getElementById("search-btn");
var cityDateEl = document.getElementById("city-date")
var weatherIconImg = document.getElementById("weather-icon")
var currentSection = document.getElementById("current")
var containerSection = document.getElementById("card-container")


// on page load: run event listeners
searchBtn.addEventListener("click", searchGeocode);

//TODO: prevent empty search
//TODO: set default for page load


function searchGeocode(event) {
    event.preventDefault();
    var cityStr = document.getElementById("search-input").value;
    console.log(cityStr);
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + cityStr + "&limit=1&appid=" + apiKey).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                if (data.length > 0) {
                    console.log(data[0]);
                    var lat = data[0].lat;
                    console.log(lat);
                    var lon = data[0].lon;
                    console.log(lon);
                    cityStr = data[0].name
                    if (data[0].state) { cityStr = cityStr + ", " + data[0].state}
                    if (data[0].country) { cityStr = cityStr + ", " + data[0].country}
                    console.log(cityStr);
                    cityDateEl.textContent = cityStr + " (" + dayjs().format("M/D/YYYY") + ") ";
                    searchCurrent(lat, lon);
                    searchForecast(lat, lon);
                } else { alert("City not found. Try again") };
            });
        } else { alert("An error has occured, try again later.") };
    });    
};

function searchCurrent(lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial").then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
                console.log(data);
                var iconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
                var currentWeather = {
                    temperature: "Temp: " + data.main.temp + "°F",
                    wind: "Wind: " + data.wind.speed + "MPH",
                    humidity: "Humidity: " + data.main.humidity + "%"
                };
                writeCurrent (iconURL, currentWeather);
            });
        } else { alert( "An error has occured, try again later,") };
    })
};

function writeCurrent (iconURL, currentWeather) {
    weatherIconImg.setAttribute("src", iconURL);
    console.log(currentWeather);
    for (key in currentWeather) {
        var conditionEl = document.createElement("p");
        conditionEl.textContent = currentWeather[key];
        currentSection.appendChild(conditionEl);
    }

}



function searchForecast(lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial").then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
                console.log(data);
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
    }

}