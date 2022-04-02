require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const Voter = require('./model/voter')
const Candidate = require('./model/candidate')
mongoose.connect(`${process.env.MONGODB_URL}`)

//////////// voter ///////////////

// count all documents
const voterCount = async () => {
  return await Voter.countDocuments()
}

// get all voter
const getVoter = async () => {
  return await Voter.find()
}

// get a voter
const getSingleVoter = async (id) => {
  return await Voter.findById(id)
}

// add voter
const addVoter = async (newVoter, newPhoto) => {
  const newFullname = newVoter.fullname
  const newEmail = newVoter.email

  // if photo are none
  if (!newPhoto) {
    await Voter.create({
      fullname: newFullname,
      email: newEmail,
      photo: 'dummy.jpg',
    })
  }
  // if photo are inserted
  else {
    await Voter.create({
      fullname: newFullname,
      email: newEmail,
      photo: newPhoto.filename,
    })
  }
}

// delete voter
const deleteVoter = async (id) => {
  // delete photo
  deletePhotoVoter(id)

  await Voter.deleteOne({
    _id: id,
  })
}

// edit voter
const editVoter = async (newVoter, newPhoto) => {
  const currentEmail = newVoter.email
  const newFullname = newVoter.fullname
  const newPassword = bcrypt.hashSync(newVoter.password, 8)

  // if photo are none, do nothing
  // if photo are inserted, delete old photo and replace with the new one
  if (!newPhoto) {
    await Voter.updateOne(
      {
        email: currentEmail,
      },
      {
        $set: {
          fullname: newFullname,
          password: newPassword,
        },
      }
    )
  } else {
    deletePhotoVoter(id)
    await Voter.updateOne(
      {
        email: currentEmail,
      },
      {
        $set: {
          fullname: newFullname,
          password: newPassword,
          photo: newPhoto.filename,
        },
      }
    )
  }
}

// delete photo
const deletePhotoVoter = async (id) => {
  const oldPhoto = await getSingleVoter(id)
  if (!oldPhoto) {
    return
  } else if (oldPhoto.photo !== 'dummy.jpg') {
    fs.unlink(`public/photo/voters/${oldPhoto.photo}`, (err) => {
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
  const voter = await getSingleVoter(id)
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

// count all documents
const candidateCount = async () => {
  return await Candidate.countDocuments()
}

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
  const candidateName = newCandidate.candidate
  const viceCandidateName = newCandidate.viceCandidate

  // if photo are none
  if (!newPhoto) {
    await Candidate.create({
      candidate: candidateName,
      viceCandidate: viceCandidateName,
      photo: 'dummy.jpg',
    })
  }
  // if photo are inserted
  else {
    await Candidate.create({
      candidate: candidateName,
      viceCandidate: viceCandidateName,
      photo: newPhoto.filename,
    })
  }
}

// delete candidate
const deleteCandidate = async (id) => {
  // delete photo
  deletePhotoCandidate(id)

  await Candidate.deleteOne({
    _id: id,
  })
}

// delete photo
const deletePhotoCandidate = async (id) => {
  const oldPhoto = await getSingleCandidate(id)
  if (!oldPhoto) {
    return
  } else if (oldPhoto.photo !== 'dummy.jpg') {
    fs.unlink(`public/photo/candidates/${oldPhoto.photo}`, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  }
}
//////////// end of candidate ///////////////

module.exports = {
  voterCount,
  getVoter,
  getSingleVoter,
  addVoter,
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
}
