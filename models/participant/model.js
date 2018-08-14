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
    whatsappId: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      field: 'whatsapp_id'
    }
  },
  associations: {
    belongsToMany: [
      { model: 'Survey', through: 'participant_surveys' },
      { model: 'Question', through: 'participant_answers' }
    ]
  }
})
