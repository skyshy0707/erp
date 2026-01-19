const cors = require('cors')
const express = require('express')



const crud = require('./crud')

const { 
  basicAuth, 
  bearerAuth, 
  //bearerAuthRefreshToken 
} = require('./middleware/authorization')
const { uploadStorage } = require('./middleware/filesystem')
const handle = require('./middleware/handlers')


const app = express()

const authentification = express.Router()
const service = express.Router()


const corsOptions = {
  origin: [
    "*"
  ],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Content-Length',
    'User-Agent',
    'Authorization',
    'Host',
    'Accept',
    'Accept-Encoding',
    'Connection',
    'Cache-Control',
    'Postman-Token'
  ],
  methods: [
    "*"
  ]
}


app.use(cors(corsOptions))
//app.use(uploadStorage)
//app.use(express.json())
//app.use(handle.handler405Error)


authentification.get('/info', bearerAuth, (request, response) => {
  return crud.info(request, response)
})

authentification.get('/logout', bearerAuth, async (request, response) => {
  return await crud.logout(request, response)
})

authentification.post('/signin', basicAuth, async (request, response) => {
  return await crud.signin(request, response)
})

authentification.post('/signin/new_token', bearerAuth, async (request, response) => {
  return await crud.newToken(request, response)
})

authentification.post('/signup', async (request, response) => {

  return await crud.signup(request, response)
})

service.get('/list', bearerAuth, async (request, response) => {
  return await crud.fileList(request, response)
})

service.get('/:id', bearerAuth, async (request, response) => {
  return await crud.file(request, response)
})

service.get('/download/:id', bearerAuth, async (request, response) => {
  return await crud.fileDownload(request, response)
})

service.delete('/delete/:id', bearerAuth, async (request, response, next) => {
  return await crud.fileDelete(request, response)
})

service.post('/upload', bearerAuth, uploadStorage, async (request, response, next) => {
  console.log(`contenttype: ${request.headers['content-type']}`)
  return await crud.fileUpload(request, response)
}, handle.errorHandler)

service.put('/update/:id', bearerAuth, uploadStorage, async (request, response, next) => {
  return await crud.fileUpdate(request, response)
}, handle.errorHandler)




app.use("/api", authentification)
app.use("/api/file", service)

app.all(/^\//, (request, response, next) => {
  response.status(405).send('Method not allowed')
})



app.listen(8000, () => {
  console.log("Now I'm ready to take requests")
})