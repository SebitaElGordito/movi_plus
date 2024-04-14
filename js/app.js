const menu= document.querySelector(".menu");
const openMenuBtn= document.querySelector(".open__menu");
const closeMenuBtn= document.querySelector(".close__menu");

function toggleMenu(){
    menu.classList.toggle("menu--opened");
}

openMenuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);


const nombreyapellido= document.querySelector(".nombre__apellido");

function opacidadTitulo(){
    nombreyapellido.classList.toggle("titulo--opaco")
}

openMenuBtn.addEventListener("click", opacidadTitulo);
closeMenuBtn.addEventListener("click", opacidadTitulo);


const menuLinks = document.querySelectorAll('.menu a[href^="#"]');

const observer = new IntersectionObserver((entries) =>{
    entries.forEach(entry => {
        const id = entry.target.getAttribute("id");
        const menuLink = document.querySelector(`.menu a[href="#${id}"]`);

    if (entry.isIntersecting){
        document.querySelector(".menu a.selected").classList.remove("selected");
        menuLink.classList.add("selected");
    }
    })
}, {rootMargin: "-40% 0px -60% 0px"});

menuLinks.forEach(menuLink =>{
    menuLink.addEventListener("click", function(){
        menu.classList.remove("menu--opened");
        opacidadTitulo();
    })

    const hash = menuLink.getAttribute("href");
    const target = document.querySelector(hash);
    if(target){
        observer.observe(target);
    }
})


//Lógica para la app de viajes
const api_url = 'https://www.mapquestapi.com/directions/v2/route?';
const search_url = 'https://www.mapquestapi.com/search/v2/radius?';
const traffic_url = 'https://www.mapquestapi.com/traffic/v2/incidents?';
const key = 'ZyzjVAwrDXklY04H3wsUT45vlaLKuj0k';

// Inicializa el mapa con una ubicación predeterminada al cargar la página
window.onload = function() {
  const default_map_url = `https://www.mapquestapi.com/staticmap/v5/map?key=${key}&center=40.7128,-74.0060&size=600,400@2x`;
  document.getElementById('map').src = default_map_url;
};

async function find_charging_stations(origin, destination) {
    const route_url = api_url + new URLSearchParams({key: key, from: origin, to: destination});
    const route_data = await fetch(route_url).then(response => response.json());
    const locations = route_data.route.locations;
    const origin_latlng = locations[0].latLng;
    const destination_latlng = locations[locations.length - 1].latLng;
    
    const origin_stations = await find_nearby_stations(origin_latlng);
    const destination_stations = await find_nearby_stations(destination_latlng);
    
    console.log("Are there charging stations near the route?");
    if (origin_stations || destination_stations) {
        console.log("Yes");
        if (origin_stations) {
            console.log("Charging stations near", origin, ":");
            print_stations(origin_stations);
        }
        if (destination_stations) {
            console.log("Charging stations near", destination, ":");
            print_stations(destination_stations);
        }
    } else {
        console.log("No charging stations found near the route.");
    }

    // Aquí es donde obtienes la URL del mapa con la ruta.
    const map_url = `https://www.mapquestapi.com/staticmap/v5/map?key=${key}&start=${origin}&end=${destination}&size=600,400@2x`;

    // Y aquí es donde muestras el mapa en tu página web.
    // Este código asume que tienes un elemento img con el id 'map'.
    document.getElementById('map').src = map_url;

    // Aquí es donde obtienes la información de la ruta.
    const distance = route_data.route.distance.toFixed(2);
    const timeInSeconds = route_data.route.time;
    const timeInMinutes = Math.floor(timeInSeconds / 60);

    // Y aquí es donde muestras esa información en tu página web.
    // Este código asume que tienes dos elementos span con los ids 'distance' y 'time'.
    document.getElementById('distance').textContent = `${distance} millas`;
    document.getElementById('time').textContent = `${timeInMinutes} minutos`;
}

async function find_nearby_stations(latlng) {
    const radius_url = search_url + new URLSearchParams({key: key, origin: `${latlng.lat},${latlng.lng}`, radius: 10, maxMatches: 3, hostedData: "mqap.ntpois|group_sic_code=?|554101"});
    const charging_stations_data = await fetch(radius_url).then(response => response.json());
    return charging_stations_data.searchResults;
}

function print_stations(stations) {
    for (let result of stations) {
        console.log(result.name, "at", result.fields.address);
    }
}

// Aquí es donde recogemos los datos de entrada del usuario y llamamos a la función find_charging_stations.
document.getElementById('routeForm').addEventListener('submit', function(event) {
  event.preventDefault();

  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;
  var vehicle_type = document.getElementById('vehicle_type').value;

  find_charging_stations(origin, destination);
});





