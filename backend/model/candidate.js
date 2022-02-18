const mongoose = require('mongoose')

// schema candidate
const candidateSchema = mongoose.Schema({
    candidate : {
        type: String,
        required: true,
    },
    viceCandidate : String,
    photo: String,
})

const Candidate = mongoose.model('Candidate', candidateSchema)

module.exports = Candidate