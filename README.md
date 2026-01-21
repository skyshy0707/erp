

# API

<h4>Prefix: /api - for all endpoints<h4>

## Service `Auth`

**Get the user id**


<code style="color : green">GET</code> /info 

*headers*:

Authorization Bearer `<JWT Token>`

Response HTTP Status 200:

JSON:

```json
{
    "id": `<number>`
}
```

**Logout from service**

<code style="color : green">GET</code> /logout 

*headers*:

Authorization Bearer <JWT Token>

Response HTTP Status 200:

**Log-in**

<code style="color : olive">POST</code> /signin 

*headers*:

Authorization Basic <Base64 Encoded id:password>

Response HTTP Status 201:

JSON: 

```json
{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}
```

**Refresh JWT token**

<code style="color : olive">POST</code> /signin/new_token 

*headers*:

Authorization Bearer <JWT Token>

Response HTTP Status 201:

JSON: 

```json
{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}
```

**Register a new account**

<code style="color : olive">POST</code> /signup 

Request

*body*:

as JSON: 

```json
{
    "email": <Base64 encoded string>
    "phone": <Base64 encoded string>
    "password": <Base64 encoded string>
}
```

Response HTTP Status 201:

JSON 

```json
{
    "id": <number>
}
```

## Service `File`

<h4>Prefix: /file<h4>

*headers for all `file` endpoints*:

`Authorization Bearer <JWT Token>`

### File endpoinsts:

**Get info of all your files**

<code style="color : green">GET</code> /list 

Response HTTP Status 200:

JSON: 

```json
{
    "items": [
        {
            "id": <string>,
            "name": <string>,
            "extension": <string>,
            "mime_type": <string>,
            "size": <string>,
            "user_id": <number>,
            "upload_at": <Date ISO>,
            "url": <string>
        },
        ...
    ],
    "offset": "<number>, default 0",
    "limit": <number>, default 10,
    "total": <number>
}
```

**Get a file info by id**

<code style="color : green">GET</code> /:id 

Request

*Path params*:

id: `<number>`

Response HTTP Status 200:

JSON

```json
{
    "id": <string>,
    "name": <string>,
    "extension": <string>,
    "mime_type": <string>,
    "size": <string>,
    "user_id": <number>,
    "upload_at": <Date ISO>,
    "url": <string>
}
```

**Download file by id**

<code style="color : green">GET</code> /download/:id 

Request

*Path params*:

id: `<number>`

Response HTTP Status 200

**Delete the file**

<code style="color : purple">DELETE</code> /delete/:id

Response HTTP Status 200:

JSON

```json

{
    "message": "Delete success",
    "detail": "File id: <number>"
}

```

**Upload a new file**

<code style="color : olive">POST</code> /upload 

Request

*body*:

body.file: Buffer

Response HTTP Status 201:

JSON 

```json

{
    "message": "Success",
    "result": {
        "id": <string>,
        "name": <string>,
        "extension": <string>,
        "mime_type": <string>,
        "size": <string>,
        "user_id": <number>,
        "upload_at": <Date ISO>,
        "url": <string>
    }
}
```

**Update the file or create a new file (if such file with this `id` is not exist)**

<code style="color : blue">PUT</code> /update/:id 

Request

*body*:

body.file: Buffer

Response HTTP Status 200 (if file exist):

JSON

```json
{
    "message": "Success. File with id=133 was created."
}
```


Response HTTP Status 201 (if file not exist):

JSON

```json 
{
    "message": "Success. File with id=133 was updated."
}
```