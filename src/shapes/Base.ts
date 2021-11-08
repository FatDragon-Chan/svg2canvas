import { EventNames, Listener, Shape } from './types';
import { createId } from '@/helpers';

export default class Base implements Shape {
  private readonly listeners: { [eventName: string]: Listener[] };

  public id: string;

  constructor() {
    this.id = createId();
    this.listeners = {};
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  draw(ctx: any): void {
    throw new Error('Method not implemented.');
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  clone(osCtx: any): void {
    throw new Error('Method not implemented.');
  }

  on(eventName: EventNames, listener: Listener): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(listener);
    } else {
      this.listeners[eventName] = [listener];
    }
  }

  getListeners(): { [name: string]: Listener[] } {
    return this.listeners;
  }

  getId(): string {
    return this.id;
  }
}
