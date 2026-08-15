module.exports = [
  {
    method: 'POST',
    path: '/trigger',
    handler: 'sync-controller.trigger',
    config: {
      policies: [],
      auth: false,
    },
  },
];
