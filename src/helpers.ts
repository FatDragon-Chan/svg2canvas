
// id存储池
import {
  RenderType,
  Svg2CanvasRenderItemConfig
} from "@/types";

const idPool = {};

import {Path, Polygon} from './shapes/index'

/**
 * id转换成rgb色值
 * @param id
 */
export function idToRgba(id: string) {
  return id.split('-');
}

/**
 * rgb色值转换成id
 * @param rgba
 */
export function rgbaToId(rgba: [number, number, number, number]) {
  return rgba.join('-');
}


/**
 * 通过随机0 - 255 的色值转换成rgb做唯一色值生成
 */
export function createOnceId(): string {
  return Array(3)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 255))
    .concat(255)
    .join('-');
}

/**
 * 生成唯一id
 */
export function createId(): string {
  let id = createOnceId();

  while (idPool[id]) {
    id = createOnceId();
  }

  return id;
}

/**
 * 通过type判定返回不同的渲染函数，便于处理
 * @param type
 */
export const guideRenderFunc = (type: RenderType) => {
  const renderPath = (renderProp: Svg2CanvasRenderItemConfig) => {
    const {
      d = '', translate,fill = '#F4F5F6', dpr = 1, nanoid = ''
    } = renderProp;
    return new Path({ fillColor: fill, d, translate, dpr, nanoid });
  };

  const renderPolygon = (renderProps: Svg2CanvasRenderItemConfig) => {
    const {
      fill, translate, points = '',nanoid = ''
    } = renderProps;
    return new Polygon({
      fillColor: fill, points, translate,nanoid
    });
  };


  switch (type) {
    case 'path':
      return renderPath
    case 'polygon':
      return renderPolygon
    default:
      return null
  }
}

export default {}
