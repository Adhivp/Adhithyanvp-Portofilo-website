module.exports = {
  check(ctx) {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  },
};
