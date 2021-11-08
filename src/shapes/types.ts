export interface Shape {
  draw(ctx: any, osCtx: any): void;

  on(name: string, listener: any): void;

  getListeners(): { [name: string]: any[] };

  getId(): string;
}

export interface Listener {
  (evt: any): void;
}

export enum EventNames {
  click = 'click',
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseup = 'mouseup',
  mouseenter = 'mouseenter',
  mouseleave = 'mouseleave',
}
