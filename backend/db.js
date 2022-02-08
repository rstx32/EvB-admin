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
  const password = await bcrypt.hash(newVoter.password, 8)
  if (!newPhoto) {
    await Voter.create({
      username: newVoter.username,
      fullname: newVoter.fullname,
      password: password,
      email: newVoter.email,
      photo: 'dummy.jpg',
    })
  } else {
    await Voter.create({
      username: newVoter.username,
      fullname: newVoter.fullname,
      password: password,
      email: newVoter.email,
      photo: newPhoto.filename,
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
  // change voters with the new one
  await Voter.updateOne(
    {
      _id: ObjectId(newVoter.id),
    },
    {
      $set: {
        username: newVoter.username,
        email: newVoter.email,
        fullname: newVoter.fullname,
        password: bcrypt.hash(newVoter.password, 8),
        photo: newPhoto,
      },
    }
  )

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
