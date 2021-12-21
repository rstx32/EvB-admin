require('dotenv').config({ path: './backend/.env' })
const mongoose = require('mongoose')
const CryptoJS = require('crypto-js')
const fs = require('fs')
const { Voter } = require('./model/voter')
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
const addVoter = (newVoter, newPhoto) => {
  new Voter({
    username: newVoter.username,
    fullname: newVoter.fullname,
    password: CryptoJS.SHA256(newVoter.password).toString(),
    email: newVoter.email,
    photo: newPhoto,
  }).save()
}

// delete voter
const deleteVoter = async (id) => {
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
        password: CryptoJS.SHA256(newVoter.password).toString(),
        photo: newPhoto,
      },
    }
  )

  // delete old photo
  const oldPhoto = await getSingleVoter(newVoter.id)
  fs.unlink(`public/photo/voters/${oldPhoto.photo}`, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}

module.exports = {
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
}
