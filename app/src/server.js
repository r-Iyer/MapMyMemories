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
const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_REPO = process.env.GITHUB_REPO || "r-Iyer/Visited-Places";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ✅ Correct Absolute Path for `app/public/`
const BASE_DIR = path.resolve(__dirname, 'public');

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

/** ✅ API Endpoint for Uploading Data */
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

        // ✅ Define Correct Paths Under `app/public/`
        const localUserDir = path.join(BASE_DIR, username);
        const localImagesDir = path.join(localUserDir, 'images');
        const localCsvPath = path.join(localUserDir, 'places.csv');

        // ✅ Ensure local directories exist
        if (!fs.existsSync(localUserDir)) fs.mkdirSync(localUserDir, { recursive: true });
        if (!fs.existsSync(localImagesDir)) fs.mkdirSync(localImagesDir, { recursive: true });

        // ✅ Prepare image name and paths
        const extension = path.extname(file.originalname);
        const newFileName = `${place.replace(/\s+/g, '_')}${extension}`;
        const localImagePath = path.join(localImagesDir, newFileName);
        const githubImagePath = `app/public/${username}/images/${newFileName}`;

        // ✅ Save Image Locally
        fs.writeFileSync(localImagePath, file.buffer);
        console.log("✅ File saved locally:", localImagePath);

        // ✅ Upload Image to GitHub
        const fileData = file.buffer.toString('base64');
        await uploadToGitHub(githubImagePath, fileData, `Added image for ${place}`);

        // ✅ Append CSV Data (Both Locally & GitHub)
        let csvData = [];

        // ✅ Fetch existing CSV if available (GitHub or Local)
        try {
            if (fs.existsSync(localCsvPath)) {
                const fileContent = fs.readFileSync(localCsvPath, 'utf8').trim(); // 🔥 Remove extra spaces
                csvData = Papa.parse(fileContent, { header: true }).data;
            } else {
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
        csvData.push(newRow);

        // ✅ Convert CSV back to string & fix extra new line issue
        let csvString = Papa.unparse(csvData).trim(); // 🔥 Remove unnecessary spaces
        csvString = csvString.replace(/\n+$/, ''); // 🔥 Remove extra blank lines at the end
        fs.writeFileSync(localCsvPath, csvString); // ✅ Save locally
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

// ✅ Start the Express server (only for local, Vercel runs automatically)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
