module.exports = Sequelize => ({
  attributes: {
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
    platforms: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
      field: 'platforms'
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
  },
  classMethods: {},
  instanceMethods: {},
  associations: {
    hasMany: ['Question', 'ParticipantSurvey', 'ParticipantAnswer']
  },
  hooks: {},
  indexes: [],
  timestamps: true,
  createdAt: 'createdDate',
  updatedAt: false,
  publishedDate: false,
  closedDate: false
})
