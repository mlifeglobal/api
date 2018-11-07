module.exports = Sequelize => ({
  attributes: {
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      field: 'key'
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'value'
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'token'
    },
    description: {
      type: Sequelize.STRING,
      field: 'description'
    }
  }
})
