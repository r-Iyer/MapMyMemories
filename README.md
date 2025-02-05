# Visited Destinations

	#Application to map the destinations visited by people

System Design:

![System Design]("./Visited Destinations Design.png")

Localhost URL: http://localhost:4000
Vercel URL: https://visited-places-backend.vercel.app

Note: Few APIs are hidden for security reasons.

User APIs:

## Summary of Endpoints

| Endpoint                      | Method | Description                                                                    |
|------------------------------|--------|--------------------------------------------------------------------------------|
| /api/user/register           | POST   | Register a new user (username + password).                                    |
| /api/user/list               | GET    | Retrieve a unique, alphabetically sorted list of usernames.                   |
| /api/user/verify-password    | POST   | Verify a user's password (case-insensitive username).                          |


	1. Register a User:
		
		curl -X POST \
			 -H "Content-Type: application/json" \
			 -d '{"username":"alice","password":"mypassword"}' \
			 https://visited-places-backend.vercel.app/api/user/register

	2. Get All Users:

		curl -X GET https://visited-places-backend.vercel.app/api/user/list

	3. Verify User's Password:

		curl -X POST \
		 -H "Content-Type: application/json" \
		 -d '{"username":"alice","password":"mypassword"}' \
		 https://visited-places-backend.vercel.app/user/verify-password
	
Place Metadata APIs:

## Summary of Endpoints

| Endpoint                                        | Method | Description                                                                                                              |
|-------------------------------------------------|--------|--------------------------------------------------------------------------------------------------------------------------|
| `/api/upload/metadata`                          | POST   | Upload place metadata (multipart/form-data).                                                                             |
| `/api/fetch/user/:username`                     | GET    | Fetch all places by a specific user (case-insensitive username).                                                         |
| `/api/fetch/place/:username/:place`             | GET    | Fetch a single place by username and place name (exact match).                                                           |
| `/api/fetch/all`                                | GET    | Fetch all places in the database (sorted by creation date desc). |

## Form Data Fields for `/api/upload/metadata`

| Field       | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| `username`  | string | Yes      | The username who owns this place.                                           |
| `place`     | string | Yes      | The name/title of the place.                                               |
| `state`     | string | No       | State or region of the place (optional).                                   |
| `country`   | string | No       | Country of the place (optional).                                           |
| `latitude`  | string | Yes      | Latitude in string form (converted to float in the backend).               |
| `longitude` | string | Yes      | Longitude in string form (converted to float in the backend).              |
| `imageUrl`  | string | Yes      | The URL where the image is hosted (e.g., from Cloudinary or another CDN).  |



	1. Upload Metadata

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


	2. Fetch All Places by a Specific User

		curl -X GET https://visited-places-backend.vercel.app/api/fetch/user/Alice

	3. Fetch Details of a Specific Place (by Username & Place Name):

		curl -X GET https://visited-places-backend.vercel.app/api/fetch/place/Alice/Central%20Park

	4. Fetch All Places in the Database

		curl -X GET https://visited-places-backend.vercel.app/api/fetch/all


Database connection API:

## Summary of Endpoints

| Endpoint                     | Method | Description                                                      |
|-----------------------------|--------|------------------------------------------------------------------|
| /api/cloudinary/test        | GET    | Tests Cloudinary configuration/connection via cloudinary.api.ping. |


	1. Test Cloudinary Configuration & Connection

		curl -X GET https://visited-places-backend.vercel.app/api/cloudinary/test
