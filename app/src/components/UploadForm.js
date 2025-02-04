import React, { useState, useEffect, useRef } from 'react';
import '../styles/uploadForm.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME; // e.g. "mycloudname"
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET; // e.g. "unsigned_preset"

const UploadForm = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    username: localStorage.getItem('username') || '',
    password: localStorage.getItem('password') || '',
    place: '',
    state: '',
    country: '',
    latlong: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(localStorage.getItem('isVerified') === 'true');

  const placeInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete when component mounts
  useEffect(() => {
    if (window.google && placeInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(placeInputRef.current);
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.address_components) {
          let state = '';
          let country = '';
          place.address_components.forEach(component => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          });
          setFormData(prevData => ({
            ...prevData,
            place: place.name || prevData.place,
            state,
            country,
          }));
        }
      });
    }
  }, []);

  // Handle input changes (including file inputs)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  // Verify password before allowing upload
  const verifyPassword = async () => {
    setMessage('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setIsPasswordVerified(true);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('password', formData.password);
        localStorage.setItem('isVerified', 'true');
        setMessage('✅ Password Verified! You can upload now.');
      } else {
        setIsPasswordVerified(false);
        setMessage(result.error || '❌ Incorrect password!');
      }
    } catch (error) {
      console.error('❌ Verification Error:', error);
      setMessage('❌ Error verifying password');
    }
  };

  // Updated form submission: first upload file directly to Cloudinary, then send metadata to your backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordVerified) {
      setMessage('❌ Please verify your password before uploading.');
      return;
    }

    // Validate and split latlong
    const [latitude, longitude] = formData.latlong.split(',').map(coord => coord.trim());
    if (!latitude || !longitude) {
      setMessage('❌ Invalid latitude/longitude');
      return;
    }

    // Create FormData for Cloudinary upload
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', formData.image);
    cloudinaryData.append('upload_preset', UPLOAD_PRESET);

    try {
      // Upload file directly to Cloudinary
      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryData,
      });
      const cloudinaryResult = await cloudinaryResponse.json();

      if (!cloudinaryResult.secure_url) {
        setMessage('❌ Cloudinary upload failed.');
        return;
      }

      console.log("✅ Image Uploaded Successfully to Cloudinary:", cloudinaryResult.secure_url);

      // Now prepare metadata (including Cloudinary URL) to send to your backend
      const metadataData = new FormData();
      metadataData.append('username', formData.username);
      metadataData.append('place', formData.place);
      metadataData.append('state', formData.state);
      metadataData.append('country', formData.country);
      metadataData.append('latitude', latitude);
      metadataData.append('longitude', longitude);
      // Instead of sending the file, send the Cloudinary URL:
      metadataData.append('imageUrl', cloudinaryResult.secure_url);

      // Call a new endpoint to save the metadata in MongoDB
      const metadataResponse = await fetch(`${BACKEND_URL}/api/upload/metadata`, {
        method: 'POST',
        body: metadataData,
      });
      const metadataResult = await metadataResponse.json();

      if (metadataResponse.ok) {
        setMessage('✅ New Destination Unlocked!');
        setImageUrl(metadataResult.imageUrl);
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1500);
        }
      } else {
        setMessage(metadataResult.error || '❌ Please try again!');
      }
    } catch (error) {
      console.error('❌ Upload Error:', error);
      setMessage('❌ Error uploading file');
    }
  };

  // Handler to change user: clears stored credentials and resets form data
  const handleChangeUser = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('isVerified');
    setIsPasswordVerified(false);
    setFormData({
      username: '',
      password: '',
      place: '',
      state: '',
      country: '',
      latlong: '',
      image: null,
    });
    setMessage('');
  };

  return (
    <div className="upload-form-container">
      <h2 className="upload-form-title">Upload a New Destination</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="upload-form-label">User:</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          required
          className="upload-form-input"
        />

        <label className="upload-form-label">Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          className="upload-form-input"
        />

        {!isPasswordVerified && (
          <button
            type="button"
            onClick={verifyPassword}
            className="verify-password-button"
          >
            Verify Password
          </button>
        )}

        {isPasswordVerified && (
          <>
            <label className="upload-form-label">Place:</label>
            <input
              type="text"
              name="place"
              placeholder="Enter place"
              ref={placeInputRef}
              value={formData.place}
              onChange={handleChange}
              required
              className="upload-form-input"
            />

            <label className="upload-form-label">State:</label>
            <input
              type="text"
              name="state"
              placeholder="State (auto-filled)"
              value={formData.state}
              onChange={handleChange}
              className="upload-form-input"
            />

            <label className="upload-form-label">Country:</label>
            <input
              type="text"
              name="country"
              placeholder="Country (auto-filled)"
              value={formData.country}
              onChange={handleChange}
              className="upload-form-input"
            />

            <label className="upload-form-label">Latitude, Longitude:</label>
            <input
              type="text"
              name="latlong"
              placeholder="e.g. 23.233, 77.321"
              value={formData.latlong}
              onChange={handleChange}
              required
              className="upload-form-input"
            />

            <label className="upload-form-label">Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="upload-form-input"
            />

            <button type="submit" className="upload-form-button">
              Upload
            </button>
          </>
        )}

        <button
          type="button"
          className="toggle-change-user-button"
          onClick={handleChangeUser}
        >
          Change User
        </button>
      </form>

      {message && <p className="upload-form-message">{message}</p>}
      {imageUrl && (
        <div className="upload-form-image-container">
          <img src={imageUrl} alt="Uploaded" className="upload-form-image" />
        </div>
      )}
    </div>
  );
};

export default UploadForm;
