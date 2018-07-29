module.exports = (bcrypt, config, JWT, mail, moment, Sequelize, twilio, uuid, amplitude, aws) => ({
  attributes: {
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      field: 'phone'
    },
    facebookId: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      field: 'facebook_id'
    }
  },
  associations: {
    hasMany: ['ParticipantSurvey', 'ParticipantAnswer']
  }
})
