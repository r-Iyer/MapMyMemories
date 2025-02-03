require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() }); // ✅ No local file storage

const GITHUB_REPO = process.env.GITHUB_REPO || "r-Iyer/Visited-Places";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/** ✅ Function to Upload Files to GitHub */
async function uploadToGitHub(filePath, content, commitMessage) {
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    let sha = null;
    try {
        const response = await axios.get(GITHUB_API_URL, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });
        sha = response.data.sha; // Get SHA for updating the file
    } catch (err) {
        console.log("ℹ️ File does not exist, creating a new one.");
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

/** ✅ API Endpoint for Uploading Data */
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        console.log("🔹 Received Request Body:", req.body);

        const { username, place, state, country, latlong } = req.body;
        const file = req.file; // ✅ Directly get image as buffer

        if (!username || !file || !latlong.includes(',')) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const [latitude, longitude] = latlong.split(',').map(coord => coord.trim());

        console.log("✅ Parsed Latitude:", latitude, "✅ Parsed Longitude:", longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: 'Latitude or Longitude is not valid!' });
        }

        // ✅ Prepare image name for GitHub
        const extension = path.extname(file.originalname);
        const newFileName = `${place.replace(/\s+/g, '_')}${extension}`;
        const githubImagePath = `public/${username}/images/${newFileName}`;

        // ✅ Convert file buffer to Base64 for GitHub API
        const fileData = file.buffer.toString('base64');

        // ✅ Upload Image to GitHub
        await uploadToGitHub(githubImagePath, fileData, `Added image for ${place}`);

        // ✅ Append CSV Data
        const csvFilePath = `public/${username}/places.csv`;
        let csvData = [];

        try {
            const response = await axios.get(`https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${csvFilePath}`);
            csvData = Papa.parse(response.data, { header: true }).data;
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
        csvData.push(newRow);

        let csvString = Papa.unparse(csvData).trim();
        const csvBase64 = Buffer.from(csvString).toString('base64');

        await uploadToGitHub(csvFilePath, csvBase64, `Updated places.csv for ${username}`);

        res.status(200).json({
            message: 'Upload successful!',
            imagePath: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${githubImagePath}`,
            csvPath: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${csvFilePath}`,
            picture: `/images/${newFileName}`
        });

    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Start the Express server (only for local, Vercel runs automatically)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app; // ✅ Required for Vercel deployment
