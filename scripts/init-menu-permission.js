'use strict'

// Wrapper to keep原入口：调用 unified init-all 的菜单部分
const { initAll } = require('./init-all')

async function seed(options = {}) {
  await initAll({ ...options, skipMenus: false })
}

if (require.main === module) {
  const forceClean = process.argv.includes('--force-clean') || process.argv.includes('--force')
  const dryRun = process.argv.includes('--dry-run')
  seed({ forceClean, dryRun }).catch(() => process.exit(1))
}

module.exports = { seed }
