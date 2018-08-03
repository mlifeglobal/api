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
    }
  },
  associations: {
    hasMany: ['ParticipantSurvey', 'ParticipantAnswer']
  }
})
