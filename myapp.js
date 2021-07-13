
/* 
   This JavaScript file contains all the code for getting the Open Data, 
   build the HTML code, and create the structure of the whole Web document 
*/

//After the browser finishes loading the main html document, run the logic
window.onload = (event) => {
  main();
}

// URLs of the HKO data
const WEATHER_FORECAST_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en"
const WEATHER_REPORT_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en"

// Functions to get Current Weather report and 9-Day forecast data
async function getUrlJson(url) {
  return fetch(url).then(response => response.json());
}
getReportJson = async () => getUrlJson(WEATHER_REPORT_URL);
getForecastJson = async () => getUrlJson(WEATHER_FORECAST_URL);

// The main function for building the whole application
async function main () {
	try {
    var reportJson = await getReportJson(), forecastJson = await getForecastJson();
  } catch (err) {
    console.error(err);
    document.getElementById('header').innerHTML = 
      "Unable to retrieve weather data. Check the internet connection or try again later.";
  }
  generateHeader(reportJson);
  generateTempBlc(reportJson);
  generateWForecast(forecastJson);
}

// Build the header block
function generateHeader(reportJson) {
  let header = document.getElementById('header');

  let title = document.createElement('div');
  title.id = 'htitle';
  title.innerHTML = 'Hong Kong';
  header.append(title);

  let winfoContainer = document.createElement('div');
  winfoContainer.id = 'winfobox';
  header.append(winfoContainer);

  let tempBlc = document.createElement('span');
  tempBlc.className = 'winfo';
  let iconidx = reportJson.icon[0];
  let icon = document.createElement('img');
  icon.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconidx}.png`;
  icon.id = 'icon';
  tempBlc.append(icon);
  let tempData = reportJson.temperature.data[1].value;
  let temp = document.createElement('span');
  let sup = '<span class="sup">°C</span>'
  temp.id = 'temp';
  temp.innerHTML = `${tempData}` + sup;
  tempBlc.append(temp);
  winfoContainer.append(tempBlc);

  let humBlc = document.createElement('span');
  humBlc.setAttribute('class', 'winfo');
  let humIcon = "<img id='drop' src='images/drop-64.png'>";
  let humData = reportJson.humidity.data[0].value;
  humBlc.innerHTML = humIcon + `<span id='humidity'>${humData}%</span>`;
  winfoContainer.append(humBlc);
}

//Build the selection block for selecting temp data of different locations
function generateTempBlc(reportJson) {
  let showT = document.getElementById('showT');

  let ttitle = document.createElement('div');
  ttitle.id = 'ttitle';
  ttitle.innerHTML = 'Temperatures';
  showT.append(ttitle);

  let myTemp = JSON.parse(JSON.stringify(reportJson.temperature.data));
  myTemp.sort((a, b) => {
    let p = a.place, q = b.place;
    if (p < q) return -1;
    else if (p == q) return 0;
    else return 1;
  });

  let tempData = document.createElement('div');
  tempData.id = 'sblock';
  let toptions = '';
  myTemp.forEach((ele, idx) => {
    toptions += `<option value="${idx}">${ele.place}</option>`;
  });
  let tselect = '<label>Select the location</label><select name="temp" id="temp-reg">'+toptions+'</select>';
  tempData.innerHTML = tselect;
  showT.append(tempData);

  let tblock = document.createElement('div');
  tblock.id = 'tblock';
  showT.append(tblock);
  document.getElementById('temp-reg').addEventListener('change', event => {
    let value = myTemp[event.target.value].value;
    document.getElementById('tblock').innerHTML = `<span class='ltemp'>${value}</span><span class="sup2">°C</span>`;
  });
}

//Build the 9-Day forecast block
function generateWForecast(forecastJson) {
  let FCblock = document.getElementById('forecast');
  let Ftitle = document.createElement('div');
  Ftitle.id = 'ftitle';
  Ftitle.innerHTML = '9-Day Forecast';
  FCblock.append(Ftitle);

  let FCWrap = document.createElement('div');
  FCWrap.id = 'FCWrap';
  FCblock.append(FCWrap);

  for (let day of forecastJson.weatherForecast) {
    let forecast = document.createElement('div');
    forecast.setAttribute('class', 'forecast');
    let date = parseInt(day.forecastDate.substring(6))+'/'+parseInt(day.forecastDate.substring(4,6));
    let fWeek = `<span class='fweek'>${day.week.slice(0,3)} ${date}</span>`;
    let fTemp = `<span class='ftemp'>${day.forecastMintemp.value}-${day.forecastMaxtemp.value}°C</span>`;
    let fHumid = `<span class='fhumid'>${day.forecastMinrh.value}-${day.forecastMaxrh.value}%</span>`;
    let fIcon = `<img class='ficon' src='https://www.hko.gov.hk/images/HKOWxIconOutline/pic${day.ForecastIcon}.png'`;

    const PSRImgSet = {
      'High': 'https://www.hko.gov.hk/common/images/PSRHigh_50_light.png', 
      'Medium High': 'https://www.hko.gov.hk/common/images/PSRMediumHigh_50_light.png', 
      'Medium': 'https://www.hko.gov.hk/common/images/PSRMedium_50_light.png', 
      'Medium Low': 'https://www.hko.gov.hk/common/images/PSRMediumLow_50_light.png', 
      'Low': 'https://www.hko.gov.hk/common/images/PSRLow_50_light.png'
    };

    let PSRImg = PSRImgSet[day.PSR];
    let PSR = `<img class='fIcon PSR' src'${PSRImg}'>`;
    forecast.innerHTML = fWeek + fIcon + PSR + fTemp + fHumid;
    FCWrap.append(forecast);
  }
}

