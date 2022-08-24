import { idToRgba } from '@/helpers';
import Base from './Base';
import isSvgPath from '../utils/is-svg-path'
import parse from 'parse-svg-path'
import abs from 'abs-svg-path'
import normalize from 'normalize-svg-path'

interface RectProps {
  fillColor?: string;
  d: string;
  translate: Array<string | number>;
  dpr: number
  nanoid: string
}

export default class Path extends Base {
  constructor(private props: RectProps) {
    super(props.nanoid);
    this.props.fillColor = this.props.fillColor || '#fff';
  }

  draw(ctx: any) {
    const {
      fillColor, d, translate = [0, 0],
    } = this.props;

    if(!isSvgPath(d)) {
      throw new Error('Not an SVG path!');
    }

    const _initialPath = abs(parse(d));
    const _path = normalize(_initialPath);

    ctx.save()
    ctx.beginPath();
    ctx.translate(translate[0], translate[1]);
    if(_path.length) {
      _path.forEach((c) => {
        const [cmd, ...args] = c;
        if(cmd === 'M') {
          ctx.moveTo(...args);
        } else {
          ctx.bezierCurveTo(...args);
        }
      });
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.restore()
    }
  }

  clone() {
    const [r, g, b, a] = idToRgba(this.id);
    return new Path({
      ...this.props,
      fillColor: `rgba(${r}, ${g}, ${b}, ${a})`,
    });
  }
}


