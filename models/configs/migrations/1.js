module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('configs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
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
        allowNull: false,
        field: 'description'
      }
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('configs')
  }
})
