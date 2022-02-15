require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const Voter = require('./model/voter')
mongoose.connect(`${process.env.MONGODB_URL}`)

// get all voter
const getVoter = async () => {
  return await Voter.find()
}

// get a voter
const getSingleVoter = async (userName) => {
  return await Voter.findOne({ username: userName })
}

// add voter
const addVoter = async (newVoter, newPhoto) => {
  const newUsername = newVoter.username
  const newFullname = newVoter.fullname
  const newPassword = await bcrypt.hash(newVoter.password, 8)
  const newEmail = newVoter.email

  // if photo are none
  if (!newPhoto) {
    await Voter.create({
      username: newUsername,
      fullname: newFullname,
      password: newPassword,
      email: newEmail,
      photo: 'dummy.jpg',
    })
  }
  // if photo are inserted
  else {
    await Voter.create({
      username: newUsername,
      fullname: newFullname,
      password: newPassword,
      email: newEmail,
      photo: newPhoto.filename,
    })
  }
}

// delete voter
const deleteVoter = async (userName) => {
  // delete photo
  deletePhoto(userName)

  await Voter.deleteOne({
    username: userName,
  })
}

// edit voter
const editVoter = async (newVoter, newPhoto) => {
  const newUsername = newVoter.username
  const newEmail = newVoter.email
  const newFullname = newVoter.fullname
  const newPassword = await bcrypt.hash(newVoter.password, 8)

  // if photo are none
  if (!newPhoto) {
    await Voter.updateOne(
      {
        username: newUsername,
      },
      {
        $set: {
          email: newEmail,
          fullname: newFullname,
          password: newPassword,
        },
      }
    )
  }
  // if photo are inserted
  else {
    // delete old photo
    deletePhoto(newUsername)
    await Voter.updateOne(
      {
        username: newUsername,
      },
      {
        $set: {
          email: newEmail,
          fullname: newFullname,
          password: newPassword,
          photo: newPhoto.filename,
        },
      }
    )
  }
}

// delete photo by voter.id
const deletePhoto = async (userName) => {
  const oldPhoto = await getSingleVoter(userName)
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

module.exports = {
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
}
