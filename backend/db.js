require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const Voter = require('./model/voter')
const { ObjectId } = require('mongodb')
mongoose.connect(`${process.env.MONGODB_URL}`)

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
  const newUsername = newVoter.username
  const newFullname = newVoter.fullname
  const newPassword = await bcrypt.hash(newVoter.password, 8)
  const newEmail = newVoter.email
  const newFilePhoto = newVoter.filename

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
      photo: newFilePhoto,
    })
  }
}

// delete voter
const deleteVoter = async (id) => {
  // delete photo
  deletePhoto(id)

  await Voter.deleteOne({
    _id: ObjectId(id),
  })
}

// edit voter
const editVoter = async (newVoter, newPhoto) => {
  const newUsername = newVoter.username
  const newFullname = newVoter.fullname
  const newPassword = await bcrypt.hash(newVoter.password, 8)
  const newEmail = newVoter.email

  // if photo are inserted, then update photo
  if (!newPhoto) {
    await Voter.updateOne(
      {
        _id: ObjectId(newVoter.id),
      },
      {
        $set: {
          username: newUsername,
          email: newEmail,
          fullname: newFullname,
          password: newPassword,
          photo: newPhoto,
        },
      }
    )
  }
  // if photo are none, then don't update
  else {
    await Voter.updateOne(
      {
        _id: ObjectId(newVoter.id),
      },
      {
        $set: {
          username: newUsername,
          email: newEmail,
          fullname: newFullname,
          password: newPassword,
        },
      }
    )
  }

  // delete old photo
  deletePhoto(newVoter.id)
}

// delete photo by voter.id
const deletePhoto = async (id) => {
  const oldPhoto = await getSingleVoter(id)
  if (oldPhoto.photo !== 'dummy.jpg') {
    fs.unlink(`public/photo/voters/${oldPhoto.photo}`, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  } else {
    return
  }
}

module.exports = {
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
}
