require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const Papa = require('papaparse');
const path = require('path');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optionally serve static files from the React app (if needed)
app.use(express.static(path.join(__dirname, '../frontend/build')));

const PORT = process.env.PORT || 5000;

// Use memory storage so files do not persist locally
const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_REPO = process.env.GITHUB_REPO || "r-Iyer/Visited-Places";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Function to upload a file (image or CSV) directly to GitHub.
 * This ensures files are not stored locally.
 */
async function uploadToGitHub(filePath, content, commitMessage) {
  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  let sha = null;

  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    sha = response.data.sha;
  } catch (err) {
    console.log(`ℹ️ File ${filePath} does not exist on GitHub, creating a new one.`);
  }

  try {
    await axios.put(
      GITHUB_API_URL,
      { message: commitMessage, content, sha },
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "Visited-Places-App" } }
    );
    console.log(`✅ ${filePath} committed to GitHub.`);
  } catch (error) {
    console.error("❌ GitHub Commit Error:", error.response?.data || error.message);
  }
}

/**
 * API Endpoint for uploading data (no local storage).
 * A POST request to /api/upload (or /upload based on your Vercel routing) is handled here.
 */
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log("🔹 Received Request Body:", req.body);
    const { username, place, state, country, latlong } = req.body;
    const file = req.file;

    if (!username || !file || !latlong.includes(',')) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const [latitude, longitude] = latlong.split(',').map(coord => coord.trim());
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Latitude or Longitude is not valid!' });
    }

    // Prepare image file name and the GitHub path for the image.
    const extension = path.extname(file.originalname);
    const newFileName = `${place.replace(/\s+/g, '_')}${extension}`;
    const githubImagePath = `frontend/public/${username}/images/${newFileName}`;

    // Upload image to GitHub directly from memory
    const fileData = file.buffer.toString('base64');
    await uploadToGitHub(githubImagePath, fileData, `Added image for ${place}`);

    // Fetch the existing CSV file from GitHub (if it exists), or initialize an empty CSV.
    let csvData = [];
    try {
      const response = await axios.get(
        `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/frontend/public/${username}/places.csv`
      );
      csvData = Papa.parse(response.data, { header: true }).data;
    } catch (error) {
      console.log("ℹ️ CSV file not found on GitHub, creating a new one.");
    }

    // Create a new row for the CSV data.
    const newRow = {
      username,
      place,
      state,
      country,
      latitude,
      longitude,
      picture: `/images/${newFileName}`
    };

    // Prevent duplicate entries.
    const isDuplicate = csvData.some(row =>
      row.place === newRow.place &&
      row.state === newRow.state &&
      row.country === newRow.country &&
      row.latitude === newRow.latitude &&
      row.longitude === newRow.longitude
    );
    if (!isDuplicate) {
      csvData.push(newRow);
    } else {
      console.log("⚠️ Duplicate entry detected, skipping CSV update.");
    }

    // Remove empty rows and convert CSV data to a string.
    csvData = csvData.filter(row => Object.values(row).some(value => value !== ''));
    const csvString = Papa.unparse(csvData).trimEnd();

    // Upload the CSV to GitHub directly from memory.
    const csvBase64 = Buffer.from(csvString).toString('base64');
    await uploadToGitHub(
      `frontend/public/${username}/places.csv`,
      csvBase64,
      `Updated places.csv for ${username}`
    );

    res.status(200).json({
      message: 'Upload successful!',
      githubImageUrl: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubImagePath}`,
      csvPath: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/frontend/public/${username}/places.csv`
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server (for local development)
app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

// Export the app as a serverless function for Vercel
module.exports = require('serverless-http')(app);
