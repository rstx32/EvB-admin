const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { upload } = require('./multer')
const app = express()
const { getVoter, addVoter, deleteVoter, editVoter } = require('./db')
const methodOverride = require('method-override')

require('dotenv').config({ path: './backend/.env' })

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// root page
app.get('/', (req, res) => {
  res.render('index', {
    layout: 'layouts/main-layout',
    title: 'homepage',
  })
})

/////////////////////////////////////////// voters ///////////////////////////////////////////
// get all voters
app.get('/voters', async (req, res) => {  
  const voters = await getVoter()

  res.render('voters', {
    layout: 'layouts/main-layout',
    title: 'voters',
    voters,
  })
})

// add voters
app.post('/voters', upload.single('photo'), (req, res) => {
  
  // error handling, later
  // const file = req.file
  // if (!file) {
  //   const error = new Error('Please upload a file')
  //   error.httpStatusCode = 400
  //   console.log(error)
  // }
  addVoter(req.body, req.file.filename)
  res.redirect('/voters')
})

// edit voters
app.put('/voters', upload.single('photo'), (req, res) => {
  editVoter(req.body, req.file.filename)
  res.redirect('/voters')
})

// delete voters
app.delete('/voters', (req, res) => {
  deleteVoter(req.body.id)
  res.redirect('/voters')
})

// API export voters
app.get('/backend/voters', async (req, res) => {
  const voters = await getVoter()
  res.json(voters)
})
/////////////////////////////////////// end of voters ////////////////////////////////////////

/////////////////////////////////////////// candidates ///////////////////////////////////////////
app.get('/candidates', (req, res) => {
  res.render('candidates', {
    layout: 'layouts/main-layout',
    title: 'candidates',
  })
})
/////////////////////////////////////// end of candidates ////////////////////////////////////////
// page not found
app.use((req, res) => {
  res.status(404)
  res.send(`404 not found`)
})

// listen on port random
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `EvB Admin listening on port http://localhost:${process.env.HTTP_PORT}/`
  )
})
