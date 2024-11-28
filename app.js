const searchInput = document.querySelector("#search-bar");
const searchBtn = document.querySelector("#search-btn");
const inputForm = document.querySelector("form");

const getWeather = async (place) => {
  if (place) {
    try {
      const loc = place.loc;
      const lat = place.lat;
      const lon = place.lon;

      const config = {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: "true",
          hourly: "relativehumidity_2m",
        },
      };
      const res = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        config,
      );
      const temp = res.data.current_weather.temperature;
      const wind = res.data.current_weather.windspeed;
      const weatherCode = res.data.current_weather.weathercode;

      const hourlyData = res.data.hourly;
      const currentTime = res.data.current_weather.time;
      const currentHour = currentTime.split(":")[0] + ":00";
      const currentHourIndex = hourlyData.time.findIndex(
        (time) => time === currentHour,
      );
      let humidity = "none";
      if (currentHourIndex !== -1) {
        humidity = hourlyData.relativehumidity_2m[currentHourIndex];
      }
      // console.log("Location: ", loc);
      // console.log("Temperature:", temp, "°C");
      // console.log("Wind Speed:", wind, "km/h");
      // console.log("Humidity:", humidity, "%");
      // console.log("Weather Code: ", weatherCode);
      // console.log("Current time:", currentTime);
      // console.log("Current hour:", currentHour);
      return { loc, temp, wind, humidity, weatherCode };
    } catch (e) {
      console.log("Error fetching weather for give coordinates: ", e);
      return null;
    }
  }
};

const getCords = async () => {
  try {
    const config = {
      params: {
        name: searchInput.value.trim(),
        format: "json",
        count: "1",
        language: "en",
      },
    };
    const res = await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      config,
    );
    const loc = res.data.results[0].name;
    const lat = res.data.results[0].latitude;
    const lon = res.data.results[0].longitude;
    return { loc, lat, lon };
  } catch (e) {
    console.log("Error fetch coordinates: ", e);
    return null;
  }
};

const weatherInfo = document.querySelector(".weather-info");
const searchBar = document.querySelector("#search-bar");

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const place = await getCords();
  const weatherObj = await getWeather(place);
  searchBar.value = "";
  console.log(weatherObj);

  weatherInfo.innerHTML = "";
  if (weatherObj) {
    console.log(getImgPath());
    const imgPath = getImgPath();
    weatherInfo.innerHTML = `
        <img id="weather-img" src="${imgPath}" />
        <h1 id="temperature">${weatherObj.temp}°C</h1>
        <h2 id="name">${weatherObj.loc}</h2>

        <div class="additional-info">
          <div class="col">
            <img src="images/humidity_sym.png" />
            <div>
              <p id="humidity">${weatherObj.humidity}%</p>
              <p>Humidity</p>
            </div>
          </div>
          <div class="col">
            <img src="images/wind_sym.png" />
            <div>
              <p id="wind">${weatherObj.wind}km/h</p>
              <p>Wind Speed</p>
            </div>
          </div>
        </div>
  `;
  } else {
    const errorMsg = document.createElement("p");
    errorMsg.innerText = "Invalid Location! (Try a valid city/country name)";
    errorMsg.classList.add("error");
    weatherInfo.appendChild(errorMsg);
  }

  function getImgPath() {
    let imgPath;

    switch (weatherObj.weatherCode) {
      case 0:
        imgPath = "images/sunny.png";
        break;
      case 1:
      case 2:
        imgPath = "images/partly_cloudy.png";
        break;
      case 3:
      case 45:
      case 48:
        imgPath = "images/cloudy.png";
        break;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        imgPath = "images/rain.png";
        break;
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        imgPath = "images/snow.png";
        break;
      case 95:
      case 96:
      case 99:
        imgPath = "images/thunder_cloud.png";
        break;
      default:
        imgPath = "images/windy.png";
    }

    return imgPath;
  }
});
