module.exports = ({env}) => ({
  'rest-cache': {
    config: {
      provider: {
        name: 'memory',
        options: {
          maxSize: 32767,
          ttl: 7200000
        }
      },
      strategy: {
        contentTypes: [
          'api::category.category',
          'api::event.event',
          'api::menu.menu'
        ]
      }
    },

  }
})
