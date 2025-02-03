require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
// Use memory storage so no temporary "uploads/" folder is created
const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_REPO = process.env.GITHUB_REPO || "r-Iyer/Visited-Places";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Set the absolute path to app/public/ (this ensures files go to ...\app\public\ not ...\app\src\public\)
const BASE_DIR = path.join(process.cwd(), 'app', 'public');

/** 
 * Function to upload a file (image or CSV) to GitHub.
 * It checks whether the file already exists (to update it) or not.
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
 * API Endpoint for uploading data:
 * - Saves the uploaded image locally under app/public/<username>/images/
 * - Updates places.csv in app/public/<username>/ with the new record (without extra blank lines)
 * - Uploads both the image and places.csv to GitHub
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

    // Define paths under app/public/
    const localUserDir = path.join(BASE_DIR, username);
    const localImagesDir = path.join(localUserDir, 'images');
    const localCsvPath = path.join(localUserDir, 'places.csv');

    // Ensure local directories exist
    if (!fs.existsSync(localUserDir)) fs.mkdirSync(localUserDir, { recursive: true });
    if (!fs.existsSync(localImagesDir)) fs.mkdirSync(localImagesDir, { recursive: true });

    // Prepare image name and paths
    const extension = path.extname(file.originalname);
    const newFileName = `${place.replace(/\s+/g, '_')}${extension}`;
    const localImagePath = path.join(localImagesDir, newFileName);
    // This is the path used in the GitHub repository
    const githubImagePath = `app/public/${username}/images/${newFileName}`;

    // Save image locally
    fs.writeFileSync(localImagePath, file.buffer);
    console.log("✅ File saved locally:", localImagePath);

    // Upload image to GitHub
    const fileData = file.buffer.toString('base64');
    await uploadToGitHub(githubImagePath, fileData, `Added image for ${place}`);

    // Read and update CSV data (places.csv)
    let csvData = [];
    try {
      if (fs.existsSync(localCsvPath)) {
        const fileContent = fs.readFileSync(localCsvPath, 'utf8').trim();
        csvData = Papa.parse(fileContent, { header: true }).data;
      } else {
        // Try to fetch from GitHub if local file doesn't exist
        const response = await axios.get(`https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/app/public/${username}/places.csv`);
        csvData = Papa.parse(response.data, { header: true }).data;
      }
    } catch (error) {
      console.log("ℹ️ CSV file not found, creating a new one.");
    }

    const newRow = {
      username,
      place,
      state,
      country,
      latitude,
      longitude,
      picture: `/images/${newFileName}`
    };

    // Prevent duplicate entries
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

    // Remove empty rows
    csvData = csvData.filter(row => Object.values(row).some(value => value !== ''));

    // Convert CSV data to string without extra blank lines
    let csvString = Papa.unparse(csvData).trimEnd(); // using trimEnd() removes trailing whitespace
    fs.writeFileSync(localCsvPath, csvString); // Write exactly the CSV string
    console.log("✅ CSV updated locally:", localCsvPath);

    const csvBase64 = Buffer.from(csvString).toString('base64');
    await uploadToGitHub(`app/public/${username}/places.csv`, csvBase64, `Updated places.csv for ${username}`);

    res.status(200).json({
      message: 'Upload successful!',
      localImagePath: localImagePath,
      githubImageUrl: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubImagePath}`,
      csvPath: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/app/public/${username}/places.csv`
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server locally (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// Export the app as a serverless handler for Vercel
const serverless = require('serverless-http');
module.exports = serverless(app);
