// src/components/MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/mapStyles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const MapComponent = ({ onMapClick }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('user') || 'rohit';

  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchUrl = `${BACKEND_URL}/api/fetch/user/${username}`;
    console.log("Fetching data for:", username, "from", fetchUrl);

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.places) {
          setPlaces(data.places);
        } else {
          console.error("No places found for this user.");
          setPlaces([]);
        }
      })
      .catch(error => {
        console.error("Error fetching user places:", error);
        setPlaces([]);
      });
  }, [username]);

  const customIcon = new L.Icon({
    iconUrl: '/icons/marker.png',
    iconSize: [18, 18],
    iconAnchor: [14, 18],
    popupAnchor: [0, -32]
  });

  return (
    <MapContainer
      center={[22.57339112, 88.350074]}
      zoom={4}
      className="map-container"
      onClick={onMapClick}  // Trigger collapse when map is clicked
    >
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
              <div className="popup-title">Place: {place.place}</div>
              <div className="popup-body">State: {place.state}</div>
              <div className="popup-body">Country: {place.country}</div>
              {place.imageUrl && (
                <>
                  <img
                    src={place.imageUrl}
                    alt={place.place}
                    className="popup-image"
                    style={{ width: '100%', cursor: 'pointer' }}
                    onDoubleClick={() => window.open(place.imageUrl, '_blank')}
                  />
                  <div 
                    className="double-tap-message" 
                    style={{ textAlign: 'center', fontSize: '0.7em', marginTop: '4px' }}
                  >
                    Double-tap/click to zoom
                  </div>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
