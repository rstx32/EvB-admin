require('dotenv').config({ path: './backend/.env' })
const uri = `${process.env.MONGODB_URL}`
const mongoose = require('mongoose')
const CryptoJS = require('crypto-js')
const { Voter } = require('./model/voter')
const { ObjectId } = require('mongodb')
const fs = require('fs')
mongoose.connect(uri)

// get all voter
const getVoter = async () => {
  return await Voter.find()
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
  const oldPhoto = await getSingleVoter(newVoter.id)
  
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

  fs.unlink(`public/photo/voters/${oldPhoto.photo}`, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}

// get a voter
const getSingleVoter = async (id) => {
  return await Voter.findById(id)
}

module.exports = {
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
}
