module.exports = Sequelize => ({
  up (queryInterface) {
    return queryInterface.addColumn('participant_answers', 'demographics', {
      type: Sequelize.STRING
    })
  }
})
