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
    combustion: 0.1567, // kg CO2 por km
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

var map; // Definir map globalmente

window.onload = function() {
    L.mapquest.key = 'ZyzjVAwrDXklY04H3wsUT45vlaLKuj0k';
    map = L.mapquest.map('map', {
        center: [40.7128, -74.0060],
        layers: L.mapquest.tileLayer('map'),
        zoom: 12
    });
    map.addControl(L.mapquest.control());
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
    const route_response = await fetch(route_url);
    const route_data = await route_response.json();
    console.log("Route data:", route_data); // Depurar datos de la ruta

    L.mapquest.directions().route({
        start: origin,
        end: destination
    });

    const distance = route_data.route.distance.toFixed(2);
    const timeInSeconds = route_data.route.time;
    const timeInMinutes = Math.floor(timeInSeconds / 60);
    const huellaCarbonoViaje = (distance * huellaCarbono[vehicle_type]).toFixed(2);
    const costoEstimado = (distance * 6.17).toFixed(2);


    const search_params = new URLSearchParams({
        key: key,
        origin: origin,
        radius: 2,
        maxMatches: 3,
        hostedData: 'mqap.ntpois|group_sic_code=|737301'
    });
    const search_url_complete = search_url + search_params.toString();
    const search_response = await fetch(search_url_complete);
    const charging_stations = await search_response.json();
    console.log("Charging stations data:", charging_stations); // Depurar datos de estaciones de carga

    if (charging_stations.searchResults) {
        charging_stations.searchResults.forEach(station => {
            L.mapquest.textMarker([station.fields.lat, station.fields.lng], {
                text: station.fields.name,
                subtext: station.fields.address,
                position: 'right',
                type: 'marker',
                icon: {
                    primaryColor: '#22407F',
                    secondaryColor: '#3B5998',
                    size: 'md'
                }
            }).addTo(map);
        });
    } else {
        console.log("No charging stations found or error in fetching stations.");
    }

    updateUI({
        origin: origin,
        destination: destination,
        distance: distance,
        timeInMinutes: timeInMinutes,
        costoEstimado: costoEstimado,
        huellaCarbonoViaje: huellaCarbonoViaje,
        informacionConductor: informacionConductor,
        informacionVehiculo: informacionVehiculo
    });
}


function updateUI(data) {
    document.querySelector('[data-info="origin"]').textContent = data.origin;
    document.querySelector('[data-info="destination"]').textContent = data.destination;
    document.querySelector('[data-info="distance"]').textContent = data.distance;
    document.querySelector('[data-info="timeInMinutes"]').textContent = data.timeInMinutes > 59 ? `${Math.floor(data.timeInMinutes / 60)} horas, ${data.timeInMinutes % 60} minutos` : `${data.timeInMinutes} minutos`;
    document.querySelector('[data-info="estimatedCost"]').textContent = `${data.costoEstimado}`;
    document.querySelector('[data-info="carbonFootprint"]').textContent = data.huellaCarbonoViaje;
    document.querySelector('[data-info="driverName"]').textContent = data.informacionConductor.nombre;
    document.querySelector('[data-info="driverPhoto"]').src = data.informacionConductor.foto;
    document.querySelector('[data-info="driverRating"]').textContent = data.informacionConductor.calificacion.toFixed(1);
    document.querySelector('[data-info="vehicleType"]').textContent = data.informacionVehiculo.tipo;
    document.querySelector('[data-info="vehicleLicense"]').textContent = data.informacionVehiculo.matricula;
}









