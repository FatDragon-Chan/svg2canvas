export interface Svg2CanvasConfig {
  type: string
  children: Svg2CanvasRenderItemConfig[]
  nature: 'background' | 'interaction' //  区分背景渲染还是互动区域渲染
  cb?: (item: any) => any
  nanoid?: string
}

export interface Svg2CanvasRenderItemConfig {
  fill: string
  id: string
  d?: string
  points?: string
  dpr?: number
  translate: number[]
  type: 'polygon' | 'path'
  nanoid?: string
}

export type RenderType = 'path' | 'circle' | 'polygon'

export interface StageConstructorProps  {
  canvasRes: HTMLCanvasElement
  osCanvasRes: HTMLCanvasElement
  width: number
  height: number
  dpr: number
}
