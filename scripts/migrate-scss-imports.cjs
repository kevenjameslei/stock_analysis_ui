const fs = require('fs')
const path = require('path')

// 匹配 @import '@/xxx.scss';
const IMPORT_REGEX = /@import\s+['"](@\/[^'"]+\.scss)['"]\s*;/g

// 替换为：@use '@/xxx.scss' as *;
const toUseSyntax = (content) => {
  return content.replace(IMPORT_REGEX, (_, importPath) => {
    return `@use '${importPath}' as *;`
  })
}

// 遍历目录并处理文件
function processDir(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)

    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      processDir(fullPath)
    } else if (file.endsWith('.vue') || file.endsWith('.scss')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      const newContent = toUseSyntax(content)

      if (newContent !== content) {
        console.log(`✅ 替换中: ${fullPath}`)
        fs.writeFileSync(fullPath, newContent, 'utf8')
      }
    }
  }
}

// 执行路径：项目根目录
processDir(path.resolve(__dirname, '../src'))

console.log('\n🎉 所有 @import 已替换为 @use ... as *')
