declare module 'vite-plugin-svg-icons' {
  import type { Plugin } from 'vite'

  /**
   * 插件配置选项
   */
  export interface Options {
    /**
     * SVG 图标目录的绝对路径数组
     * @example [path.resolve(__dirname, 'src/assets/icons')]
     */
    iconDirs: string[]

    /**
     * 图标 symbolId 的命名规则
     * @default 'icon-[name]'
     * @example 'icon-[dir]-[name]' → icon-home
     */
    symbolId?: string

    /**
     * SVG 雪碧图注入位置
     * @default 'body-last'
     */
    inject?: 'body-first' | 'body-last'

    /**
     * 自定义 DOM 容器 ID
     * @default '__svg__icons__dom__'
     */
    customDomId?: string

    /**
     * 是否压缩 SVG
     * @default true
     */
    svgo?: boolean

    /**
     * SVGO 配置
     */
    svgoOptions?: {
      plugins?: Array<
        | string
        | {
            name: string
            params?: Record<string, unknown>
          }
      >
    }
  }

  /**
   * 创建 SVG 雪碧图插件
   * @param options - 插件配置选项
   */
  export function createSvgIconsPlugin(options: Options): Plugin
}
