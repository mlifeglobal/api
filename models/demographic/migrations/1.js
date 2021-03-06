module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('demographics', {
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
        allowNull: false,
        field: 'key'
      },
      validation: {
        type: Sequelize.STRING,
        field: 'validation'
      },
      validationMsg: {
        type: Sequelize.STRING,
        field: 'validation_message'
      }
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('demographics')
  }
})
