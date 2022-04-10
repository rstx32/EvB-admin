require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const connectEnsureLogin = require('connect-ensure-login')
const flash = require('connect-flash')
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
  .use(flash())

const { voterUpload, candidateUpload } = require('./multer')
const {
  getVoter,
  addVoter,
  getSingleVoter,
  deleteVoter,
  editVoter,
  addPubKey,
  isPubkeyExist,
  getVoterPubkey,
  getvoterpasswd,
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
  const flashMessage = req.flash('message')
  res.render('auth/register', {
    layout: 'auth/register',
    title: 'register',
    error: flashMessage,
  })
})

app.post('/register', async (req, res) => {
  const { error } = idValidation(req.body)
  if (error) {
    req.flash('message', 'invalid ID!')
    res.redirect('register')
  } else {
    const status = await isPubkeyExist(req.body.id)

    if (status === 1) {
      req.flash('message', 'invalid ID!')
      res.redirect('register')
    } else if (status === 2) {
      req.flash('message', `${req.body.id} has been registered!`)
      res.redirect('register')
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
    req.flash('message', `registration ID : ${req.body.id} complete!`)
    res.redirect('register')
  } else {
    req.flash('message', `${req.body.id} has been registered!`)
    res.redirect('register')
  }
})

// login page
app.get('/login', (req, res) => {
  const flashMessage = req.flash('error')
  res.render('auth/login', {
    layout: 'auth/login',
    title: 'login',
    errors: flashMessage,
  })
})

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: {
      type: 'messageFailure',
      message: 'wrong id or password!',
    },
    successRedirect: '/',
    successFlash: {
      type: 'messageSuccess',
      message: 'Welcome to EvB dashboard!',
    },
  }),
  (req, res) => {
    res.redirect('/')
  }
)

// logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

// root page
app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  const successMessage = req.flash('successFlash')
  const user = req.user.username

  res.render('homepage', {
    layout: 'layouts/main-layout',
    title: 'homepage',
    user,
    successMessage,
  })
})

/////////////////////////////////////////// voters ///////////////////////////////////////////
// get all voters
app.get('/voters', async (req, res) => {
  // if query is empty, then add default query
  if(Object.keys(req.query).length === 0){
    req.query = {
      limit: 5,
      page:1,
    }
  }
  const voters = await getVoter(req.query)
  const flashMessage = req.flash('message')

  res.render('voters', {
    layout: 'layouts/main-layout',
    title: 'voters',
    voters,
    errors: flashMessage,
  })
})

// add voters
app.post('/voters', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  voterPhoto(req, res, (err) => {
    if (err) {
      req.flash('message', 'invalid photo file!')
      res.redirect('/voters')
    } else {
      const { error, value } = voterValidation(req.body)
      if (error) {
        req.flash('message', error.details)
        res.redirect('/voters')
      } else {
        addVoter(value, req.file)
        res.redirect('/voters')
      }
    }
  })
})

// edit voters
app.put('/voters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  voterPhoto(req, res, (err) => {
    if (err) {
      req.flash('message', 'invalid photo file!')
      res.redirect('/voters')
    } else {
      const { error, value } = voterValidation(req.body)
      if (error) {
        req.flash('message', error.details)
        res.redirect('/voters')
      } else {
        editVoter(value, req.file)
        res.redirect('/voters')
      }
    }
  })
})

// delete voters
app.delete('/voters', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  deleteVoter(req.body.id)
  req.flash('message', `${req.body.id} deleted`)
  res.redirect('/voters')
})

// export voter pubkey
app.get('/voter/pubkey/:id', async (req, res) => {
  const { error } = idValidation(new Object({ id: req.params.id }))
  
  if (error) {
    res.send('invalid id!')
  } else {
    const voterID = await getVoterPubkey(req.params.id)
    res.send(voterID)
  }
})

// export voter password
app.get('/voter/passwd/:id', async (req, res) => {
  const voter = await getvoterpasswd(req.params.id)
  res.send(voter)
})

// export a voter
app.get('/voter/:id', async (req, res) => {
  const voters = await getSingleVoter(req.params.id)
  res.send(voters)
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
    const flashMessage = req.flash('message')
    const user = req.user.username

    res.render('candidates', {
      layout: 'layouts/main-layout',
      title: 'candidates',
      user,
      candidate,
      allCandidates,
      errors: flashMessage,
    })
  }
)

// add candidates
app.post(
  '/candidates',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    // multer upload file foto
    candidatePhoto(req, res, (err) => {
      if (err) {
        req.flash('message', 'invalid photo file!')
        res.redirect('/candidates')
      } else {
        const { error, value } = candidateValidation(req.body)
        if (error) {
          req.flash('message', error.details)
          res.redirect('/voters')
        } else {
          addCandidate(value, req.file)
          res.redirect('/candidates')
        }
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
app.get('/getcandidates', async (req, res) => {
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
