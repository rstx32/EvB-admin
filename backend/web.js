require('dotenv').config({ path: './backend/.env' })
const fs = require('fs')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const connectEnsureLogin = require('connect-ensure-login')
const flash = require('connect-flash')
const readXlsxFile = require('read-excel-file/node')
const fetch = require('node-fetch')
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

const { voterUpload, voterFileUpload, candidateUpload } = require('./multer')
const {
  getVoters,
  addVoter,
  getSingleVoter,
  deleteVoter,
  editVoter,
  addPubKey,
  isPubkeyExist,
  getVoterPubkey,
  getvoterpasswd,
  searchVoter,
  getCandidate,
  addCandidate,
  deleteCandidate,
  getValidator,
  solveError,
} = require('./db')
const {
  voterValidation,
  candidateValidation,
  idValidation,
} = require('./validation')
const voterPhoto = voterUpload.single('voterPhotoUpload')
const candidatePhoto = candidateUpload.single('candidatePhotoUpload')
const voterFile = voterFileUpload.single('voterFile')
const Admin = require('./model/admin')

passport.use(Admin.createStrategy())
passport.serializeUser(Admin.serializeUser())
passport.deserializeUser(Admin.deserializeUser())

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
      const voter = await getSingleVoter(req.body.id, 'getbyid')
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
  const errorMessage = req.flash('messageFailure')
  const successMessage = req.flash('messageSuccess')

  res.render('auth/login', {
    layout: 'auth/login',
    title: 'login',
    flashMessage: { errorMessage, successMessage },
  })
})

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: {
      type: 'messageFailure',
      message: 'wrong username or password!',
    },
    successRedirect: '/',
  }),
  (req, res) => {}
)

// logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

// root page
app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.redirect('/voters')
})

/////////////////////////////////////////// voters ///////////////////////////////////////////
// get all voters
app.get('/voters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const voters = await getVoters(req.query)
  const errorMessage = req.flash('errorMessage')
  const successMessage = req.flash('successMessage')
  const user = req.user.username
  const validator = await getValidator()

  res.render('voters', {
    layout: 'layouts/main-layout',
    title: 'voters',
    voters,
    user,
    flashMessage: { errorMessage, successMessage },
    validator,
  })
})

// add voters
app.post('/voters', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  voterPhoto(req, res, (err) => {
    if (err) {
      req.flash('errorMessage', 'invalid photo file!')
      res.redirect('/voters')
    } else {
      const { error, value } = voterValidation(req.body)
      if (error) {
        req.flash('errorMessage', error.details)
        res.redirect('/voters')
      } else {
        addVoter(value, req.file)
        req.flash('successMessage', `success add new voter : ${value.email}`)
        res.redirect('/voters')
      }
    }
  })
})

// voters xlsx file upload
app.post('/voters-file', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  voterFile(req, res, (err) => {
    readXlsxFile('backend/voterFile.xlsx').then((rows) => {
      for (x = 1; x < rows.length; x++) {
        const temp = {
          nim: rows[x][0],
          fullname: rows[x][1],
          email: rows[x][2],
        }

        addVoter(temp)
      }
      fs.unlinkSync('backend/voterFile.xlsx')
      req.flash('successMessage', `success import voters`)
      res.redirect('/voters')
    })
  })
})

// edit voters
app.put('/voters', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  voterPhoto(req, res, (err) => {
    if (err) {
      req.flash('errorMessage', 'invalid photo file!')
      res.redirect('/voters')
    } else {
      const { error, value } = voterValidation(req.body)
      if (error) {
        req.flash('errorMessage', error.details)
        res.redirect('/voters')
      } else {
        editVoter(value, req.file)
        req.flash('successMessage', `success edit voter : ${value.email}`)
        res.redirect('/voters')
      }
    }
  })
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
  const voter = await getSingleVoter(req.params.id, 'getbyid')
  res.send(voter)
})
/////////////////////////////////////// end of voters ////////////////////////////////////////

//////////////////////////////////////// /// candidates ///////////////////////////////////////////
// get all candidates
app.get(
  '/candidates',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const candidate = await getCandidate()
    const user = req.user.username
    const errorMessage = req.flash('errorMessage')
    const successMessage = req.flash('successMessage')
    const validator = await getValidator()

    res.render('candidates', {
      layout: 'layouts/main-layout',
      title: 'candidates',
      user,
      candidate,
      flashMessage: { errorMessage, successMessage },
      validator,
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
          req.flash('errorMessage', error.details)
          res.redirect('/candidates')
        } else {
          req.flash(
            'successMessage',
            `success add new candidate : ${value.candidate}`
          )
          addCandidate(value, req.file)
          res.redirect('/candidates')
        }
      }
    })
  }
)
/////////////////////////////////////// end of candidates ////////////////////////////////////////

// delete data
app.delete('/:type', connectEnsureLogin.ensureLoggedIn(), (req, res, next) => {
  if (req.params.type === 'voter') {
    deleteVoter(req.body.email)
    req.flash('successMessage', `${req.body.email} deleted`)
    res.redirect('/voters')
  } else if (req.params.type === 'candidate') {
    deleteCandidate(req.body.id)
    req.flash('successMessage', `candidate deleted`)
    res.redirect('/candidates')
  } else {
    next()
  }
})

// export data to validator
app.get('/export/:type', async (req, res) => {
  if (req.params.type === 'voter') {
    const voters = await getVoters(req.query)
    res.json(voters)
  } else if (req.params.type === 'candidate') {
    const candidates = await getCandidate()
    res.json(candidates)
  } else {
    res.send('invalid request')
  }
})

// solve error
app.post('/solve/:type', async (req, res) => {
  solveError(req.body, req.params.type)
  res.redirect(`/${req.params.type}s`)
})

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
// Admin.register({username: 'admin', active: false}, '123')
