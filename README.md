

# Forum Wbrothers

- Frontend: 
https://wbrothers-forum-angular.netlify.app/ 

- Backend
https://github.com/wbrothersCuba/wbrothers-forum-angular

This RESTful API is generated with Express and Nodejs, for a programming forum. Uses MONGO for the DB so the env variables should be adjusted: 

*env:*

PORT=3000

MONGO_URL= mongodb://localhost:27017/api_rest_node

MONGO_USER='user'

MONGO_PASS='pass'

MONGO_DB_NAME=api_rest_node

The app is already configured to work with CORS requests, so you can make requests using Postman or testing directly in the frontend app. The API uses JWT for authentication, so you must generate a token and put it in the headers of the request.

  
## Endpoints
> User

 - POST /api/login: Sign in.
 - POST /api/register: Sign up.
 - PUT /api_url/user/update: User settings.
 - POST /api/user/upload: Upload an avatar image.
 - GET /api/user/avatar/{filename}: Show the image of user avatar.
 - GET /api/user/detail/{id}: Show the user detail.

  
> Categories

 - GET /api/category/index: Return all categories.
 - GET /api/category/show(id): Return a categorywith the given id.
 - POST /api/category/store: Add a new category.
 - PUT /api/category/update/{id}: Change data of a post.

> Posts

- GET /api/post/index .
- GET /api/post/show(id).
- POST /api/post/store : Add a new post.
- PUT /api/post/update/{id}: Change data of a post.
- DELETE /api/post/destroy/{id}: Delete data of a post.
- POST /api/post/upload: upload a post image.
- GET /api/post/getImage/{filename}:: upload a post image.
- GET /api/post/getPostbyCategory/{category_id}:: upload a post image.
- GET /api/post/getPosytByUser/{user_id}:: upload a post image.



## TO DO

 -  Update node to version 20.
