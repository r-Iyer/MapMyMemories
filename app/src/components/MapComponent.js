import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/mapStyles.css';
import Papa from 'papaparse';

const MapComponent = ({ username }) => {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        fetch(`/${username}/places.csv`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ",",
                    complete: (results) => {
                        setPlaces(results.data);
                    },
                    error: (error) => {
                        console.error('Error parsing CSV:', error);
                    }
                });
            })
            .catch(error => console.error('Error loading CSV file:', error));
    }, [username]);

    const customIcon = new L.Icon({
        iconUrl: '/icons/marker.png', // Update with your icon path
        iconSize: [18, 18], // Increase icon size
        iconAnchor: [14, 18],
        popupAnchor: [0, -32],
        className: 'custom-marker-icon' // Apply custom class if needed
    });

    return (
        <MapContainer center={[22.57339112, 88.350074]} zoom={4} className="map-container">
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
                        <div className="popup-content">
                            <div className="popup-title">
                                Place: {place.place}
                            </div>
                            <div className="popup-body">
                                State: {place.state}
                            </div>
                            <div className="popup-body">
                                Country: {place.country}
                            </div>
                            {place.picture && (
                                <img 
                                    src={`/${username}/${place.picture.trim()}`} 
                                    alt={place.place} 
                                    className="popup-image"
                                />
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;