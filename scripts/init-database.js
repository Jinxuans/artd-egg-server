'use strict'

// Thin wrapper to keep旧入口可用：调用统一的 init-all
const { initAll } = require('./init-all')

async function initDatabase() {
  await initAll({ skipMenus: true })
}

if (require.main === module) {
  initDatabase().catch(() => process.exit(1))
}

module.exports = { initDatabase }
