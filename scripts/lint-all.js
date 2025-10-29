#!/usr/bin/env node

/**
 * 对所有子包进行 lint 检查
 */

import { execSync } from 'child_process'

const packages = [
  'core',
  'vue',
  'react',
  'lit',
  'angular',
  'svelte',
  'solid',
  'qwik'
]

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, fix = false) {
  try {
    execSync(command, { stdio: 'pipe' })
    return { success: true }
  } catch (error) {
    const output = error.stdout?.toString() || ''
    const errorCount = (output.match(/error/gi) || []).length
    const warningCount = (output.match(/warning/gi) || []).length
    
    return { 
      success: false, 
      output,
      errorCount,
      warningCount
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix')
  
  log(`\n🔍 开始 ESLint 检查${shouldFix ? ' (自动修复)' : ''}...\n`, 'cyan')
  
  const results = []
  
  for (const pkg of packages) {
    log(`📦 检查 @ldesign/chart-${pkg}...`, 'blue')
    
    const command = shouldFix 
      ? `pnpm --filter @ldesign/chart-${pkg} lint:fix`
      : `pnpm --filter @ldesign/chart-${pkg} lint`
    
    const result = exec(command, shouldFix)
    
    if (result.success) {
      log(`  ✓ @ldesign/chart-${pkg} 检查通过`, 'green')
      results.push({ pkg, success: true })
    } else {
      const { errorCount, warningCount } = result
      log(`  ✗ @ldesign/chart-${pkg} 检查失败`, 'red')
      log(`    错误: ${errorCount}, 警告: ${warningCount}`, 'yellow')
      results.push({ pkg, success: false, errorCount, warningCount })
    }
  }
  
  // 总结
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 Lint 检查总结', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalErrors = results.reduce((sum, r) => sum + (r.errorCount || 0), 0)
  const totalWarnings = results.reduce((sum, r) => sum + (r.warningCount || 0), 0)
  
  results.forEach(({ pkg, success, errorCount, warningCount }) => {
    const status = success ? '✓' : '✗'
    const color = success ? 'green' : 'red'
    const detail = success ? '' : ` (${errorCount} 错误, ${warningCount} 警告)`
    log(`  ${status} @ldesign/chart-${pkg}${detail}`, color)
  })
  
  log(`\n总计: ${successful} 通过, ${failed} 失败`, 
    failed > 0 ? 'yellow' : 'green')
  
  if (totalErrors > 0 || totalWarnings > 0) {
    log(`错误: ${totalErrors}, 警告: ${totalWarnings}`, 'yellow')
  }
  
  if (shouldFix) {
    log('\n💡 提示: 已尝试自动修复问题', 'cyan')
  } else {
    log('\n💡 提示: 运行 "node scripts/lint-all.js --fix" 自动修复', 'cyan')
  }
  
  if (failed > 0) {
    log('\n❌ 部分包 lint 检查失败', 'red')
    process.exit(1)
  } else {
    log('\n🎉 所有包 lint 检查通过！', 'green')
  }
}

main().catch(error => {
  log(`\n❌ Lint 检查出错: ${error.message}`, 'red')
  process.exit(1)
})
