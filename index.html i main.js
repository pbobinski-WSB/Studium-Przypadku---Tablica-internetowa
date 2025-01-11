HTML:
<!DOCTYPE html> 
<html lang="en"> 
<head> 
<meta charset="UTF-8"> 
<meta name="viewport" content="width=device-width, initial
scale=1.0"> 
<title>Weather app</title> 
<link rel="stylsheet" type="text/css" href="./main.css"> 
</head> 
<body> 
<div class="container"> 
<div class="by_city"> 
            <input class="input" /> 
            <button class="btn">Pobierz pogodę</button> 
            <button class="calc_btn">Przelicz temperaturę na 
Fahrenheit/Celsius</button> 
 
            <div class="weather_details" style="border-bottom: 1px 
solid black;"> 
                <p class="city"></p> 
                <p class="temp"></p> 
                <p class="humidity"></p> 
                <p class="wind"></p> 
                <p class="pressure"></p> 
                <p class="sunrise"></p> 
                <p class="sunset"></p> 
            </div> 
            <div class="pollution_details"> 
                <p class="co"></p> 
                <p class="nh3"></p> 
                <p class="no"></p> 
                <p class="no2"></p> 
                <p class="o3"></p> 
                <p class="pm2_5"></p> 
                <p class="pm10"></p> 
                <p class="so2"></p> 
            </div> 
        </div> 
    </div> 
 
    <script src="./main.js"></script> 
</body> 
 
</html>



 JAVA SCRIPT:
console.log("Weather app"); 
// 
https://api.openweathermap.org/data/2.5/weather?q=Warsaw&APPID=f8eee432
 567bd47e60a37fc1d5ba54c0 
let tempUnit = "C"; 
 
const getWeatherButton = document.querySelector(".btn"); 
const getWeatherInput = document.querySelector(".input"); 
 
const displayWeather = (weatherJson) => { 
  const city = document.querySelector(".city"); 
  city.textContent = "Miasto: " + weatherJson.name; 
  const temp = document.querySelector(".temp"); 
  temp.textContent = "Temperatura: " + weatherJson.main.temp + "°C"; 
  const humidity = document.querySelector(".humidity"); 
  humidity.textContent = "Wilgotność: " + weatherJson.main.humidity + 
"%"; 
  const wind = document.querySelector(".wind"); 
  wind.textContent = 
    "Prędkość wiatru: " + 
    (Number(weatherJson.wind.speed) * 3.6).toFixed(2) + 
    " km/h"; 
 
  const pressure = document.querySelector(".pressure"); 
  pressure.textContent = "Ciśnienie: " + weatherJson.main.pressure + " 
hPa"; 
 
  const sunrise = document.querySelector(".sunrise"); 
 
  sunrise.textContent = 
    "Wschód słońca (UTC): " + convertTime(weatherJson.sys.sunrise); 
 
  const sunset = document.querySelector(".sunset"); 
  sunset.textContent = 
    "Zachód słońca (UTC): " + convertTime(weatherJson.sys.sunset); 
}; 
 
const getAirPollution = async (lat, lon) => { 
  const data = await fetch( 
    
`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5085&lon=-0.1257&APPID=f8eee432567bd47e60a37fc1d5ba54c0` 
  ); 
  const jsonData = await data.json(); 
 
  return jsonData; 
}; 
 
const displayPollution = (data) => { 
  const co = document.querySelector(".co"); 
  co.textContent = "CO: " + data.co; 
 
  const nh3 = document.querySelector(".nh3"); 
  nh3.textContent = "NH3: " + data.nh3; 
  const no = document.querySelector(".no"); 
  no.textContent = "NO: " + data.no; 
  const no2 = document.querySelector(".no2"); 
  no2.textContent = "NO2: " + data.no2; 
  const o3 = document.querySelector(".o3"); 
  o3.textContent = "O3: " + data.o3; 
  const pm2_5 = document.querySelector(".pm2_5"); 
  pm2_5.textContent = "PM2.5: " + data.pm2_5; 
  const pm10 = document.querySelector(".pm10"); 
  pm10.textContent = "PM10: " + data.pm10; 
  const so2 = document.querySelector(".so2"); 
  so2.textContent = "SO2: " + data.so2; 
}; 
 
const getWeather = async () => { 
  const cityFromInput = getWeatherInput.value; 
 
  if (cityFromInput.length > 0) { 
    try { 
      const data = await fetch( 
        
`https://api.openweathermap.org/data/2.5/weather?q=${cityFromInput}&APP
 ID=f8eee432567bd47e60a37fc1d5ba54c0&units=metric` 
      ); 
 
      const jsonData = await data.json(); 
      console.log(jsonData); 
 
      displayWeather(jsonData); 
      tempUnit = "C"; 
 
      const airPollutionData = await getAirPollution(); 
      console.log(airPollutionData); 
      displayPollution(airPollutionData.list[0].components); 
    } catch (e) { 
      alert("Coś poszło nie tak..."); 
    } 
  } else alert("Proszę podać nazwę miasta"); 
}; 
 
getWeatherButton.addEventListener("click", getWeather); 
 
const convertTemperature = () => { 
  const temp = document.querySelector(".temp"); 
  console.log(temp); 
  if (tempUnit === "C") { 
    const mySubString = temp.textContent.substring( 
      temp.textContent.indexOf(" ") + 1, 
      temp.textContent.lastIndexOf("°") 
    ); 
    const tempCel = Number(mySubString); 
    const convertedTemp = (tempCel * 9) / 5 + 32; 
    temp.textContent = 
      "Temperatura: " + convertedTemp.toFixed(2) + "Fahrenheit"; 
 
    tempUnit = "F"; 
  } else { 
    const mySubString = temp.textContent.substring( 
      temp.textContent.indexOf(" ") + 1, 
      temp.textContent.lastIndexOf("F") 
    ); 
    const tempFahr = Number(mySubString); 
    const convertedTemp = ((tempFahr - 32) * 5) / 9; 
    temp.textContent = "Temperatura: " + convertedTemp.toFixed(2) + 
"°C"; 
 
    tempUnit = "C"; 
} 
}; 
const calcBtn = document.querySelector(".calc_btn"); 
calcBtn.addEventListener("click", convertTemperature); 
const convertTime = (timestamp) => { 
const sunriseTimestamp = new Date(Number(timestamp) * 1000); 
const hours = sunriseTimestamp.getHours(); 
const minutes = "0" + sunriseTimestamp.getMinutes(); 
return hours + ":" + minutes.substr(-2); 
}; 

