/*!
 * @ahone/svg2canvas v0.0.2
 * (c) 2021-2022 FatDragon-Chan
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Base {
    constructor(nanoid) {
        this.id = createId();
        this.nanoid = nanoid;
        this.listeners = {};
    }
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
    draw(ctx) {
        throw new Error('Method not implemented.');
    }
    /**
     * 为了方便在离屏Canvas里克隆对象
     * @param osCtx
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
    clone(osCtx) {
        throw new Error('Method not implemented.');
    }
    on(eventName, listener) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].push(listener);
        }
        else {
            this.listeners[eventName] = [listener];
        }
    }
    getListeners() {
        return this.listeners;
    }
    getId() {
        return this.id;
    }
}

class Polygon extends Base {
    constructor(props) {
        super(props.nanoid);
        this.props = props;
        this.props.fillColor = this.props.fillColor || '#fff';
        this.props.strokeColor = this.props.strokeColor || '#000';
        this.props.strokeWidth = this.props.strokeWidth || 1;
    }
    draw(ctx) {
        const { fillColor, translate, points, } = this.props;
        const pointList = points.split(' ').filter(el => el !== '');
        const xPointList = [];
        const yPointList = [];
        pointList.forEach((point, index) => {
            if (index % 2 === 0) {
                xPointList.push(point);
            }
            else {
                yPointList.push(point);
            }
        });
        ctx.save();
        ctx.beginPath();
        ctx.translate(translate[0], translate[1]);
        xPointList.forEach((point, index) => {
            if (index <= 0) {
                ctx.moveTo(point, yPointList[index]);
            }
            else {
                ctx.lineTo(point, yPointList[index]);
            }
        });
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.restore();
    }
    clone() {
        const [r, g, b, a] = idToRgba(this.id);
        return new Polygon(Object.assign(Object.assign({}, this.props), { fillColor: `rgba(${r}, ${g}, ${b}, ${a})` }));
    }
}

function isPath(str) {
    if (typeof str !== 'string')
        return false;
    str = str.trim();
    // https://www.w3.org/TR/SVG/paths.html#PathDataBNF
    return /^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(str) && /[\dz]$/i.test(str) && str.length > 4;
}

var parseSvgPath = parse;
/**
 * expected argument lengths
 * @type {Object}
 */

var length = {
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0
};
/**
 * segment pattern
 * @type {RegExp}
 */

var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;
/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * @param {String} path
 * @return {Array}
 */

function parse(path) {
  var data = [];
  path.replace(segment, function (_, command, args) {
    var type = command.toLowerCase();
    args = parseValues(args); // overloaded moveTo

    if (type == 'm' && args.length > 2) {
      data.push([command].concat(args.splice(0, 2)));
      type = 'l';
      command = command == 'm' ? 'l' : 'L';
    }

    while (true) {
      if (args.length == length[type]) {
        args.unshift(command);
        return data.push(args);
      }

      if (args.length < length[type]) throw new Error('malformed path data');
      data.push([command].concat(args.splice(0, length[type])));
    }
  });
  return data;
}

var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;

function parseValues(args) {
  var numbers = args.match(number);
  return numbers ? numbers.map(Number) : [];
}

var absSvgPath = absolutize;
/**
 * redefine `path` with absolute coordinates
 *
 * @param {Array} path
 * @return {Array}
 */

function absolutize(path) {
  var startX = 0;
  var startY = 0;
  var x = 0;
  var y = 0;
  return path.map(function (seg) {
    seg = seg.slice();
    var type = seg[0];
    var command = type.toUpperCase(); // is relative

    if (type != command) {
      seg[0] = command;

      switch (type) {
        case 'a':
          seg[6] += x;
          seg[7] += y;
          break;

        case 'v':
          seg[1] += y;
          break;

        case 'h':
          seg[1] += x;
          break;

        default:
          for (var i = 1; i < seg.length;) {
            seg[i++] += x;
            seg[i++] += y;
          }

      }
    } // update cursor state


    switch (command) {
      case 'Z':
        x = startX;
        y = startY;
        break;

      case 'H':
        x = seg[1];
        break;

      case 'V':
        y = seg[1];
        break;

      case 'M':
        x = startX = seg[1];
        y = startY = seg[2];
        break;

      default:
        x = seg[seg.length - 2];
        y = seg[seg.length - 1];
    }

    return seg;
  });
}

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var TAU = Math.PI * 2;

var mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
  var x = _ref.x,
      y = _ref.y;
  x *= rx;
  y *= ry;
  var xp = cosphi * x - sinphi * y;
  var yp = sinphi * x + cosphi * y;
  return {
    x: xp + centerx,
    y: yp + centery
  };
};

var approxUnitArc = function approxUnitArc(ang1, ang2) {
  // If 90 degree circular arc, use a constant
  // as derived from http://spencermortensen.com/articles/bezier-circle
  var a = ang2 === 1.5707963267948966 ? 0.551915024494 : ang2 === -1.5707963267948966 ? -0.551915024494 : 4 / 3 * Math.tan(ang2 / 4);
  var x1 = Math.cos(ang1);
  var y1 = Math.sin(ang1);
  var x2 = Math.cos(ang1 + ang2);
  var y2 = Math.sin(ang1 + ang2);
  return [{
    x: x1 - y1 * a,
    y: y1 + x1 * a
  }, {
    x: x2 + y2 * a,
    y: y2 - x2 * a
  }, {
    x: x2,
    y: y2
  }];
};

var vectorAngle = function vectorAngle(ux, uy, vx, vy) {
  var sign = ux * vy - uy * vx < 0 ? -1 : 1;
  var dot = ux * vx + uy * vy;

  if (dot > 1) {
    dot = 1;
  }

  if (dot < -1) {
    dot = -1;
  }

  return sign * Math.acos(dot);
};

var getArcCenter = function getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp) {
  var rxsq = Math.pow(rx, 2);
  var rysq = Math.pow(ry, 2);
  var pxpsq = Math.pow(pxp, 2);
  var pypsq = Math.pow(pyp, 2);
  var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;

  if (radicant < 0) {
    radicant = 0;
  }

  radicant /= rxsq * pypsq + rysq * pxpsq;
  radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
  var centerxp = radicant * rx / ry * pyp;
  var centeryp = radicant * -ry / rx * pxp;
  var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
  var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;
  var vx1 = (pxp - centerxp) / rx;
  var vy1 = (pyp - centeryp) / ry;
  var vx2 = (-pxp - centerxp) / rx;
  var vy2 = (-pyp - centeryp) / ry;
  var ang1 = vectorAngle(1, 0, vx1, vy1);
  var ang2 = vectorAngle(vx1, vy1, vx2, vy2);

  if (sweepFlag === 0 && ang2 > 0) {
    ang2 -= TAU;
  }

  if (sweepFlag === 1 && ang2 < 0) {
    ang2 += TAU;
  }

  return [centerx, centery, ang1, ang2];
};

var arcToBezier = function arcToBezier(_ref2) {
  var px = _ref2.px,
      py = _ref2.py,
      cx = _ref2.cx,
      cy = _ref2.cy,
      rx = _ref2.rx,
      ry = _ref2.ry,
      _ref2$xAxisRotation = _ref2.xAxisRotation,
      xAxisRotation = _ref2$xAxisRotation === undefined ? 0 : _ref2$xAxisRotation,
      _ref2$largeArcFlag = _ref2.largeArcFlag,
      largeArcFlag = _ref2$largeArcFlag === undefined ? 0 : _ref2$largeArcFlag,
      _ref2$sweepFlag = _ref2.sweepFlag,
      sweepFlag = _ref2$sweepFlag === undefined ? 0 : _ref2$sweepFlag;
  var curves = [];

  if (rx === 0 || ry === 0) {
    return [];
  }

  var sinphi = Math.sin(xAxisRotation * TAU / 360);
  var cosphi = Math.cos(xAxisRotation * TAU / 360);
  var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
  var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;

  if (pxp === 0 && pyp === 0) {
    return [];
  }

  rx = Math.abs(rx);
  ry = Math.abs(ry);
  var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  var _getArcCenter = getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp),
      _getArcCenter2 = _slicedToArray(_getArcCenter, 4),
      centerx = _getArcCenter2[0],
      centery = _getArcCenter2[1],
      ang1 = _getArcCenter2[2],
      ang2 = _getArcCenter2[3]; // If 'ang2' == 90.0000000001, then `ratio` will evaluate to
  // 1.0000000001. This causes `segments` to be greater than one, which is an
  // unecessary split, and adds extra points to the bezier curve. To alleviate
  // this issue, we round to 1.0 when the ratio is close to 1.0.


  var ratio = Math.abs(ang2) / (TAU / 4);

  if (Math.abs(1.0 - ratio) < 0.0000001) {
    ratio = 1.0;
  }

  var segments = Math.max(Math.ceil(ratio), 1);
  ang2 /= segments;

  for (var i = 0; i < segments; i++) {
    curves.push(approxUnitArc(ang1, ang2));
    ang1 += ang2;
  }

  return curves.map(function (curve) {
    var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery),
        x1 = _mapToEllipse.x,
        y1 = _mapToEllipse.y;

    var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery),
        x2 = _mapToEllipse2.x,
        y2 = _mapToEllipse2.y;

    var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery),
        x = _mapToEllipse3.x,
        y = _mapToEllipse3.y;

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      x: x,
      y: y
    };
  });
};

function normalize(path) {
  // init state
  var prev;
  var result = [];
  var bezierX = 0;
  var bezierY = 0;
  var startX = 0;
  var startY = 0;
  var quadX = null;
  var quadY = null;
  var x = 0;
  var y = 0;

  for (var i = 0, len = path.length; i < len; i++) {
    var seg = path[i];
    var command = seg[0];

    switch (command) {
      case 'M':
        startX = seg[1];
        startY = seg[2];
        break;

      case 'A':
        var curves = arcToBezier({
          px: x,
          py: y,
          cx: seg[6],
          cy: seg[7],
          rx: seg[1],
          ry: seg[2],
          xAxisRotation: seg[3],
          largeArcFlag: seg[4],
          sweepFlag: seg[5]
        }); // null-curves

        if (!curves.length) continue;

        for (var j = 0, c; j < curves.length; j++) {
          c = curves[j];
          seg = ['C', c.x1, c.y1, c.x2, c.y2, c.x, c.y];
          if (j < curves.length - 1) result.push(seg);
        }

        break;

      case 'S':
        // default control point
        var cx = x;
        var cy = y;

        if (prev == 'C' || prev == 'S') {
          cx += cx - bezierX; // reflect the previous command's control

          cy += cy - bezierY; // point relative to the current point
        }

        seg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]];
        break;

      case 'T':
        if (prev == 'Q' || prev == 'T') {
          quadX = x * 2 - quadX; // as with 'S' reflect previous control point

          quadY = y * 2 - quadY;
        } else {
          quadX = x;
          quadY = y;
        }

        seg = quadratic(x, y, quadX, quadY, seg[1], seg[2]);
        break;

      case 'Q':
        quadX = seg[1];
        quadY = seg[2];
        seg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4]);
        break;

      case 'L':
        seg = line(x, y, seg[1], seg[2]);
        break;

      case 'H':
        seg = line(x, y, seg[1], y);
        break;

      case 'V':
        seg = line(x, y, x, seg[1]);
        break;

      case 'Z':
        seg = line(x, y, startX, startY);
        break;
    } // update state


    prev = command;
    x = seg[seg.length - 2];
    y = seg[seg.length - 1];

    if (seg.length > 4) {
      bezierX = seg[seg.length - 4];
      bezierY = seg[seg.length - 3];
    } else {
      bezierX = x;
      bezierY = y;
    }

    result.push(seg);
  }

  return result;
}

function line(x1, y1, x2, y2) {
  return ['C', x1, y1, x2, y2, x2, y2];
}

function quadratic(x1, y1, cx, cy, x2, y2) {
  return ['C', x1 / 3 + 2 / 3 * cx, y1 / 3 + 2 / 3 * cy, x2 / 3 + 2 / 3 * cx, y2 / 3 + 2 / 3 * cy, x2, y2];
}

class Path extends Base {
    constructor(props) {
        super(props.nanoid);
        this.props = props;
        this.props.fillColor = this.props.fillColor || '#fff';
    }
    draw(ctx) {
        const { fillColor, d, translate = [0, 0], } = this.props;
        if (!isPath(d)) {
            throw new Error('Not an SVG path!');
        }
        const _initialPath = absSvgPath(parseSvgPath(d));
        const _path = normalize(_initialPath);
        ctx.save();
        ctx.beginPath();
        ctx.translate(translate[0], translate[1]);
        if (_path.length) {
            _path.forEach((c) => {
                const [cmd, ...args] = c;
                if (cmd === 'M') {
                    ctx.moveTo(...args);
                }
                else {
                    ctx.bezierCurveTo(...args);
                }
            });
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.restore();
        }
    }
    clone() {
        const [r, g, b, a] = idToRgba(this.id);
        return new Path(Object.assign(Object.assign({}, this.props), { fillColor: `rgba(${r}, ${g}, ${b}, ${a})` }));
    }
}

class Circle extends Base {
    constructor(props) {
        super(props.nanoid);
        this.props = props;
        this.props.fillColor = this.props.fillColor || '#fff';
        this.props.strokeColor = this.props.strokeColor || '#000';
        this.props.strokeWidth = this.props.strokeWidth || 1;
    }
    draw(ctx) {
        const { x, y, radius, fillColor, translate, } = this.props;
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
        return new Circle(Object.assign(Object.assign({}, this.props), { fillColor: `rgba(${r}, ${g}, ${b}, ${a})` }));
    }
}

exports.EventNames = void 0;
(function (EventNames) {
    EventNames["click"] = "click";
    EventNames["mousedown"] = "mousedown";
    EventNames["mousemove"] = "mousemove";
    EventNames["mouseup"] = "mouseup";
    EventNames["mouseenter"] = "mouseenter";
    EventNames["mouseleave"] = "mouseleave";
})(exports.EventNames || (exports.EventNames = {}));

const idPool = {};
/**
 * id转换成rgb色值
 * @param id
 */
function idToRgba(id) {
    return id.split('-');
}
/**
 * rgb色值转换成id
 * @param rgba
 */
function rgbaToId(rgba) {
    return rgba.join('-');
}
/**
 * 通过随机0 - 255 的色值转换成rgb做唯一色值生成
 */
function createOnceId() {
    return Array(3)
        .fill(0)
        .map(() => Math.ceil(Math.random() * 255))
        .concat(255)
        .join('-');
}
/**
 * 生成唯一id
 */
function createId() {
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
const guideRenderFunc = (type) => {
    const renderPath = (renderProp) => {
        const { d = '', translate, fill = '#F4F5F6', dpr = 1, nanoid = '' } = renderProp;
        return new Path({ fillColor: fill, d, translate, dpr, nanoid });
    };
    const renderPolygon = (renderProps) => {
        const { fill, translate, points = '', nanoid = '' } = renderProps;
        return new Polygon({
            fillColor: fill, points, translate, nanoid
        });
    };
    switch (type) {
        case 'path':
            return renderPath;
        case 'polygon':
            return renderPolygon;
        default:
            return null;
    }
};

var ActionType;
(function (ActionType) {
    ActionType["Down"] = "DOWN";
    ActionType["Up"] = "Up";
    ActionType["Move"] = "MOVE";
})(ActionType || (ActionType = {}));
class EventSimulator {
    constructor() {
        this.listenersMap = {};
    }
    addAction(action, evt) {
        const { type, id } = action;
        // mousemove
        if (type === ActionType.Move) {
            this.fire(id, exports.EventNames.mousemove, evt);
        }
        // mouseover
        // mouseenter
        if (type === ActionType.Move && (!this.lastMoveId || this.lastMoveId !== id)) {
            this.fire(id, exports.EventNames.mouseenter, evt);
            this.fire(this.lastMoveId, exports.EventNames.mouseleave, evt);
        }
        // mousedown
        if (type === ActionType.Down) {
            this.fire(id, exports.EventNames.mousedown, evt);
        }
        // mouseup
        if (type === ActionType.Up) {
            this.fire(id, exports.EventNames.mouseup, evt);
        }
        // click
        if (type === ActionType.Up && this.lastDownId === id) {
            this.fire(id, exports.EventNames.click, evt);
        }
        if (type === ActionType.Move) {
            this.lastMoveId = action.id;
        }
        else if (type === ActionType.Down) {
            this.lastDownId = action.id;
        }
    }
    addListeners(id, listeners) {
        this.listenersMap[id] = listeners;
    }
    fire(id, eventName, evt) {
        if (this.listenersMap[id] && this.listenersMap[id][eventName]) {
            this.listenersMap[id][eventName].forEach((listener) => listener(evt));
        }
    }
}

class Stage {
    constructor({ canvasRes, osCanvasRes, width, height, dpr = 2 }, callback) {
        this.width = width;
        this.height = height;
        this.canvas = canvasRes;
        this.offCanvas = osCanvasRes;
        this.renderChildren = [];
        // canvas 实例
        this.ctx = this.canvas.getContext('2d');
        this.offCtx = this.offCanvas.getContext('2d');
        // 获取屏幕像素
        this.dpr = dpr;
        // 新版本的2dCanvas需要通过设置原有的节点宽高，而非设置实例宽高 参考： https://blog.csdn.net/ITzhongzi/article/details/115612944
        // 通过 dpr 缩放
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.offCanvas.width = width * this.dpr;
        this.offCanvas.height = height * this.dpr;
        this.offCtx.scale(this.dpr, this.dpr);
        this.shapesSet = new Set();
        this.onChange = callback;
        this.shapesActionsList = [];
        this.setProxy();
        this.eventSimulator = new EventSimulator();
    }
    /**
     * 添加配置文件初始化舞台
     */
    init(config) {
        config.forEach(({ children, nature, nanoid = '' }) => {
            if (!children)
                return;
            children.forEach((el) => {
                const renderFunc = guideRenderFunc(el.type);
                if (!renderFunc) {
                    throw new Error(el.type ? `${el.type}该类型暂未支持。` : '请传入正确格式的svg解析配置');
                }
                const shape = renderFunc && renderFunc(Object.assign(Object.assign({}, el), { dpr: this.dpr, nanoid }));
                if (!shape)
                    return;
                nature && nature === 'interaction' && nanoid && shape.on(exports.EventNames.click, () => {
                    const res = Reflect.get(this.shapesActionsProxy, nanoid);
                    Reflect.set(this.shapesActionsProxy, nanoid, !res);
                    this.render();
                });
                this.add(shape);
            });
        });
    }
    /**
     * 通过添加到renderChildren中循环渲染
     * @param shape
     */
    add(shape) {
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
            if ((shape === null || shape === void 0 ? void 0 : shape.nanoid) && !Reflect.get(this.shapesActionsProxy, shape.nanoid)) {
                return;
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
        this.setProxy();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.offCtx.clearRect(0, 0, this.width, this.height);
        this.render();
    }
    /**
     * 通过检查点击的区域是否在离屏的canvas中有渲染相应的颜色区域检查是否点击到某个指定区域
     * @param x
     * @param y
     */
    hitJudge(x, y) {
        const rgba = Array.from(this.offCtx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data);
        const id = rgbaToId(rgba);
        return this.shapesSet.has(id) ? id : undefined;
    }
    /**
     * 绑定触摸事件
     * @param evt
     */
    touchStartHandler(evt) {
        const p1 = evt.touches[0];
        const { x, y } = p1;
        const id = this.hitJudge(x, y);
        this.eventSimulator.addAction({ type: ActionType.Down, id }, evt);
    }
    /**
     * 绑定触摸事件
     * @param evt
     */
    touchEndHandler(evt) {
        const p1 = evt.changedTouches[0];
        const { x, y } = p1;
        const id = this.hitJudge(x, y);
        this.eventSimulator.addAction({ type: ActionType.Up, id }, evt);
    }
    /**
     * 绑定点击事件
     * @param evt
     */
    clickHandle(evt, { x, y }) {
        const id = this.hitJudge(x, y);
        this.eventSimulator.addAction({ type: ActionType.Down, id }, evt);
        this.eventSimulator.addAction({ type: ActionType.Up, id }, evt);
    }
    setActions(_arr) {
        this.shapesActionsList = [..._arr];
        this.setProxy();
        this.render();
    }
    setProxy() {
        const defaultActionsObj = {};
        this.shapesActionsList.forEach(el => {
            Reflect.set(defaultActionsObj, el, true);
        });
        this.shapesActionsProxy = new Proxy(defaultActionsObj, {
            set: this.proxySetFn.bind(this)
        });
    }
    proxySetFn(target, key, value) {
        Reflect.set(target, key, value);
        //数据有变化 触发onChange
        this.onChange && this.onChange(key);
        return true;
    }
}

exports.Circle = Circle;
exports.Path = Path;
exports.Polygon = Polygon;
exports.Stage = Stage;
exports.createId = createId;
exports.createOnceId = createOnceId;
exports.guideRenderFunc = guideRenderFunc;
exports.idToRgba = idToRgba;
exports.rgbaToId = rgbaToId;
