const Joi = require('joi')

const voterValidation = (voter) => {
  // schema untuk formulir terdiri dari 4 form string : username, fullname, email, password
  const schema = Joi.object({
    fullname: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `fullname hanya diperbolehkan alfabet dan spasi`,
        'string.empty': `fullname tidak boleh kosong`,
      }),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).messages({
      'string.empty': `password tidak boleh kosong`,
      'string.min': `password minimal {#limit} karakter`,
    }),
    public_key: Joi.string(),
  })
  // abortearly : biar semua error tampil dalam array
  return schema.validate(voter, { abortEarly: false })
}

const candidateValidation = (candidate) => {
  // schema untuk formulir terdiri dari 2 form string : candidate dan vice candidate
  const schema = Joi.object({
    candidate: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `nama kandidat hanya diperbolehkan alfabet dan spasi`,
        'string.empty': `nama kandidat tidak boleh kosong`,
      }),
    viceCandidate: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `nama wakil kandidat hanya diperbolehkan alfabet dan spasi`,
        'string.empty': `nama wakil kandidat tidak boleh kosong`,
      }),
  })
  // abortearly : biar semua error tampil dalam array
  return schema.validate(candidate, { abortEarly: false })
}

const idValidation = (voterID) => {
  const schema = Joi.object({
    id: Joi.string().hex().min(24).max(24),
  })
  return schema.validate(voterID)
}

module.exports = { voterValidation, candidateValidation, idValidation }
