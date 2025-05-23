import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 支持多个 @import '@/xx.scss' 逗号分隔的情况
const IMPORT_REGEX = /@import\s+([^;]+);/g

const toUseSyntax = (content) => {
  return content.replace(IMPORT_REGEX, (_, importList) => {
    const entries = importList
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, '')) // 去除引号
      .filter(p => p.endsWith('.scss') && p.startsWith('@/')) // 只转换 @/ 开头 .scss 文件

    return entries.map(p => `@use '${p}' as *;`).join('\n')
  })
}

const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const updated = toUseSyntax(content)

    if (updated !== content) {
      fs.copyFileSync(filePath, filePath + '.bak') // 备份原文件
      fs.writeFileSync(filePath, updated, 'utf8')
      console.log(`✅ 已转换: ${filePath}`)
    }
  } catch (err) {
    console.error(`❌ 错误: ${filePath}`, err.message)
  }
}

const walkDir = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath)
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.vue') || entry.name.endsWith('.scss'))
    ) {
      processFile(fullPath)
    }
  }
}

const root = path.resolve(__dirname, '../src')
walkDir(root)

console.log('\n🎉 所有 @import 已被替换为 @use ... as *，并已备份 .bak 文件')
