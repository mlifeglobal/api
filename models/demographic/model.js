module.exports = Sequelize => ({
  attributes: {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    key: {
      type: Sequelize.STRING,
      unique: true,
      field: 'key',
      allowNull: false
    },
    validation: {
      type: Sequelize.STRING,
      field: 'validation'
    },
    validationMsg: {
      type: Sequelize.STRING,
      field: 'validation_message'
    }
  }
})
