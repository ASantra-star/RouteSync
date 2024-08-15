

document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([51.505, -0.09], 13); // Default center and zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    const customIcon = L.icon({
        iconUrl: 'https://static.vecteezy.com/system/resources/thumbnails/019/897/155/small/location-pin-icon-map-pin-place-marker-png.png', // Replace with your custom marker URL
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const location = document.getElementById('location-input').value;
        const destination = document.getElementById('destination-input').value;

        if (location && destination) {
            geocodeLocations(location, destination);
        } else {
            alert('Please enter both location and destination.');
        }
    });

    function geocodeLocations(location, destination) {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const geocodeDestUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;

        Promise.all([
            fetch(geocodeUrl).then(response => response.json()),
            fetch(geocodeDestUrl).then(response => response.json())
        ])
        .then(data => {
            if (data[0].length > 0 && data[1].length > 0) {
                const startLat = data[0][0].lat;
                const startLon = data[0][0].lon;
                const destLat = data[1][0].lat;
                const destLon = data[1][0].lon;
                map.setView([startLat, startLon], 13); // Adjust zoom level as needed

                // Add markers for start and destination with custom icons
                const startMarker = L.marker([startLat, startLon], { icon: customIcon }).addTo(map)
                    .bindPopup(`<b>${data[0][0].display_name}</b>`).openPopup();
                const destMarker = L.marker([destLat, destLon], { icon: customIcon }).addTo(map)
                    .bindPopup(`<b>${data[1][0].display_name}</b>`).openPopup();

                // Fetch route using the OSRM API
                const routeUrl = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`;

                fetch(routeUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(routeData => {
                        const coordinates = routeData.routes[0].geometry.coordinates;
                        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

                        L.polyline(latLngs, { color: 'red' }).addTo(map); // Changed to red color
                    })
                    .catch(error => {
                        console.error('Error fetching route:', error);
                    });
            } else {
                alert('Location or Destination not found');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
        });
    }
});











