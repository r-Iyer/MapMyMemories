// src/components/MapComponent.js

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '.././styles.css'; // Import your custom styles

const MapComponent = () => {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        // Fetch data from API
        fetch('/places')
            .then(response => response.json())
            .then(data => {
                setPlaces(data);
            })
            .catch(error => console.error('Error loading data:', error));
    }, []);

    // Custom Icon Example
    const customIcon = new L.Icon({
        iconUrl: '/icons/marker.png', // Update with your icon path
        iconSize: [22, 22],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    return (
        <MapContainer center={[22.57339112, 88.350074]} zoom={4} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {places.map((place, index) => (
                <Marker
                    key={index}
                    position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
                    icon={customIcon}
                >
                    <Popup>
                        <b>{place.town}</b><br />
                        {place.state}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
