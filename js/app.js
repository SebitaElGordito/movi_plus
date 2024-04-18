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

/*Logica para mapquest*/
const api_url = 'https://www.mapquestapi.com/directions/v2/route?';
const search_url = 'https://www.mapquestapi.com/search/v2/radius?';
const traffic_url = 'https://www.mapquestapi.com/traffic/v2/incidents?';
const key = 'ZyzjVAwrDXklY04H3wsUT45vlaLKuj0k';

const huellaCarbono = {
    combustion: 0.1567, // kg CO2 por milla
    electrico: 0.0603  // kg CO2 por km
};

const informacionConductor = {
    nombre: "Juan Pérez (ejemplo)",
    foto: "../imagenes/juan.jfif",
    calificacion: 4.8
};

const informacionVehiculo = {
    tipo: "Sedan",
    matricula: "ABC-123"
};

window.onload = function() {
    const default_map_url = `https://www.mapquestapi.com/staticmap/v5/map?key=${key}&center=40.7128,-74.0060&size=600,400@2x`;
    document.getElementById('map').src = default_map_url;
};

document.getElementById('routeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var origin = document.getElementById('origin').value;
    var destination = document.getElementById('destination').value;
    var vehicle_type = document.getElementById('vehicle_type').value;

    find_charging_stations(origin, destination, vehicle_type);
});

async function find_charging_stations(origin, destination, vehicle_type) {
    const route_url = api_url + new URLSearchParams({key: key, from: origin, to: destination});
    const route_data = await fetch(route_url).then(response => response.json());

    const distance = route_data.route.distance.toFixed(2);
    const timeInSeconds = route_data.route.time;
    const timeInMinutes = Math.floor(timeInSeconds / 60);
    const huellaCarbonoViaje = (distance * huellaCarbono[vehicle_type]).toFixed(2);

    const map_url = `https://www.mapquestapi.com/staticmap/v5/map?key=${key}&start=${origin}&end=${destination}&size=600,400@2x`;
    document.getElementById('map').src = map_url;

    updateUI({
        origin: origin,
        destination: destination,
        distance: distance,
        timeInMinutes: timeInMinutes,
        huellaCarbonoViaje: huellaCarbonoViaje,
        informacionConductor: informacionConductor,
        informacionVehiculo: informacionVehiculo
    });
}

function updateUI(data) {
    document.querySelector('[data-info="origin"]').textContent = data.origin;
    document.querySelector('[data-info="destination"]').textContent = data.destination;
    document.querySelector('[data-info="distance"]').textContent = data.distance;
    document.querySelector('[data-info="timeInMinutes"]').textContent = data.timeInMinutes;
    document.querySelector('[data-info="carbonFootprint"]').textContent = data.huellaCarbonoViaje;
    document.querySelector('[data-info="driverName"]').textContent = data.informacionConductor.nombre;
    document.querySelector('[data-info="driverPhoto"]').src = data.informacionConductor.foto;
    document.querySelector('[data-info="driverRating"]').textContent = data.informacionConductor.calificacion;
    document.querySelector('[data-info="vehicleType"]').textContent = data.informacionVehiculo.tipo;
    document.querySelector('[data-info="vehicleLicense"]').textContent = data.informacionVehiculo.matricula;
}

document.getElementById('routeForm').onsubmit = function() {
    document.getElementById('foto').style.display = 'block';}









