import Base from './Base';
import {idToRgba} from "@/helpers";

interface RectProps {
  points: string;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  translate: Array<string | number>;
  nanoid: string
}

export default class Polygon extends Base {
  constructor(private props: RectProps) {
    super(props.nanoid);
    this.props.fillColor = this.props.fillColor || '#fff';
    this.props.strokeColor = this.props.strokeColor || '#000';
    this.props.strokeWidth = this.props.strokeWidth || 1;
  }

  draw(ctx: any) {
    const {
      fillColor,
      translate,
      points,
    } = this.props;
    const pointList = points.split(' ').filter(el => el !== '');
    const xPointList: Array<string> = [];
    const yPointList: Array<string> = [];

    pointList.forEach((point, index) => {
      if (index % 2 === 0) {
        xPointList.push(point);
      } else {
        yPointList.push(point);
      }
    });
    ctx.save();
    ctx.beginPath();
    ctx.translate(translate[0], translate[1]);
    xPointList.forEach((point, index) => {
      if (index <= 0) {
        ctx.moveTo(point, yPointList[index]);
      } else {
        ctx.lineTo(point, yPointList[index]);
      }
    });
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  clone() {
    const [r, g, b, a] = idToRgba(this.id);
    return new Polygon({
      ...this.props,
      fillColor: `rgba(${r}, ${g}, ${b}, ${a})`,
    });
  }
}
