#!/usr/bin/env node

/**
 * 构建所有子包并验证
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

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

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit',
      ...options 
    })
  } catch (error) {
    throw new Error(`Command failed: ${command}`)
  }
}

function checkBuildOutputs(pkg) {
  const pkgPath = join(process.cwd(), 'packages', pkg)
  const outputs = [
    join(pkgPath, 'es', 'index.js'),
    join(pkgPath, 'lib', 'index.cjs'),
    join(pkgPath, 'es', 'index.d.ts')
  ]
  
  const missing = outputs.filter(file => !existsSync(file))
  return { success: missing.length === 0, missing }
}

async function main() {
  log('\n🚀 开始构建所有包...\n', 'cyan')
  
  const results = []
  let totalTime = 0
  
  for (const pkg of packages) {
    const startTime = Date.now()
    
    try {
      log(`\n📦 构建 @ldesign/chart-${pkg}...`, 'blue')
      
      // 清理旧的构建
      log('  清理旧文件...', 'yellow')
      exec(`pnpm --filter @ldesign/chart-${pkg} clean`, { stdio: 'pipe' })
      
      // 构建
      log('  开始构建...', 'yellow')
      exec(`pnpm --filter @ldesign/chart-${pkg} build`)
      
      // 验证输出
      log('  验证构建产物...', 'yellow')
      const check = checkBuildOutputs(pkg)
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      totalTime += parseFloat(duration)
      
      if (check.success) {
        log(`  ✓ @ldesign/chart-${pkg} 构建成功 (${duration}s)`, 'green')
        results.push({ pkg, success: true, duration })
      } else {
        log(`  ✗ @ldesign/chart-${pkg} 构建失败: 缺少文件`, 'red')
        check.missing.forEach(file => log(`    - ${file}`, 'red'))
        results.push({ pkg, success: false, duration, missing: check.missing })
      }
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      totalTime += parseFloat(duration)
      
      log(`  ✗ @ldesign/chart-${pkg} 构建失败`, 'red')
      log(`    错误: ${error.message}`, 'red')
      results.push({ pkg, success: false, duration, error: error.message })
    }
  }
  
  // 打印总结
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 构建总结', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach(({ pkg, success, duration }) => {
    const status = success ? '✓' : '✗'
    const color = success ? 'green' : 'red'
    log(`  ${status} @ldesign/chart-${pkg.padEnd(10)} ${duration}s`, color)
  })
  
  log(`\n总计: ${successful} 成功, ${failed} 失败`, 
    failed > 0 ? 'yellow' : 'green')
  log(`总耗时: ${totalTime.toFixed(2)}s\n`, 'cyan')
  
  if (failed > 0) {
    log('❌ 部分包构建失败，请检查错误信息', 'red')
    process.exit(1)
  } else {
    log('🎉 所有包构建成功！', 'green')
  }
}

main().catch(error => {
  log(`\n❌ 构建过程出错: ${error.message}`, 'red')
  process.exit(1)
})
