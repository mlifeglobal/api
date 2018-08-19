module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('constants', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
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
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('constants')
  }
})
