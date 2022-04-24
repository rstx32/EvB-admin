const Joi = require('joi')

// validation for voter
const voterValidation = (voter) => {
  const schema = Joi.object({
    fullname: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `fullname allowed alphabet and space only!`
      }),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).messages({
      'string.min': `password min.{#limit} character!`,
    }),
    public_key: Joi.string(),
  })
  // abortearly : biar semua error tampil dalam array
  return schema.validate(voter, { abortEarly: false })
}

// validation for candidate
const candidateValidation = (candidate) => {
  const schema = Joi.object({
    candidate: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `candidate name allowed alphabet and space only!`,
      }),
    viceCandidate: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .messages({
        'string.pattern.base': `vice candidate name allowed alphabet and space only!`,
      })
      .empty(''),
  })
  // abortearly : biar semua error tampil dalam array
  return schema.validate(candidate, { abortEarly: false })
}

// validation for voterID
const idValidation = (voterID) => {
  const schema = Joi.object({
    id: Joi.string().hex().min(24).max(24),
  })
  return schema.validate(voterID)
}

module.exports = { voterValidation, candidateValidation, idValidation }
