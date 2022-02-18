const Joi = require('joi')

const voterValidation = (voter) => {
  // schema untuk formulir terdiri dari 4 form string : username, fullname, email, password
  const schema = Joi.object({
    username: Joi.string()
      .lowercase()
      .pattern(new RegExp('^[a-zA-Z0-9_]*$'))
      .min(4)
      .max(8)
      .required()
      .messages({
        'string.pattern.base': `username hanya diperbolehkan menggunakan alfanumerik dan underscore`,
        'string.empty': `username tidak boleh kosong`,
        'string.min': `username minimal {#limit} karakter`,
        'string.max': `username maksimal {#limit} karakter`,
      }),
    fullname: Joi.string()
      .pattern(new RegExp('^[a-zA-Z ]*$'))
      .required()
      .messages({
        'string.pattern.base': `fullname hanya diperbolehkan alfabet dan spasi`,
        'string.empty': `fullname tidak boleh kosong`,
      }),
    email: Joi.string().email().required(),
    password: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.empty': `password tidak boleh kosong`,
      'string.min': `password minimal {#limit} karakter`,
    }),
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

module.exports = { voterValidation, candidateValidation }
