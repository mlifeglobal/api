module.exports = Sequelize => ({
  attributes: {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      field: 'name'
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'text'
    }
  }
})
