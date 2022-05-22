require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const Voter = require('./model/voter')
const Candidate = require('./model/candidate')
const Validator = require('./model/validator')
mongoose.connect(`${process.env.MONGODB_URL}`)

//////////// voter ///////////////

// get all voter
const getVoters = async (query) => {
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
    console.log(query)
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
  else if (type === 'findbyemail')
    return await Voter.findOne({
      email: email,
    })
}

// add voter
const addVoter = async (newVoter, newPhoto) => {
  let photo = 'dummy.jpg'
  if (newPhoto !== undefined) {
    photo = newPhoto.filename
  }

  try {
    await Voter.create({
      nim: newVoter.nim,
      fullname: newVoter.fullname,
      email: newVoter.email,
      photo: photo,
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
const isPubkeyExist = async (id) => {
  const voter = await getSingleVoter(id, 'findbyid')

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
  const voterID = voter.id
  const voterPassword = await bcrypt.hash(voter.password, 8)
  const pubKey = voter.public_key

  const status = await isPubkeyExist(voter.id)
  if (status === 3) {
    await Voter.updateOne(
      {
        _id: voterID,
      },
      {
        $set: {
          public_key: pubKey,
          password: voterPassword,
        },
      }
    )
    return true
  } else {
    return false
  }
}

// get public key of voter only
const getVoterPubkey = async (id) => {
  const status = await isPubkeyExist(id)
  if (status === 1) return 'invalid id!'
  else if (status === 3) return 'public key has not set!'

  return await Voter.findById(id).select('public_key')
}

// export a voter
const getvoterpasswd = async (id) => {
  return await Voter.findById(id).select('password')
}
//////////// end of voter ///////////////

//////////// candidate ///////////////
// get all candidate
const getCandidate = async () => {
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
        voterSolve: 'solved',
      }
    )
  } else if (type === 'candidate') {
    await Validator.updateOne(
      { _id: data.validator },
      {
        candidateSolve: 'solved',
      }
    )
  }
}

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
  getCandidate,
  addCandidate,
  deleteCandidate,
  getValidator,
  solveError,
}
