import React, { useState } from 'react';
import '../styles/uploadForm.css'; // Make sure to import the CSS file

const UploadForm = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    place: '',
    state: '',
    country: '',
    latlong: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Split latlong into latitude, longitude
    const [latitude, longitude] = formData.latlong.split(',').map(coord => coord.trim());
    data.append("username", formData.username);
    data.append("place", formData.place);
    data.append("state", formData.state);
    data.append("country", formData.country);
    data.append("latlong", formData.latlong); 
    data.append("latitude", latitude);
    data.append("longitude", longitude);
    data.append("image", formData.image);

    console.log("🚀 Data being sent:", Object.fromEntries(data.entries()));

    const API_URL = process.env.NODE_ENV === 'production'
      ? 'https://visited-places-backend.vercel.app/api/upload'
      : 'http://localhost:5000/api/upload';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      console.log("🚀 Server Response:", result);

      if (response.ok) {
        setMessage('Upload successful!');
        setImageUrl(result.githubImageUrl || result.localImagePath);

        // After successful upload, call the callback passed from App
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1500);
        }
      } else {
        setMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error("❌ Upload Error:", error);
      setMessage('Error uploading file');
    }
  };

  return (
    <div className="upload-form-container">
      <h2 className="upload-form-title">Upload a New Place</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="upload-form-label">User:</label>
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
          className="upload-form-input"
        />

        <label className="upload-form-label">Place:</label>
        <input 
          type="text" 
          name="place" 
          value={formData.place} 
          onChange={handleChange} 
          required 
          className="upload-form-input"
        />

        <label className="upload-form-label">State:</label>
        <input 
          type="text" 
          name="state" 
          value={formData.state} 
          onChange={handleChange} 
          className="upload-form-input"
        />

        <label className="upload-form-label">Country:</label>
        <input 
          type="text" 
          name="country" 
          value={formData.country} 
          onChange={handleChange} 
          className="upload-form-input"
        />

        <label className="upload-form-label">Latitude, Longitude:</label>
        <input 
          type="text" 
          name="latlong" 
          value={formData.latlong} 
          onChange={handleChange} 
          placeholder="23.233, 77.321"
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

        <button type="submit" className="upload-form-button">Upload</button>
      </form>

      {message && <p className="upload-form-message">{message}</p>}
      {imageUrl && (
        <div className="upload-form-image-container">
          <p className="upload-form-image-label">Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" className="upload-form-image" />
        </div>
      )}
    </div>
  );
};

export default UploadForm;
