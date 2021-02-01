'use strict';
/*
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


//Getting the lat and long and displaying map using Leaflet
let map;
let mapEvent;
if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(function(position){
const latitude = position.coords.latitude;
const longitude = position.coords.longitude;
console.log(`Your latitude is: ${latitude} and your longitude is: ${longitude}`);
console.log(`https://www.google.co.in/maps/@${latitude},${longitude},7z`);
console.log(`https://www.google.co.in/maps/@${19.012917744998852},${73.02269267162826},7z`);, 

map = L.map('map').setView([latitude, longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([latitude, longitude])
.addTo(map)
.bindPopup(L.popup({autoClose:false,closeOnClick:false}))
.setPopupContent('My Location')
.openPopup();

    map.on('click',function(mapE){
    mapEvent = mapE;
    form.classList.remove('hidden'); 
    // inputDistance.focus();
    
    });
    
} , function(){
    alert(`cannot find your location`);
});

//Submit event for first row
form.addEventListener('submit',function(e){
e.preventDefault();
//clear input fields
inputDistance.blur();
inputDuration.blur();
inputCadence.blur();
inputElevation.blur();
inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
//Display Marker
    const {lat,lng} = mapEvent.latlng;
    L.marker([lat,lng])
    .addTo(map)
    .bindPopup(L.popup({maxWidth:200,minWidth:100,autoClose:false,closeOnClick:false,className: 'running-popup'}))
    .setPopupContent('Here')
    .openPopup();
});

inputType.addEventListener('change',function(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
})*/








const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map,mapEvent;



class Workout { 
    date = new Date();
    id = (Date.now() + '').slice(-10);
constructor(coords,duration,distance){
this.coords = coords;
this.duration = duration;
this.distance = distance;
}

_setDescription(){
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
}

};

class Running extends Workout {
    constructor(coords,duration,distance,cadence){
        super(coords,duration,distance);
        this.cadence = cadence;
        this.type = 'running';
        this.calcPace();
        this._setDescription();
    }
calcPace(){
    this.pace = this.duration/this.distance;
    return this.pace;
}

};

class Cycling extends Workout {
    constructor(coords,duration,distance,elevationGain){
        super(coords,duration,distance);
        this.elevationGain = elevationGain;
        this.type = 'cycling';
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed(){
        this.speed = this.distance/(this.duration/60);
        return this.speed;
    } 
};





//Application Architecture//    
class Application {
    #map;
    #mapEvent;
    #workouts = [];
constructor(){
  //this._getPosition();
  this._getLocalStorage();
  form.addEventListener('submit',this._newWorkout.bind(this));
  inputType.addEventListener('change',this._toggleElevationField);
  containerWorkouts.addEventListener('click',this._movetoPopup.bind(this)); 
};

_getPosition(){

if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this) , function(){
    alert(`cannot find your location`);
});
};

_loadMap(position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(`Your latitude is: ${latitude} and your longitude is: ${longitude}`);
    console.log(`https://www.google.co.in/maps/@${latitude},${longitude},7z`);
    
    this.#map = L.map('map').setView([latitude, longitude], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
    L.marker([latitude, longitude])
    .addTo(this.#map)
    .bindPopup(L.popup({autoClose:false,closeOnClick:false}))
    .setPopupContent('My Location')
    .openPopup();
    
        this.#map.on('click',this._showForm.bind(this));
        this.#workouts.forEach(works => {
            this._renderWorkoutMarker(works);
        });
};

_showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); 
    // inputDistance.focus();
};

_hideForm(){
    form.classList.add('hidden'); 
 //clear input fields
 inputDistance.blur();
 inputDuration.blur();
 inputCadence.blur();
 inputElevation.blur();
 inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
};

_toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
};

_newWorkout(e){
    e.preventDefault();
//get data from form
const type = inputType.value;
const distance = +inputDistance.value;
const duration = +inputDuration.value;
const {lat,lng} = this.#mapEvent.latlng;
let workout;

//if workout running, create running object
if(type === 'running'){
    const cadence = +inputCadence.value
    //check if data is valid
    if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence))
    return alert(`Please enter a valid number`);
    if(distance<=0 ||duration<=0 || cadence<=0){
return alert(`Please enter a number greater than 0`);
    }
    workout = new Running([lat,lng],distance,duration,cadence);
}

//if workout cycling, create cycling object
if(type === 'cycling'){
    const elevationGain = +inputElevation.value
    //check if data is valid
    if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevationGain))
    return alert(`Please enter a valid number`);
    if(distance<=0 ||duration<=0 || elevationGain<=0){
        return alert(`Please enter a number greater than 0`);
            }
            workout = new Cycling([lat,lng],distance,duration,elevationGain);
           
}
//Add the new object to the array
this.#workouts.push(workout);
//Render workour on map as marker
this._renderWorkoutMarker(workout);
//Render workout data
this._renderWorkout(workout);
//Hide the form after entering values and clicking enter key
this._hideForm();
//Storing data to local storage using storage API
this._setLocalStorage();

   
};
_renderWorkoutMarker(workout){
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(L.popup({maxWidth:200,minWidth:100,autoClose:false,closeOnClick:false,className: `${workout.type}-popup`}))
    .setPopupContent(`${workout.type==='running' ? '🏃‍♂️': '🚴‍♀️'} ${workout.description}`)
    .openPopup();
}
_renderWorkout(workout){

let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
<h2 class="workout__title">${workout.description}</h2>
<div class="workout__details">
  <span class="workout__icon">${workout.type==='running' ? '🏃‍♂️': '🚴‍♀️'}</span>
  <span class="workout__value">${workout.distance}</span>
  <span class="workout__unit">km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>`;

if(workout.type === 'running')
html += `<div class="workout__details">
<span class="workout__icon">⚡️</span>
<span class="workout__value">${workout.pace.toFixed(1)}</span>
<span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
<span class="workout__icon">🦶🏼</span>
<span class="workout__value">${workout.cadence}</span>
<span class="workout__unit">spm</span>
</div>
</li>`;

if(workout.type === 'cycling')
html += `<div class="workout__details">
<span class="workout__icon">⚡️</span>
<span class="workout__value">${workout.speed.toFixed(1)}</span>
<span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
<span class="workout__icon">⛰</span>
<span class="workout__value">${workout.elevationGain}</span>
<span class="workout__unit">m</span>
</div>
</li> `;
form.insertAdjacentHTML('afterend',html);
}

_movetoPopup(e){
//to match the id of workout container and the id from the array of the marker
const movetoClick = e.target.closest('.workout');
//console.log(movetoClick);
if(!movetoClick) return;
const workout = this.#workouts.find(work => work.id === movetoClick.dataset.id);
//console.log(workout);
//move to marker on click in the container
this.#map.setView(workout.coords,13,{
    animate: true,
    pan: {
        duration:1
    }
});
}
//To set local storage and get the local storage
_setLocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.#workouts))
    }

    _getLocalStorage(){
      const data =  JSON.parse(localStorage.getItem('workouts'))
        console.log(data);
        if(!data) return
        this.#workouts = data;
        this.#workouts.forEach(works => {
            this._renderWorkout(works);
        });
        }

};
const app = new Application();
app._getPosition();

const testFun = function(){
console.log("CI/CD with Netlify Tested");
};
testFun();

const testFunAgain = function(){
    console.log("Workout testing done");
    };
    testFunAgain();