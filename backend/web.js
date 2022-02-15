const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { upload } = require('./multer')
const app = express()
const { getVoter, addVoter, deleteVoter, editVoter } = require('./db')
const methodOverride = require('method-override')
const { joiValidation } = require('./validation')
const photo = upload.single('photo')

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
app.post('/voters', async (req, res) => {
  // multer upload file foto
  photo(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid file!',
        voters,
      })
    }

    const voters = await getVoter()
    const { error, value } = joiValidation(req.body)

    if (error) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: error.details,
        voters,
      })
    } else {
      addVoter(value, req.file)
      res.redirect('/voters')
    }
  })
})

// edit voters
app.put('/voters', async (req, res) => {
  // multer upload file foto
  photo(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid file!',
        voters,
      })
    }

    const voters = await getVoter()
    const { error, value } = joiValidation(req.body)

    if (error) {
      res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: error.details,
        voters,
      })
    } else {
      editVoter(value, req.file)
      res.redirect('/voters')
    }
  })
})

// delete voters
app.delete('/voters', (req, res) => {
  deleteVoter(req.body.username)
  res.redirect('/voters')
})

// API export voters
app.get('/backend/voters', async (req, res) => {
  const voters = await getVoter()
  res.json(voters)
})
/////////////////////////////////////// end of voters ////////////////////////////////////////

//////////////////////////////////////// /// candidates ///////////////////////////////////////////
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
  res.render('404', {
    layout: 'layouts/main-layout',
    title: '404',
  })
})

// listen on port random
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `EvB Admin listening on port http://localhost:${process.env.HTTP_PORT}/`
  )
})
