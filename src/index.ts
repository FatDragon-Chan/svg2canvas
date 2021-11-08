import { rgbaToId } from './helpers';
import { Shape } from '@/shapes';
import EventSimulator, { ActionType } from './EventSimulator';

export * from './shapes';

export class Stage {
  private canvas: any;

  private osCanvas: any;

  private readonly ctx: any;

  private readonly osCtx: any;

  private readonly dpr: number;

  private readonly width: number;

  private readonly height: number;

  private children: Array<any>

  private eventSimulator: EventSimulator;

  private shapes: Set<string>;

  constructor(canvasRes: any, osCanvasRes: any, dpr: number) {
    const { width, height } = canvasRes;
    this.width = width;
    this.height = height;
    this.canvas = canvasRes.node;
    this.osCanvas = osCanvasRes.node;
    this.children = [];

    // canvas 实例
    this.ctx = this.canvas.getContext('2d');
    this.osCtx = this.osCanvas.getContext('2d');

    // 获取屏幕像素
    this.dpr = dpr

    // 新版本的2dCanvas需要通过设置原有的节点宽高，而非设置实例宽高 参考： https://blog.csdn.net/ITzhongzi/article/details/115612944
    // 通过 dpr 缩放
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.osCanvas.width = width * this.dpr;
    this.osCanvas.height = height * this.dpr;
    this.osCtx.scale(this.dpr, this.dpr);

    this.shapes = new Set();
    this.eventSimulator = new EventSimulator();
  }

  add(shape: Shape) {
    // 判断是否绑定事件，如果未绑定事件，按正常渲染处理即可
    if (Object.keys(shape.getListeners()).length > 0) {
      const id = shape.getId();
      this.eventSimulator.addListeners(id, shape.getListeners());
      this.shapes.add(id);
    }
    this.children.push(shape);
  }

  render() {
    this.children.forEach(shape => {
      shape.draw(this.ctx);
      // 在复制出来的canvas画布中绘制
      if (Object.keys(shape.getListeners()).length > 0) {
        shape.clone().draw(this.osCtx);
      }
    });
  }

  clear() {
    this.children = [];
    this.shapes.clear();
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  touchStartHandler(evt: any) {
    const p1 = evt.touches[0];
    const { x, y } = p1;
    const id = this.hitJudge(x, y) as string;
    this.eventSimulator.addAction({ type: ActionType.Down, id }, evt);
  }

  touchEndHandler(evt: any) {
    const p1 = evt.changedTouches[0];
    const { x, y } = p1;
    const id = this.hitJudge(x, y) as string;
    this.eventSimulator.addAction({ type: ActionType.Up, id }, evt);
  }

  /**
   * Determine whether the current position is inside a certain shape, if it is, then return its id
   * @param x
   * @param y
   */
  private hitJudge(x: number, y: number): string | undefined {
    const rgba = Array.from(this.osCtx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data);
    const id = rgbaToId(rgba as [number, number, number, number]);
    return this.shapes.has(id) ? id : undefined;
  }
}
