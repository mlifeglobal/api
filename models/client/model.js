module.exports = (Sequelize, shortid) => ({
  attributes: {
    code: {
      type: Sequelize.STRING,
      unique: true
    },
    name: {
      type: Sequelize.STRING
    }
  },
  associations: {
    hasMany: ['User']
  },
  instanceMethods: {
    setCode () {
      this.code = shortid.generate()
    }
  },
  hooks: {
    beforeCreate (instance) {
      instance.setCode()
    }
  }
})
