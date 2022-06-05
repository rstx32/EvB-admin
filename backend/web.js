require('dotenv').config({ path: './backend/config/.env' })
const fs = require('fs')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const connectEnsureLogin = require('connect-ensure-login')
const flash = require('connect-flash')
const readXlsxFile = require('read-excel-file/node')
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
  getCandidates,
  addCandidate,
  deleteCandidate,
  getValidator,
  solveError,
  tokenValidation,
  isAdminAllowed,
  receiveComplaint,
  isComplaintExist,
  getComplaints,
  solveComplaint,
  sendResetKey,
  resetPassword,
  createAccount,
  resetKeyValidation,
} = require('./db')
const {
  voterValidation,
  candidateValidation,
  voterValidate,
} = require('./validation')
const voterPhoto = voterUpload.single('voterPhotoUpload')
const candidatePhoto = candidateUpload.single('candidatePhotoUpload')
const voterFile = voterFileUpload.single('voterFile')
const Admin = require('./model/admin')
const app = express()
  .set('view engine', 'ejs')
  .use(express.urlencoded({ extended: false }))
  .use(expressLayouts)
  .use(express.static('public'))
  .use(methodOverride('_method'))
  .use(
    session({
      cookie: { maxAge: 1000 * 60 * 60 },
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())

passport.use(Admin.createStrategy())
passport.serializeUser(Admin.serializeUser())
passport.deserializeUser(Admin.deserializeUser())

// register page
app.get('/register', (req, res) => {
  const flashMessage = req.flash('message')
  res.render('auth/register', {
    layout: 'layouts/auth-layout',
    title: 'Voter Registration',
    error: flashMessage,
  })
})

app.post('/register', async (req, res) => {
  const { error, value } = voterValidate(req.body, 'validateByKey')
  if (error) {
    req.flash('message', 'invalid key!')
    res.redirect('register')
  } else {
    const voter = await getSingleVoter(req.body.key, 'findbykey')
    const status = await isPubkeyExist(voter.nim)

    if (status === 1) {
      req.flash('message', 'invalid key!')
      res.redirect('register')
    } else if (status === 2) {
      req.flash('message', `voter has been registered!`)
      res.redirect('register')
    } else {
      res.render('auth/register-2', {
        layout: 'layouts/auth-layout',
        voter,
        title: 'Voter Registration',
      })
    }
  }
})

app.post('/register2', async (req, res) => {
  const isSucced = await addPubKey(req.body)

  if (isSucced) {
    req.flash('message', `registration complete!`)
    res.redirect('register')
  } else {
    req.flash('message', `voter has been registered!`)
    res.redirect('register')
  }
})

// login page
app.get('/login', (req, res) => {
  const errorMessage = req.flash('errorMessage')
  const successMessage = req.flash('successMessage')

  res.render('auth/login', {
    layout: 'layouts/auth-layout',
    title: 'EvB-Admin Login',
    flashMessage: { errorMessage, successMessage },
  })
})

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: {
      type: 'errorMessage',
      message: 'wrong username or password!',
    },
    successRedirect: '/voters',
  }),
  (req, res) => {}
)

// logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

// homepage
app.get('/', (req, res) => {
  res.render('root', {
    layout: 'layouts/public-layout',
    title: 'Homepage EvB-admin',
  })
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
app.post(
  '/voters',
  connectEnsureLogin.ensureLoggedIn(),
  isAdminAllowed,
  (req, res) => {
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
  }
)

// voters xlsx file upload
app.post(
  '/voters-file',
  connectEnsureLogin.ensureLoggedIn(),
  isAdminAllowed,
  (req, res) => {
    voterFile(req, res, (err) => {
      if (err) {
        req.flash('errorMessage', 'invalid spreadsheet file!')
        res.redirect('/voters')
      } else {
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
      }
    })
  }
)

// edit voters
app.put(
  '/voters',
  connectEnsureLogin.ensureLoggedIn(),
  isAdminAllowed,
  (req, res) => {
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
  }
)
/////////////////////////////////////// end of voters ////////////////////////////////////////

//////////////////////////////////////// /// candidates ///////////////////////////////////////////
// get all candidates
app.get(
  '/candidates',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const candidate = await getCandidates()
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
  isAdminAllowed,
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
app.delete(
  '/:type',
  connectEnsureLogin.ensureLoggedIn(),
  isAdminAllowed,
  (req, res, next) => {
    if (req.params.type === 'voters') {
      deleteVoter(req.body.email)
      req.flash('successMessage', `${req.body.email} deleted`)
      res.redirect('/voters')
    } else if (req.params.type === 'candidates') {
      deleteCandidate(req.body.id)
      req.flash('successMessage', `candidate deleted`)
      res.redirect('/candidates')
    } else {
      next()
    }
  }
)

/////////////////// export API ///////////////////
// export data voter/candidate to validator
app.get('/export/:type', tokenValidation, async (req, res) => {
  if (req.params.type === 'voter') {
    const voters = await getVoters(req.query)
    res.json(voters)
  } else if (req.params.type === 'candidate') {
    const candidates = await getCandidates()
    res.json(candidates)
  } else {
    res.send('invalid request')
  }
})

// export voter pubkey
app.get('/voter/pubkey', tokenValidation, async (req, res) => {
  console.log(req.query)
  const { error } = voterValidate(req.query, 'validateByNim')

  if (error) {
    res.send(error)
  } else {
    const pubKey = await getVoterPubkey(req.query.nim)
    res.send(pubKey)
  }
})

// export voter password
app.get('/voter/passwd', tokenValidation, async (req, res) => {
  const voter = await getvoterpasswd(req.query.nim)
  res.send(voter)
})

// export a voter
app.get('/voter', tokenValidation, async (req, res) => {
  const voter = await getSingleVoter(req.query.nim, 'findbynim')
  res.send(voter)
})
/////////////////// end export API ///////////////////

// solve error
app.post('/solve/:type', async (req, res) => {
  solveError(req.body, req.params.type)
  res.redirect(`/${req.params.type}s`)
})

// public page
app.get('/public', async (req, res) => {
  const voters = await getVoters(req.query)
  const errorMessage = req.flash('errorMessage')
  const successMessage = req.flash('successMessage')

  res.render('public', {
    layout: 'layouts/public-layout',
    title: 'voter list',
    voters,
    flashMessage: { errorMessage, successMessage },
  })
})

app.post('/public', async (req, res) => {
  const checkComplaint = await isComplaintExist(req.body.email)

  if (checkComplaint !== null) {
    req.flash('errorMessage', 'you are already complained before!')
    res.redirect('/public')
  } else {
    try {
      await receiveComplaint(req.body)
      req.flash(
        'successMessage',
        `complaint ${req.body.email} sent, please wait for fixes`
      )
      res.redirect('/public')
    } catch (error) {
      const errorMessage = [
        error.errors.email.message,
        error.errors.comment.message,
      ]
      req.flash('errorMessage', errorMessage)
      res.redirect('/public')
    }
  }
})

// complaint page
app.get(
  '/complaints',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const complaints = await getComplaints(req.query)
    const user = req.user.username
    const successMessage = req.flash('successMessage')
    const errorMessage = req.flash('errorMessage')

    res.render('complaints', {
      layout: 'layouts/main-layout',
      title: 'complaint page',
      complaints,
      user,
      flashMessage: { errorMessage, successMessage },
    })
  }
)

app.post(
  '/complaints',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await solveComplaint(req.body)
      req.flash('successMessage', `complaint ${req.body.email} solved`)
      res.redirect('/complaints')
    } catch (error) {
      res.send(error)
    }
  }
)
// end complaint page

// voter/admin forgot password
app.get('/forgot-password', (req, res) => {
  const errorMessage = req.flash('errorMessage')
  const successMessage = req.flash('successMessage')

  res.render('auth/forgot-password', {
    layout: 'layouts/auth-layout',
    flashMessage: { errorMessage, successMessage },
    title: 'voter/admin forgot password',
  })
})

app.post('/forgot-password', async (req, res) => {
  const isEmailAvailable = await sendResetKey(req.body.email)

  if (isEmailAvailable) {
    req.flash('successMessage', `password reset key sent to ${req.body.email}`)
    res.redirect('/forgot-password')
  } else {
    req.flash('errorMessage', `email ${req.body.email} not found`)
    res.redirect('/forgot-password')
  }
})

app.get('/reset-password', (req, res) => {
  const errorMessage = req.flash('errorMessage')
  const successMessage = req.flash('successMessage')

  res.render('auth/reset-password', {
    layout: 'layouts/auth-layout',
    flashMessage: { errorMessage, successMessage },
    title: 'voter/admin reset password',
  })
})

app.post('/reset-password', async (req, res) => {
  const account = await resetKeyValidation(req.body.reset_key)
  if (account !== null) {
    res.render('auth/reset-password-2', {
      layout: 'layouts/auth-layout',
      title: 'reset password',
      account,
    })
  } else {
    req.flash('errorMessage', 'invalid reset key code!')
    res.redirect('/reset-password')
  }
})

app.post('/reset-password-2', async (req, res) => {
  try {
    await resetPassword(req.body)
    req.flash('successMessage', `${req.body.email} password updated`)
  } catch (error) {
    req.flash('errorMessage', 'reset password failed!')
  }
  res.redirect('/reset-password')
})
// end voter forgot password

// admin change password
app.post('/change-password', async (req, res) => {
  const admin = await Admin.findByUsername(req.body.username)

  try {
    await admin.changePassword(req.body.currentPassword, req.body.newPassword)
    req.flash('successMessage', 'password successfully changed')
    res.redirect('/logout')
  } catch (error) {
    req.flash('errorMessage', 'incorrect current password!')
    res.redirect('back')
  }
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

// create admin account for the first time
;(async () => {
  createAccount(process.env.USERNAME, process.env.EMAIL)
})()
