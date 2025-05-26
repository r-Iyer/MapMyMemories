# 🗺️ MapMyMemories – Chart Your Life’s Journey

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-blue)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3.0-lightgrey)

**MapMyMemories** transforms geographical coordinates into emotional waypoints — a powerful memory preservation system that captures not just places, but the stories behind them. Preserve your personal history with precision geotagging, rich context, and visual storytelling.

🌍 **Live Backend:** [https://visited-places-backend.vercel.app](https://visited-places-backend.vercel.app)
📂 **GitHub Repository:** [https://github.com/r-Iyer/MapMyMemories](https://github.com/r-Iyer/MapMyMemories)

---

## 📐 System Design

![System Design](./Visited%20Destinations%20Design.png)

---

## ✨ Memory Preservation Features

| Feature                        | Description                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| 🧭 **Geospatial Time Machine** | Pinpoint exact locations with latitude/longitude precision and travel through time  |
| 📸 **Visual Storytelling**     | Attach images through Cloudinary CDN integration, creating rich multimedia capsules |
| 🌺 **Detail Magnifier** | Double-tap images to reveal hidden depth - view original high-resolution versions with preserved geotags and timestamps. |
| 🎭 **Masquerade Mirror** | Temporarily don another traveler's cloak. Peek through their memory-lens while keeping your own journey intact. |
| 🔐 **Seamless Authentication** | A secure and flexible login system. Choose to sign up, log in to explore the platform's core features. |
| 🌐 **Universal API Access**    | RESTful endpoints ready to power web/mobile apps, smart devices, or AR experiences  |
| ⚡ **Lightning-Fast Queries**   | Optimized MongoDB aggregation pipelines deliver responses in <200ms                 |
| 📊 **Contextual Metadata**     | Store country, state, personal notes, and temporal data for rich memory context     |

---

## 🚀 Quickstart Guide

### Prerequisites

* Node.js v20+
* Postman (for API testing)

### Installation Odyssey

```bash
git clone https://github.com/r-Iyer/MapMyMemories.git
cd MapMyMemories
cd app
npm install
```

Create a `.env` file`:

```env
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_BACKEND_URL=http://localhost:4000 (Local) OR https://visited-places-backend.vercel.app/ (Production)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
REACT_APP_CLOUDINARY_UPLOAD_PRESET=unsigned_preset
PORT=4000
```

Launch the server:

```bash

npm install
npm start
# API gateway now live at http://localhost:4000
```

---

## 🛠️ Architectural Blueprint

| Component      | Technology Stack                |
| -------------- | ------------------------------- |
| Core Framework | Express.js, Node.js             |
| Database       | MongoDB Atlas with Mongoose ODM |
| Security       | JSON Web Tokens         |
| Media Handling | Cloudinary SDK                  |
| Deployment     | Vercel Serverless Functions     |

---

## 🌐 API Documentation

> **Note:** A few endpoints are hidden for security reasons.

### 1. User APIs

| Endpoint                    | Method | Description                                                 |
| --------------------------- | ------ | ----------------------------------------------------------- |
| `/api/user/register`        | POST   | Register a new user (username + password).                  |
| `/api/user/list`            | GET    | Retrieve a unique, alphabetically sorted list of usernames. |
| `/api/user/verify-password` | POST   | Verify a user's password (case-insensitive username).       |

#### Examples

```bash
# 1. Register a User
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"alice","password":"mypassword"}' \
     https://visited-places-backend.vercel.app/api/user/register

# 2. Get All Users
curl -X GET https://visited-places-backend.vercel.app/api/user/list

# 3. Verify User's Password
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"alice","password":"mypassword"}' \
     https://visited-places-backend.vercel.app/api/user/verify-password
```

---

### 2. Place Metadata APIs

| Endpoint                            | Method | Description                                                      |
| ----------------------------------- | ------ | ---------------------------------------------------------------- |
| `/api/upload/metadata`              | POST   | Upload place metadata (multipart/form-data).                     |
| `/api/fetch/user/:username`         | GET    | Fetch all places by a specific user (case-insensitive username). |
| `/api/fetch/place/:username/:place` | GET    | Fetch a single place by username and place name (exact match).   |
| `/api/fetch/all`                    | GET    | Fetch all places in the database (sorted by creation date desc). |

#### `/api/upload/metadata` Form Data

| Field       | Type   | Required | Description                                                               |
| ----------- | ------ | -------- | ------------------------------------------------------------------------- |
| `username`  | string | Yes      | The username who owns this place.                                         |
| `place`     | string | Yes      | The name/title of the place.                                              |
| `state`     | string | No       | State or region of the place (optional).                                  |
| `country`   | string | No       | Country of the place (optional).                                          |
| `latitude`  | string | Yes      | Latitude in string form (converted to float in the backend).              |
| `longitude` | string | Yes      | Longitude in string form (converted to float in the backend).             |
| `imageUrl`  | string | Yes      | The URL where the image is hosted (e.g., from Cloudinary or another CDN). |

#### Examples

```bash
# 1. Upload Metadata
curl -X POST \
     -H "Content-Type: multipart/form-data" \
     -F "username=Alice" \
     -F "place=Central Park" \
     -F "state=NY" \
     -F "country=USA" \
     -F "latitude=40.785091" \
     -F "longitude=-73.968285" \
     -F "imageUrl=https://example.com/central-park.jpg" \
     https://visited-places-backend.vercel.app/api/upload/metadata

# 2. Fetch All Places by a Specific User
curl -X GET https://visited-places-backend.vercel.app/api/fetch/user/Alice

# 3. Fetch Details of a Specific Place
curl -X GET https://visited-places-backend.vercel.app/api/fetch/place/Alice/Central%20Park

# 4. Fetch All Places in the Database
curl -X GET https://visited-places-backend.vercel.app/api/fetch/all
```

---

### 3. Database & Cloudinary Test API

| Endpoint               | Method | Description                                           |
| ---------------------- | ------ | ----------------------------------------------------- |
| `/api/cloudinary/test` | GET    | Tests Cloudinary configuration/connection (ping API). |

#### Example

```bash
curl -X GET https://visited-places-backend.vercel.app/api/cloudinary/test
```

---

## 🚢 Deployment Voyage

* **Local:** [http://localhost:4000](http://localhost:4000)
* **Vercel:** [https://visited-places-backend.vercel.app](https://visited-places-backend.vercel.app)

Frontend is ready for deployment on Vercel; database uses MongoDB Atlas with auto-scaling; media served via Cloudinary CDN; CI/CD powered by GitHub Actions.

---

## 🤝 Contribute to Collective Memory

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add feature XYZ"
   ```
4. Push and open a pull request

---

## 📜 License & Acknowledgments

Licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

Built with:

* **MongoDB Atlas** for cloud data
* **Cloudinary** for media handling
* **Vercel** for serverless deployment
* The open source community for inspiration

> “We are all explorers trying to find ourselves...
> Some early-life mapmaker wrote ‘Here be dragons’ on uncharted regions.
> Today we can write ‘Here be memories.’”
> — Adapted from James A. Owen
