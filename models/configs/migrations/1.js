module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface
      .createTable('configs', {
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
      .then(() => {
        queryInterface.bulkInsert('configs', [
          {
            key: process.env.facebookPageId,
            value: process.env.facebookPageAccessToken,
            token: process.env.facebookVerifyToken,
            description: 'default fb page'
          }
        ])
      })
  },
  down (queryInterface) {
    return queryInterface.dropTable('configs')
  }
})
