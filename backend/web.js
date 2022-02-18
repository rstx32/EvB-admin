require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const app = express()
  .set('view engine', 'ejs')
  .use(bodyParser.urlencoded({ extended: true }))
  .use(expressLayouts)
  .use(express.static('public'))
  .use(methodOverride('_method'))

const { voterUpload, candidateUpload } = require('./multer')
const {
  voterCount,
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
  candidateCount,
  getCandidate,
  addCandidate,
  deleteCandidate,
} = require('./db')
const { voterValidation, candidateValidation } = require('./validation')
const voterPhoto = voterUpload.single('voterPhotoUpload')
const candidatePhoto = candidateUpload.single('candidatePhotoUpload')

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
  const allVoters = await voterCount()
  const voters = await getVoter()

  res.render('voters', {
    layout: 'layouts/main-layout',
    title: 'voters',
    voters,
    allVoters,
  })
})

// add voters
app.post('/voters', async (req, res) => {
  const voters = await getVoter()

  // multer upload file foto
  voterPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid photo file!',
        voters,
      })
    }

    const { error, value } = voterValidation(req.body)
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
  const voters = await getVoter()
  const { error, value } = voterValidation(req.body)

  // multer upload file foto
  voterPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid file!',
        voters,
      })
    }

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
// get all candidates
app.get('/candidates', async (req, res) => {
  const allCandidates = await candidateCount()
  const candidate = await getCandidate()

  res.render('candidates', {
    layout: 'layouts/main-layout',
    title: 'candidates',
    candidate,
    allCandidates,
  })
})

// add candidates
app.post('/candidates', async (req, res) => {
  const candidate = await getCandidate()

  // multer upload file foto
  candidatePhoto(req, res, (err) => {
    if (err) {
      return res.status(400).render('candidates', {
        layout: 'layouts/main-layout',
        title: 'candidates',
        errors: 'invalid photo file!',
        candidate,
      })
    }

    const { error, value } = candidateValidation(req.body)
    if (error) {
      return res.status(400).render('candidates', {
        layout: 'layouts/main-layout',
        title: 'candidates',
        errors: error.details,
        candidate,
      })
    } else {
      addCandidate(value, req.file)
      res.redirect('/candidates')
    }
  })
})

// delete voters
app.delete('/candidates', (req, res) => {
  deleteCandidate(req.body.id)
  res.redirect('/candidates')
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
