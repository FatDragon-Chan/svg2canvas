import { idToRgba } from '@/helpers';
import Base from './Base';

interface RectProps {
  x: number;
  y: number;
  radius: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  translate: Array<string>;
  nanoid: string
}

export default class Circle extends Base {
  constructor(private props: RectProps) {
    super(props.nanoid);
    this.props.fillColor = this.props.fillColor || '#fff';
    this.props.strokeColor = this.props.strokeColor || '#000';
    this.props.strokeWidth = this.props.strokeWidth || 1;
  }

  draw(ctx: any) {
    const {
      x, y, radius, fillColor, translate,
    } = this.props;
    ctx.save();
    ctx.beginPath();
    ctx.scale(0.5, 0.5);
    ctx.translate(translate[0], translate[1]);
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  clone() {
    const [r, g, b, a] = idToRgba(this.id);
    return new Circle({ ...this.props, fillColor: `rgba(${r}, ${g}, ${b}, ${a})` });
  }
}
