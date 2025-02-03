// upLoadForm.js
import React, { useState } from 'react';

const UploadForm = () => {
  const [formData, setFormData] = useState({
    username: 'Rohit', // Default Username
    place: 'Bhopal', // Default Place
    state: 'Madhya Pradesh', // Default State
    country: 'India', // Default Country
    latlong: '23.24034058346992, 77.42509258962176', // Default Latitude & Longitude
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

    // Append only the fields needed by the server
    data.append('username', formData.username);
    data.append('place', formData.place);
    data.append('state', formData.state);
    data.append('country', formData.country);
    data.append('latlong', formData.latlong);
    data.append('image', formData.image);

    console.log("🚀 Data being sent:", Object.fromEntries(data.entries()));

    // Use '/api/upload' in production and 'http://localhost:5000/upload' locally
    const API_URL = process.env.NODE_ENV === 'production'
      ? '/api/upload'
      : 'http://localhost:5000/upload';

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
      } else {
        setMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error("❌ Upload Error:", error);
      setMessage('Error uploading file');
    }
  };

  return (
    <div>
      <h2>Upload a New Place</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
        /><br />

        <label>Place:</label>
        <input 
          type="text" 
          name="place" 
          value={formData.place} 
          onChange={handleChange} 
          required 
        /><br />

        <label>State:</label>
        <input 
          type="text" 
          name="state" 
          value={formData.state} 
          onChange={handleChange} 
        /><br />

        <label>Country:</label>
        <input 
          type="text" 
          name="country" 
          value={formData.country} 
          onChange={handleChange} 
        /><br />

        <label>Latitude, Longitude:</label>
        <input 
          type="text" 
          name="latlong" 
          value={formData.latlong} 
          onChange={handleChange} 
          placeholder="Enter as: 23.233, 77.321"
          required 
        /><br />

        <label>Image:</label>
        <input 
          type="file" 
          name="image" 
          accept="image/*" 
          onChange={handleChange} 
          required 
        /><br />

        <button type="submit">Upload</button>
      </form>

      {message && <p>{message}</p>}
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" width="300" />
        </div>
      )}
    </div>
  );
};

export default UploadForm;
