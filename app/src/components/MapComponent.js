import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/mapStyles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const MapComponent = ({ username }) => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    // ✅ Fetch from API dynamically (Works both locally & on Vercel)
    fetch(`${BACKEND_URL}/api/fetch/user/${username}`)
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
        }
      })
      .catch(error => console.error("Error fetching user places:", error));
  }, [username]);

  const customIcon = new L.Icon({
    iconUrl: '/icons/marker.png',
    iconSize: [18, 18],
    iconAnchor: [14, 18],
    popupAnchor: [0, -32]
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
              <div className="popup-title">Place: {place.place}</div>
              <div className="popup-body">State: {place.state}</div>
              <div className="popup-body">Country: {place.country}</div>
              {place.imageUrl && (
                <img
                  src={place.imageUrl} // ✅ Use Cloudinary Image URL
                  alt={place.place}
                  className="popup-image"
                  style={{ width: '100%', cursor: 'pointer' }}
                  onDoubleClick={() => window.open(place.imageUrl, '_blank')}
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
