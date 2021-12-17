const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const { getVoter, addVoter, deleteVoter, editVoter } = require('./db')
const methodOverride = require('method-override')

require('dotenv').config({ path: './backend/.env' })

app.set('view engine', 'ejs')
app.use(expressLayouts)
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
app.post('/voters', (req, res) => {
  addVoter(req.body)
  res.redirect('/voters')
})

// edit voters
app.put('/voters', (req, res) => {
  editVoter(req.body)
  // res.send(req.body)
  res.redirect('/voters')
})

// delete voters
app.delete('/voters', (req, res) => {
  deleteVoter(req.body.id)
  res.redirect('/voters')
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
