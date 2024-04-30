const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');

const grantAcessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');
const loadingScreen  = document.querySelector('.loading-container');
const userInfoContainer  = document.querySelector('.user-info-container');

// Initially variables
let currentTab = userTab;
let apiKey = '86cec994a8a252ff887115800137b1ea';
currentTab.classList.add('current-tab');
getfromSessionStorage();

userTab.addEventListener('click',()=> {
    // pass userTab as input parameter
    switchTab(userTab);
})
searchTab.addEventListener('click',()=> {
    // pass searchTab as input parameter
    switchTab(searchTab);
})

function switchTab(clickedTab){
    if(currentTab != clickedTab){  
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');    

        if(!searchForm.classList.contains('active')){
            grantAcessContainer.classList.remove('active')
            userInfoContainer.classList.remove('active')
            searchForm.classList.add('active');
        }
        else{
            // First i was on Search tab now had to visible User Tab
            searchForm.classList.remove('active');
            userInfoContainer.classList.remove('active');
            // If switched to Your Weather, then display weather
            // so Let's check local storage first
            getfromSessionStorage();
        }
    }
}

// Check if coordinates already present in Session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        // if local coordinates not found 
        grantAcessContainer.classList.add('active');
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const lat = coordinates.latitude;
    const lon = coordinates.longitude;

    // Make grant container invisible
    grantAcessContainer.classList.remove('active');
    // Make error conatainer invisible
    errorContainer.classList.remove('active');
    // Make loader visible
    loadingScreen.classList.add('active');
    // API CALL 
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();  

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data)  
    } 
    catch (error) {
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        errorContainer.classList.add('active');
    }
}

function renderWeatherInfo(weatherInfo){
    // Firstly we have to Fetch the Elements
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    // Update Weather Data to UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}@2x.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}


const msgText = document.querySelector('[data-messageText]')
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //show an alert for no geolocation support available
        grantAccessButton.style.display = 'none';
        msgText.innerText = 'Geolocation is not supported by this browser';
    }
}

function showPosition(position){

    const userCoordinates = {
         latitude : position.coords.latitude,
         longitude : position.coords.longitude
    }

    sessionStorage.setItem('user-coordinates',JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click',getLocation);

let searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === '') return;

    errorContainer.classList.remove('active');
    fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAcessContainer.classList.remove('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();  
        
        loadingScreen.classList.remove('active');
        errorContainer.classList.remove('active');
        userInfoContainer.classList.add('active');

        renderWeatherInfo(data)  
    }
     catch (error) {
        // Show 404 error
        userInfoContainer.classList.remove('active');
        errorContainer.classList.add('active');
        retry.addEventListener('click',()=>{
            errorContainer.classList.remove('active');
            fetchSearchWeatherInfo(city);
        });
        console.log("ERROR: ",error)
    }
    
}
const errorContainer = document.querySelector('.error-container');
const retry = document.querySelector('[data-retryBtn]');

