import {guideRenderFunc, rgbaToId} from './helpers';
import {EventNames, Shape} from '@/shapes';
import EventSimulator, {ActionType} from './EventSimulator';
import {Svg2CanvasConfig, StageConstructorProps} from "@/types";

export * from './shapes';
export * from './helpers';

export class Stage {
  // canvas
  private canvas: HTMLCanvasElement;
  // 虚拟Canvas，如果支持离屏渲染就是离屏渲染的canvas，如果不支持则是一个拟定的在屏幕外渲染的canvas实例
  private offCanvas: HTMLCanvasElement;
  // canvas 实例化对象
  private readonly ctx: CanvasRenderingContext2D;
  // 虚拟Canvas实例对象
  private readonly offCtx: CanvasRenderingContext2D;
  private readonly dpr: number;
  private readonly width: number;
  private readonly height: number;

  private renderChildren: Array<any>
  private eventSimulator: EventSimulator;
  private shapesSet: Set<string>;

  private shapesActionsList: string[]
  private shapesActionsProxy: {[key: string]: boolean}

  private onChange: any

  constructor({canvasRes, osCanvasRes,dpr = 2}: StageConstructorProps, callback?: any) {
    const { width, height } = canvasRes;
    this.width = width;
    this.height = height;
    this.canvas = canvasRes;
    this.offCanvas = osCanvasRes;
    this.renderChildren = [];

    // canvas 实例
    this.ctx = this.canvas.getContext('2d')!;
    this.offCtx = this.offCanvas.getContext('2d')!;

    // 获取屏幕像素
    this.dpr = dpr

    // 新版本的2dCanvas需要通过设置原有的节点宽高，而非设置实例宽高 参考： https://blog.csdn.net/ITzhongzi/article/details/115612944
    // 通过 dpr 缩放
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.offCanvas.width = width * this.dpr;
    this.offCanvas.height = height * this.dpr;
    this.offCtx.scale(this.dpr, this.dpr);

    this.shapesSet = new Set();

    this.onChange = callback

    this.shapesActionsList = []
    this.setProxy()

    this.eventSimulator = new EventSimulator();
  }

  /**
   * 添加配置文件初始化舞台
   */
  init(config: Svg2CanvasConfig[]) {
    config.forEach(({children,nature, nanoid = ''}) => {
      if(!children) return
      children.forEach((el ) => {
        const renderFunc = guideRenderFunc(el.type)
        if (!renderFunc) {
          throw new Error(el.type ? `${el.type}该类型暂未支持。`: '请传入正确格式的svg解析配置')
          return
        }
        const shape = renderFunc && renderFunc({...el, dpr: this.dpr, nanoid})
        if (!shape) return
        nature && nature === 'interaction' && nanoid && shape.on(EventNames.click, () => {
          const res = Reflect.get(this.shapesActionsProxy, nanoid)
          Reflect.set(this.shapesActionsProxy, nanoid, !res)
          this.render()
        })
        this.add(shape)
      })
    })
  }

  /**
   * 通过添加到renderChildren中循环渲染
   * @param shape
   */
  add(shape: Shape) {
    // 判断是否绑定事件，如果未绑定事件，按正常渲染处理即可
    if (Object.keys(shape.getListeners()).length > 0) {
      const id = shape.getId();
      this.eventSimulator.addListeners(id, shape.getListeners());
      this.shapesSet.add(id);
    }
    this.renderChildren.push(shape);
  }

  /**
   * 循环渲染
   */
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.renderChildren && this.renderChildren.forEach(shape => {
      // 只对绑定了事件的区域复制到离屏Canvas中渲染
      if (Object.keys(shape.getListeners()).length > 0) {
        shape.clone().draw(this.offCtx);
      }
      if (shape?.nanoid && !Reflect.get(this.shapesActionsProxy, shape.nanoid)) {
        return
      }
      shape.draw(this.ctx);
    });
  }

  /**
   * 清理渲染背景
   */
  clear() {
    this.renderChildren = [];
    // 清理保存的点击区域id
    this.shapesSet.clear();
    this.setProxy()
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.offCtx.clearRect(0, 0, this.width, this.height);
    this.render()
  }

  /**
   * 通过检查点击的区域是否在离屏的canvas中有渲染相应的颜色区域检查是否点击到某个指定区域
   * @param x
   * @param y
   */
  private hitJudge(x: number, y: number): string | undefined {
    const rgba = Array.from(this.offCtx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data);
    const id = rgbaToId(rgba as [number, number, number, number]);
    return this.shapesSet.has(id) ? id : undefined;
  }


  /**
   * 绑定触摸事件
   * @param evt
   */
  touchStartHandler(evt: any) {
    const p1 = evt.touches[0];
    const { x, y } = p1;
    const id = this.hitJudge(x, y) as string;
    this.eventSimulator.addAction({ type: ActionType.Down, id }, evt);
  }

  /**
   * 绑定触摸事件
   * @param evt
   */
  touchEndHandler(evt: any) {
    const p1 = evt.changedTouches[0];
    const { x, y } = p1;
    const id = this.hitJudge(x, y) as string;
    this.eventSimulator.addAction({ type: ActionType.Up, id }, evt);
  }

  /**
   * 绑定点击事件
   * @param evt
   */
  clickHandle(evt: Event, {x, y}) {
    const id = this.hitJudge(x, y) as string;
    this.eventSimulator.addAction({ type: ActionType.Down, id }, evt);
    this.eventSimulator.addAction({ type: ActionType.Up, id }, evt);
  }

  setActions(_arr: any[]) {
    this.shapesActionsList = [..._arr]
    this.setProxy()
    this.render()
  }

  setProxy() {
    const defaultActionsObj = {}
    this.shapesActionsList.forEach(el => {
      Reflect.set(defaultActionsObj, el, true)
    })
    this.shapesActionsProxy = new Proxy(defaultActionsObj, {
      set: this.proxySetFn.bind(this)
    })
  }

  proxySetFn(target, key, value) {
    Reflect.set(target, key, value)
    //数据有变化 触发onChange
    this.onChange && this.onChange(key)
    return true
  }
}
