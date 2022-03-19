require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const connectEnsureLogin = require('connect-ensure-login')
const app = express()
  .set('view engine', 'ejs')
  .use(express.urlencoded({ extended: false }))
  .use(expressLayouts)
  .use(express.static('public'))
  .use(methodOverride('_method'))
  .use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
    })
  )
  .use(passport.initialize())
  .use(passport.session())

const { voterUpload, candidateUpload } = require('./multer')
const {
  voterCount,
  getVoter,
  addVoter,
  getSingleVoter,
  deleteVoter,
  editVoter,
  addPubKey,
  isPubkeyExist,
  candidateCount,
  getCandidate,
  addCandidate,
  deleteCandidate,
} = require('./db')
const {
  voterValidation,
  candidateValidation,
  idValidation,
} = require('./validation')
const voterPhoto = voterUpload.single('voterPhotoUpload')
const candidatePhoto = candidateUpload.single('candidatePhotoUpload')
const User = require('./model/user')

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// register page
app.get('/register', (req, res) => {
  res.render('auth/register', {
    layout: 'auth/register',
    title: 'register',
  })
})

app.post('/register', async (req, res) => {
  const { error } = idValidation(req.body)
  if (error) {
    res.render('auth/register', {
      layout: 'auth/register',
      error: `invalid id!`,
    })
  } else {
    const status = await isPubkeyExist(req.body.id)

    if (status === 1) {
      res.render('auth/register', {
        layout: 'auth/register',
        error: `invalid id!`,
      })
    } else if (status === 2) {
      res.render('auth/register', {
        layout: 'auth/register',
        error: `${req.body.id} has been registered!`,
      })
    } else {
      const voter = await getSingleVoter(req.body.id)
      const selectedVoter = voter.id
      res.render('auth/register-2', {
        layout: 'auth/register-2',
        selectedVoter,
      })
    }
  }
})

app.post('/register2', async (req, res) => {
  const isSucced = await addPubKey(req.body)

  if (isSucced) {
    res.send('registration success')
  } else {
    res.render('auth/register', {
      layout: 'auth/register',
      error: `${req.body.id} has been registered!`,
    })
  }
})

// login page
app.get('/login', (req, res) => {
  res.render('auth/login', {
    layout: 'auth/login',
    title: 'login',
  })
})

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
  }),
  (req, res) => {
    console.log(req.user)
  }
)

// logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

// root page
app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.render('index', {
    layout: 'layouts/main-layout',
    title: 'homepage',
  })
})

/////////////////////////////////////////// voters ///////////////////////////////////////////
// get all voters
app.get('/voters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.post('/voters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const allVoters = await voterCount()
  const voters = await getVoter()

  // multer upload file foto
  voterPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid photo file!',
        voters,
        allVoters,
      })
    }

    const { error, value } = voterValidation(req.body)
    if (error) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: error.details,
        voters,
        allVoters,
      })
    } else {
      addVoter(value, req.file)
      res.redirect('/voters')
    }
  })
})

// edit voters
app.put('/voters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const voters = await getVoter()
  const allVoters = await voterCount()

  // multer upload file foto
  voterPhoto(req, res, (err) => {
    if (err) {
      return res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: 'invalid file!',
        voters,
        allVoters,
      })
    }

    const { error, value } = voterValidation(req.body)
    if (error) {
      res.status(400).render('voters', {
        layout: 'layouts/main-layout',
        title: 'voters',
        errors: error.details,
        voters,
        allVoters,
      })
    } else {
      editVoter(value, req.file)
      res.redirect('/voters')
    }
  })
})

// delete voters
app.delete('/voters', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  deleteVoter(req.body.id)
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
app.get(
  '/candidates',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const allCandidates = await candidateCount()
    const candidate = await getCandidate()

    res.render('candidates', {
      layout: 'layouts/main-layout',
      title: 'candidates',
      candidate,
      allCandidates,
    })
  }
)

// add candidates
app.post(
  '/candidates',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
)

// delete voters
app.delete('/candidates', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  deleteCandidate(req.body.id)
  res.redirect('/candidates')
})

// API export voters
app.get('/backend/candidates', async (req, res) => {
  const voters = await getCandidate()
  res.json(voters)
})
/////////////////////////////////////// end of candidates ////////////////////////////////////////

// page not found
app.use((req, res) => {
  res.status(404)
  res.render('404', {
    layout: '404',
    title: 'Page not found!',
  })
})

// listen on defined port
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `EvB Admin listening on port http://localhost:${process.env.HTTP_PORT}/`
  )
})

// run this for the first time!
// User.register({username: 'user', active: false}, '123')
