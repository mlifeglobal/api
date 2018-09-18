module.exports = (Sequelize, lodash) => ({
  attributes: {
    name: {
      type: Sequelize.STRING,
      field: 'name'
    },
    description: {
      type: Sequelize.STRING,
      field: 'description'
    },
    introString: {
      type: Sequelize.STRING,
      field: 'intro_string'
    },
    completionString: {
      type: Sequelize.STRING,
      field: 'completion_string'
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
    maxCompletionLimit: {
      type: Sequelize.INTEGER,
      field: 'max_completion_limit'
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
  classMethods: {
    async optInCodesInUse (optInCodesGiven, excludedID = 0) {
      const optInCodes =
        optInCodesGiven.constructor === Array
          ? optInCodesGiven
          : optInCodesGiven.split(',')

      let optInCodesInUse = []

      const where = { state: { [Sequelize.Op.ne]: 'completed' } }
      if (excludedID) {
        where.id = { [Sequelize.Op.ne]: excludedID }
      }
      const activeSurveys = await this.findAll({ where })

      activeSurveys.forEach(({ optInCodes: activeOptinCodes }) => {
        optInCodesInUse = lodash.union(
          optInCodesInUse,
          lodash.intersection(optInCodes, activeOptinCodes)
        )
      })

      return optInCodesInUse
    }
  },
  instanceMethods: {},
  associations: {
    hasMany: 'Question',
    belongsToMany: { model: 'Participant', through: 'participant_surveys' }
  },
  hooks: {},
  indexes: [],
  timestamps: true,
  createdAt: 'createdDate',
  updatedAt: false,
  publishedDate: false,
  closedDate: false
})
