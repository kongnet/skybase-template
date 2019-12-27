module.exports = {
  async lock (ctx) {
    await (new Promise(resolve => setTimeout(resolve, 500)))
    ctx.ok()
  },
  async feqLimit (ctx) {
    ctx.ok()
  }
}
