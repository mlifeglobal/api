module.exports = (Sequelize, JWT) => ({
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
    },
    hasWhatsapp: {
      type: Sequelize.BOOLEAN,
      field: 'has_whatsapp',
      defaultValue: false
    },
    webLinked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'web_linked'
    }
  },
  associations: {
    hasMany: 'Message',
    belongsToMany: [
      { model: 'Survey', through: 'participant_surveys' },
      { model: 'Question', through: 'participant_answers' }
    ]
  },
  instanceMethods: {
    generateJWT () {
      return JWT.sign({ id: this.id, phone: this.phone }, process.env.key)
    },
    getData () {
      return {
        jwt: this.generateJWT(),
        phone: this.phone,
        participantID: this.id
      }
    }
  }
})
