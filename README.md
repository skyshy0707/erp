

# API

<h4>Prefix: /api - for all endpoints<h4>

## Service `Auth`

**Get the user id**


<code style="color : green">GET</code> /info 

*headers*

Authorization Bearer `<JWT Token>`

*response*

HTTP Status 200

JSON:

```json
{
    "id": `<number>`
}
```

**Logout from service**

<code style="color : green">GET</code> /logout 

*headers*

Authorization Bearer <JWT Token>

*response*

HTTP Status 200

**Log-in**

<code style="color : olive">POST</code> /signin 

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

**Refresh JWT token**

<code style="color : olive">POST</code> /signin/new_token 

*headers*

Authorization Bearer <JWT Token>

*response*

JSON: 

{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}

**Register a new account**

<code style="color : olive">POST</code> /signup 

*body*

as JSON: 

{
    "email": <Base64 encoded string>
    "phone": <Base64 encoded string>
    "password": <Base64 encoded string>
}

## Service `File`

<h5>Prefix: /file<h5>

*headers for all `file` endpoints*

Authorization Bearer <JWT Token>

**Get info of all your files**

<code style="color : green">GET</code> /list 

*response*

JSON: 

{
    "items"
}


**Get a file info by id**

<code style="color : green">GET</code> /:id 

*Path params*

id

/download/:id Download file by id

/delete/:id Delete the file

/upload Upload a new file

/update/:id Update the file or create a new file (if such file with this `id` is not exist)

#### $\textsf{\color{#00ff00}{#00ff00}}$

<h6 style="color: green">GET</h6> /info 