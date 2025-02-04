To delete a destination (and associated image) of a user:

curl -X DELETE "http://localhost:4000/api/delete/user/Rohit/place/Kolkata"

curl -X DELETE "https://visited-places-backend.vercel.app/api/delete/user/Rohit/place/Kolkata"

To drop a user (and all his associated places):

curl -X DELETE "http://localhost:4000/api/user/delete/Rahul"

curl -X DELETE "https://visited-places-backend.vercel.app/api/user/delete/Rahul"