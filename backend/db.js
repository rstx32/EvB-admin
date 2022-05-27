require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const Voter = require('./model/voter')
const Candidate = require('./model/candidate')
const Validator = require('./model/validator')
const Admin = require('./model/admin')
const Complaint = require('./model/complaint')
const jwt = require('jsonwebtoken')
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
mongoose.connect(`${process.env.MONGODB_URL}`)

//////////// voter ///////////////

// get all voter
const getVoters = async (query) => {
  if (query === 'disablePagination') {
    return await Voter.paginate({}, { pagination: false })
  }

  // if query is empty, then add default query
  if (Object.keys(query).length === 0) {
    query = {
      limit: 5,
      page: 1,
    }
  }

  if (query.fullname === undefined) {
    return await Voter.paginate(
      {},
      {
        page: query.page,
        limit: query.limit,
      }
    )
  } else {
    const match = query.fullname.toUpperCase()
    return await Voter.paginate(
      { fullname: { $regex: match } },
      { pagination: false }
    )
  }
}

// get a voter
const getSingleVoter = async (key, type) => {
  if (type === 'findbyid') return await Voter.findById(key)
  else if (type === 'findbyemail') {
    return await Voter.findOne({
      email: key,
    })
  } else if (type === 'findbykey') {
    return await Voter.findOne({
      'key.registration': key,
    })
  } else if (type === 'findbynim') {
    return await Voter.findOne({
      nim: key,
    })
  } else if (type === 'findbyresetkey') {
    return await Voter.findOne({
      'key.reset_password': key,
    })
  }
}

// add voter
const addVoter = async (newVoter, newPhoto) => {
  let photo = 'dummy.jpg'
  if (newPhoto !== undefined) {
    photo = newPhoto.filename
  }

  const randomKey = randomstring.generate(6)

  try {
    await Voter.create({
      nim: newVoter.nim,
      fullname: newVoter.fullname,
      email: newVoter.email,
      photo: photo,
      'key.registration': randomKey,
    })
  } catch (error) {
    return new Error('error bro!')
  }
}

// delete voter
const deleteVoter = async (paramEmail) => {
  // delete photo
  deletePhoto(paramEmail, 'voters')

  await Voter.deleteOne({
    email: paramEmail,
  })
}

// edit voter
const editVoter = async (newVoter, newPhoto) => {
  const currentNIM = newVoter.nim
  const newFullname = newVoter.fullname
  const email = newVoter.email

  // if photo are none, do nothing
  // if photo are inserted, delete old photo and replace with the new one
  if (!newPhoto) {
    await Voter.updateOne(
      {
        nim: currentNIM,
      },
      {
        $set: {
          fullname: newFullname,
        },
      }
    )
  } else {
    deletePhoto(email, 'voters')
    await Voter.updateOne(
      {
        nim: currentNIM,
      },
      {
        $set: {
          fullname: newFullname,
          photo: newPhoto.filename,
        },
      }
    )
  }
}

// delete photo
const deletePhoto = async (key, type) => {
  let oldPhoto = {}
  if (type === 'voters') oldPhoto = await getSingleVoter(key, 'getbyemail')
  else if (type === 'candidates') oldPhoto = await getSingleCandidate(key)

  if (!oldPhoto) {
    return
  } else if (oldPhoto.photo !== 'dummy.jpg') {
    fs.unlink(`public/photo/${type}/${oldPhoto.photo}`, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  }
}

// check if pubkey has filled or not, also check if voterID is invalid
// return 1 : voter is not exist
// return 2 : public key is filled
// return 3 : public key is null
const isPubkeyExist = async (nim) => {
  const voter = await getSingleVoter(nim, 'findbynim')

  if (voter === null) {
    return 1
  } else if (voter.public_key !== null) {
    return 2
  } else {
    return 3
  }
}

// add public_key
const addPubKey = async (voter) => {
  const voterNIM = voter.nim
  const voterPassword = await bcrypt.hash(voter.password, 8)
  const pubKey = voter.public_key

  const status = await isPubkeyExist(voter.nim)
  if (status === 3) {
    await Voter.updateOne(
      {
        nim: voterNIM,
      },
      {
        $set: {
          public_key: pubKey,
          password: voterPassword,
          'key.registration': null,
        },
      }
    )
    return true
  } else {
    return false
  }
}

// get public key of voter only
const getVoterPubkey = async (nim) => {
  const status = await isPubkeyExist(nim)
  if (status === 1) return 'invalid nim!'
  else if (status === 3) return 'public key has not set!'

  return await Voter.findOne({ nim: nim }).select('public_key')
}

// export a voter
const getvoterpasswd = async (nim) => {
  return await Voter.findOne({ nim: nim }).select('password')
}
//////////// end of voter ///////////////

//////////// candidate ///////////////
// get all candidate
const getCandidates = async () => {
  return await Candidate.find()
}

// get a Candidate
const getSingleCandidate = async (id) => {
  return await Candidate.findOne({ _id: id })
}

// add candidate
const addCandidate = async (newCandidate, newPhoto) => {
  let photo = 'dummy.jpg'
  if (newPhoto !== undefined) {
    photo = newPhoto.filename
  }

  await Candidate.create({
    candidate: newCandidate.candidate,
    viceCandidate: newCandidate.viceCandidate,
    photo: photo,
  })
}

// delete candidate
const deleteCandidate = async (id) => {
  // delete photo
  deletePhoto(id, 'candidates')

  await Candidate.deleteOne({
    _id: id,
  })
}

//////////// end of candidate ///////////////

// get validation
const getValidator = async () => {
  return await Validator.find()
}

// solve error
const solveError = async (data, type) => {
  if (type === 'voter') {
    await Validator.updateOne(
      { _id: data.validator },
      {
        'voter.solve': 'solved',
      }
    )
  } else if (type === 'candidate') {
    await Validator.updateOne(
      { _id: data.validator },
      {
        'candidate.solve': 'solved',
      }
    )
  }
}

// JWT validation middleware
const tokenValidation = (req, res, next) => {
  try {
    jwt.verify(req.headers.token, process.env.JWT)
    return next()
  } catch (error) {
    res.json({ message: 'unauthorized' }).status(401)
  }
}

// is admin allowed to access url middleware
const isAdminAllowed = async (req, res, next) => {
  const admin = await Admin.findOne({
    username: 'admin',
  })

  if (
    req.url === '/voters' ||
    req.params.type === 'voters' ||
    req.url === '/voters-file' ||
    req.url === '/voters?_method=PUT'
  ) {
    if (admin.voterAccess === 'allow') {
      return next()
    } else if (admin.voterAccess === 'deny') {
      req.flash('errorMessage', 'voter has been locked!')
      return res.redirect('/voters')
    }
  } else if (req.url === '/candidates' || req.params.type === 'candidates') {
    if (admin.candidateAccess === 'allow') {
      return next()
    } else if (admin.candidateAccess === 'deny') {
      req.flash('errorMessage', 'candidate has been locked!')
      return res.redirect('/candidates')
    }
  }
}

// receive complaint from public
const receiveComplaint = async (data) => {
  return await Complaint.create({
    email: data.email,
    comment: data.comment,
  })
}

// get all complaint
const getComplaints = async (query) => {
  // if query is empty, then add default query
  if (Object.keys(query).length === 0) {
    query = {
      limit: 5,
      page: 1,
    }
  }

  if (query.email === undefined) {
    return await Complaint.paginate(
      {
        status: 'unsolved',
      },
      {
        page: query.page,
        limit: query.limit,
      }
    )
  } else {
    const match = query.email.toLowerCase()
    return await Complaint.paginate(
      { email: { $regex: match }, status: 'unsolved' },
      { pagination: false }
    )
  }
}

// solve complaint
const solveComplaint = async (data) => {
  return await Complaint.updateOne(
    {
      email: data.email,
    },
    {
      $set: {
        status: 'solved',
      },
    }
  )
}

// reset password
const sendResetKey = async (email) => {
  const voter = await getSingleVoter(email, 'findbyemail')
  if (voter !== null) {
    const randomkey = randomstring.generate(6)
    await Voter.updateOne(
      {
        email: email,
      },
      {
        $set: {
          'key.reset_password': randomkey,
        },
      }
    )

    const mailtrap = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '4e56d2a27d9572',
        pass: '81878f80487ec9',
      },
    })

    const fileHTML = await ejs.renderFile('views/email.ejs', {
      voter: voter.fullname,
      reset_password: randomkey,
    })

    const mailOptions = {
      from: 'evb-organizer@evb.com',
      to: voter.email,
      subject: 'Voter Reset Password',
      html: fileHTML,
    }
    mailtrap.sendMail(mailOptions)
    return true
  } else {
    return false
  }
}

// reset voter password
const resetPassword = async (data) => {
  const voterPassword = await bcrypt.hash(data.password, 8)
  const resetKey = data.reset_key
  const voter = await Voter.updateOne(
    {
      'key.reset_password': resetKey,
    },
    {
      $set: {
        password: voterPassword,
        'key.reset_password': null,
      },
    }
  )
  return voter
}

// delete unused photo voter/candidate if exist
const removeUnusedPhoto = async () => {
  const voters = await getVoters('disablePagination')
  const candidates = await getCandidates()
  const voterPhotoList = fs.readdirSync('./public/photo/voters', {
    encoding: 'utf-8',
  })
  const candidatePhotoList = fs.readdirSync('./public/photo/candidates', {
    encoding: 'utf-8',
  })

  for (let x = 0; x < voterPhotoList.length; x++) {
    let temp = 0
    voters.docs.forEach((element) => {
      if (voterPhotoList[x] === element.photo) {
        temp++
      }
    })

    if (temp === 0) {
      fs.unlinkSync(`./public/photo/voters/${voterPhotoList[x]}`)
    }
  }

  for (let x = 0; x < candidatePhotoList.length; x++) {
    let temp = 0
    candidates.forEach((element) => {
      if (candidatePhotoList[x] === element.photo) {
        temp++
      }
    })

    if (temp === 0) {
      fs.unlinkSync(`./public/photo/candidates/${candidatePhotoList[x]}`)
    }
  }
}

removeUnusedPhoto()

module.exports = {
  getVoters,
  getSingleVoter,
  addVoter,
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
  getComplaints,
  solveComplaint,
  sendResetKey,
  resetPassword,
}
