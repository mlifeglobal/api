module.exports = Sequelize => ({
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
    }
  },
  associations: {
    hasMany: 'Message',
    belongsToMany: [
      { model: 'Survey', through: 'participant_surveys' },
      { model: 'Question', through: 'participant_answers' }
    ]
  }
})
