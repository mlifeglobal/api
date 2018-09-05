module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      name: {
        type: Sequelize.STRING,
        field: 'name'
      },
      description: {
        type: Sequelize.STRING,
        field: 'description'
      },
      incentive: {
        type: Sequelize.INTEGER,
        field: 'incentive'
      },
      currency: {
        type: Sequelize.STRING,
        field: 'currency'
      },
      state: {
        type: Sequelize.ENUM,
        values: ['uninitiated', 'in_progress', 'completed'],
        defaultValue: 'uninitiated',
        field: 'state'
      },
      completedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'completed_count'
      },
      optInCodes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        field: 'opt_in_codes'
      },
      initCodes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['1'],
        field: 'init_codes'
      },
      platforms: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        field: 'platforms'
      },
      introString: {
        type: Sequelize.STRING,
        field: 'intro_string'
      },
      completionString: {
        type: Sequelize.STRING,
        field: 'completion_string'
      },
      createdDate: {
        type: Sequelize.DATE,
        field: 'created_date'
      },
      publishedDate: {
        type: Sequelize.DATE,
        field: 'published_date'
      },
      closedDate: {
        type: Sequelize.DATE,
        field: 'closed_date'
      }
    })
  },
  down (queryInterface) {
    return queryInterface.dropTable('surveys')
  }
})
