#!/usr/bin/env node

/**
 * 对所有子包进行类型检查
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

function exec(command) {
  try {
    execSync(command, { stdio: 'pipe' })
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout?.toString() || error.message 
    }
  }
}

async function main() {
  log('\n🔍 开始类型检查...\n', 'cyan')
  
  const results = []
  
  for (const pkg of packages) {
    log(`📦 检查 @ldesign/chart-${pkg}...`, 'blue')
    
    const result = exec(`pnpm --filter @ldesign/chart-${pkg} exec tsc --noEmit`)
    
    if (result.success) {
      log(`  ✓ @ldesign/chart-${pkg} 类型检查通过`, 'green')
      results.push({ pkg, success: true })
    } else {
      log(`  ✗ @ldesign/chart-${pkg} 类型检查失败`, 'red')
      if (result.output) {
        log('\n' + result.output, 'red')
      }
      results.push({ pkg, success: false })
    }
  }
  
  // 总结
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 类型检查总结', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach(({ pkg, success }) => {
    const status = success ? '✓' : '✗'
    const color = success ? 'green' : 'red'
    log(`  ${status} @ldesign/chart-${pkg}`, color)
  })
  
  log(`\n总计: ${successful} 通过, ${failed} 失败\n`, 
    failed > 0 ? 'yellow' : 'green')
  
  if (failed > 0) {
    log('❌ 部分包类型检查失败', 'red')
    process.exit(1)
  } else {
    log('🎉 所有包类型检查通过！', 'green')
  }
}

main().catch(error => {
  log(`\n❌ 类型检查出错: ${error.message}`, 'red')
  process.exit(1)
})
