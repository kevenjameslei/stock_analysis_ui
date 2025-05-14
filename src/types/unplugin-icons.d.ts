// src/types/unplugin-icons.d.ts

declare module '~icons/*' {
  import type { FunctionalComponent, SVGAttributes } from 'vue'
  const component: FunctionalComponent<SVGAttributes>
  export default component
}

declare module 'unplugin-icons/types/vue3' {
  import type { Component } from 'vue'

  export interface IconProps {
    icon: string
    class?: string
    style?: string | Record<string, string>
    color?: string
    size?: string | number
  }

  export const Icon: Component<IconProps>
  export const loadIcons: (icons: string[]) => Promise<void>
}

// 扩展 @iconify/json 的类型支持
declare module '@iconify/json' {
  import type { IconifyJSON } from '@iconify/types'

  const collections: Record<string, IconifyJSON>
  export default collections
}

// 自动安装的图标集合类型
type AutoInstallIcons = Record<string, () => Promise<typeof import('*.vue')>>

declare global {
  const __icons__: AutoInstallIcons
}
