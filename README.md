

# API

Prefix: /api - for all endpoints

## Service `Auth`

**Get the user id**

GET /info 

*headers*

Authorization Bearer `<JWT Token>`

*response*

HTTP Status 200

JSON:

{
    "id": `<number>`
}

**Logout from service**

GET /logout 

*headers*

Authorization Bearer <JWT Token>

*response*

HTTP Status 200

POST /signin Log-in

*headers*

Authorization Basic <Base64 Encoded id:password>

*response*

HTTP Status 201

JSON: 

{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}

POST /signin/new_token Refresh JWT token

*headers*

Authorization Bearer <JWT Token>

*response*

JSON: 

{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}

POST /signup Register a new account

*body*

as JSON: 

{
    "email": <Base64 encoded string>
    "phone": <Base64 encoded string>
    "password": <Base64 encoded string>
}

## Service `File`

Prefix: /file

GET /list Get info of all your files

GET /:id Get a file info by id

*Path params*

id 

/download/:id Download file by id

/delete/:id Delete the file

/upload Upload a new file

/update/:id Update the file or create a new file (if such file with this `id` is not exist)