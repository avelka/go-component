import { Component, h, Prop, Element } from '@stencil/core';
import Debounce from 'debounce-decorator';
import { minMax } from '../../utils/utils';

@Component({
  tag: 'gc-board',
  styleUrl: 'board.css',
  shadow: false
})
export class Board {
  @Element() el: HTMLElement;
  @Prop() options = {
    order: false,
    zoom: 100
  };

  @Prop() size: number = 19;
  @Prop() state: any[];
  target = null;

  width = 500;
  padding = 20;
  innerGridSize = this.width - this.padding;
  outerPath = `M 0, 0 H ${this.width} V ${this.width} H 0 V 0`;
  innerPath = `M ${this.padding}, ${this.padding} H ${this.innerGridSize} V ${this.innerGridSize} H ${this.padding} V ${this.padding}`;
  getLineSpace = (w:number, s:number, p:number) => (w - 2 * p) / (s - 1);
  lineSpace = this.getLineSpace(this.width, this.size, this.padding)
  lines =  this.getLines();
  coordMarkers = this.getCoordMarkers();

  @Debounce(100)
  handleOver(e: MouseEvent) {
    this.target = this.getPosFromCoord(e.x, e.y);
    const targetEl = this.el.querySelector('.target');
    const ox = targetEl.getAttribute("x");
    const nx = this.getPos(this.target.x).toString();
    const oy = targetEl.getAttribute("y");
    const ny = this.getPos(this.target.y).toString();
    const updateEl = (el, o, n) => {
      el.setAttribute("x", n.x);
      el.setAttribute("y", n.y);
      el
      .animate([{
        x: o.x,
        y: o.y
      }, {
        x: n.x,
        y: n.y
      }], {
          duration: 200,
          iterations: 1,
          fill: "forwards"
        });
      }
    if (ox != nx || oy != ny ) {
      updateEl(targetEl, {x: ox, y: oy},  {x: nx, y: ny});
    }

  }

  handleLeave() {
    this.target = null;
  }

  getPosFromCoord(x:number, y:number) {
    const { width, top, left } = this.el.querySelector(".board").getClientRects()[0];
    const relSize = (v:number) => (this.width / width) * v;
    const pos = (n:number) => Math.ceil((relSize(n) - this.padding - (this.lineSpace / 2)) / this.lineSpace);

    return {x: pos(x + -(left)), y:pos(y + -(top))};
  }

  render() {
    const stones: any[] = (this.state || [])
    .map(({order, state, x, y}) => ({
      order: order + 1,
      color: state,
      xt: this.getPos(x) + (this.lineSpace / 2),
      yt: this.getPos(y) + (this.lineSpace / 2),
      x: this.getPos(x),
      y: this.getPos(y)
    }));

    const target = this.target ? {
      x: this.getPos(this.target.x),
      y: this.getPos(this.target.y),
    } : {x: 0, y: 0};

    const zoomFactor = this.options.zoom / 100;
    const getCenter = () => (this.width - (this.width * zoomFactor)) / 2;
    const vb = {
      x: zoomFactor != 1 ? getCenter() : 0,
      y: zoomFactor != 1 ? getCenter() : 0,
    }
    const max = this.width - this.width * zoomFactor;
    const cvb = zoomFactor != 1 && target ? {
      x: minMax(0, target.x - this.width / 2, max),
      y: minMax(0, target.y - this.width / 2, max)
    } : vb;

    return (
      <svg
      class="svgboard"
      tabIndex={0}
      width="500"
      height="500"
      onMouseLeave={() => this.handleLeave()}
      onMouseMove={e => this.handleOver(e)}
      viewBox={`${cvb.x} ${cvb.x} ${500 * zoomFactor} ${500 * zoomFactor}`}>
        <defs>
          <filter id="MyFilter" filterUnits="objectBoundingBox"
              x="0" y="0"
              width="100%" height="100%">

              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
              <feOffset in="blur" dx="1" dy="2" result="offsetBlur"/>

              <feSpecularLighting in="blur" surfaceScale="3" specularConstant=".3"
                                  specularExponent="20" lighting-color="#666666"
                                  result="specOut">
                <fePointLight x="-50000" y="-100000" z="200000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                          k1="0" k2="1" k3="1" k4="0" result="litPaint"/>

              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="litPaint"/>
              </feMerge>
            </filter>
            <radialGradient id="stone_grad_black" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
              <stop offset="0%" stop-color="#aaa"/>
              <stop offset="100%" stop-color="rgb(25, 25, 40)"/>
            </radialGradient>
            <radialGradient id="stone_grad_white" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#aaaaaa"/>
            </radialGradient>
          </defs>
          <symbol id="target" width={this.lineSpace} height={this.lineSpace} viewBox="0 0 2 2">
          <circle cx="1" cy="1" r="0.5" fill="rgba(0,0,0,.3)"/>
      </symbol>
        {this.renderStoneSymbol("black")}
        {this.renderStoneSymbol("white")}

        <path class="board" d={this.outerPath}></path>
        <g class="lines">
            <path  d={this.innerPath}></path>
            {this.lines.map(d => <path d={d}></path>)}
          </g>
        <g class="coords">{this.coordMarkers.map(({m, x, y}) => <text x={x} y={y}>{m}</text>)}</g>
        <g class="stones" filter="url(#MyFilter)">
          <path fill="transparent" d={this.outerPath}></path>
          {stones.map(({color, x, y, xt, yt, order}) => <g class={color}>
              <use xlinkHref={`#stone_${color}`} x={x}  y={y}/>
              {this.options.order && <text x={xt} y={yt}>{order}</text>}
            </g>)}
        </g>
        <use class="target" xlinkHref="#target" x={target.x} y={target.y}/>
      </svg>
    );
  }

  getPos = (n: number) => {
    return Math.round(this.padding + (n * this.lineSpace) - (this.lineSpace / 2));
  }

  getLines() {
    const hlines = Array(this.size - 2).fill("").map((_, i) => {
      const startY = (i + 1) * this.lineSpace + this.padding;
      return `M ${this.padding}, ${startY} H ${this.innerGridSize}`
    });
    const vlines = Array(this.size - 2).fill("").map((_, i) => {
      const startX = (i + 1) * this.lineSpace + this.padding;
      return `M ${startX}, ${this.padding} V ${this.innerGridSize}`
    });
    return [...vlines, ...hlines];
  }

  getCoordMarkers() {
    const isz = Array(this.size).fill("").map((_, i) => i);
    const x = isz.map(i => ({x: (i * this.lineSpace) + this.padding, y: this.padding / 2, m: i + 1}))
    const y = isz.map(i => ({y: (i * this.lineSpace) + this.padding, x: this.padding / 2, m: i + 1}))
    return [...x, ...y];
  };

  renderStoneSymbol(color: string) {
    const size = this.lineSpace;
    return (
      <symbol id={`stone_${color}`} width={size} height={size} viewBox="0 0 2 2">
        <circle class={`stone ${color}`} cx="1" cy="1" r="0.9" fill={`url(#stone_grad_${color})`}/>
      </symbol>
    );
  }


}
