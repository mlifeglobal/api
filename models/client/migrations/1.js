module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('clients', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          field: 'id'
        },
        code: {
          type: Sequelize.STRING,
          field: 'code',
          unique: true
        },
        name: {
          type: Sequelize.STRING,
          field: 'name'
        }
      })
      .then(() => {
        queryInterface.bulkInsert('clients', [
          { code: 'mlife_admin', name: 'Mlife Global' }
        ])
      })
  },
  down (queryInterface) {
    return queryInterface.dropTable('clients')
  }
})
