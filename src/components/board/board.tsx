import { Component, h, Prop, Element, Event, EventEmitter, State, Watch } from '@stencil/core';

import { minMax, animateCirclePosition, BLACK, WHITE, n2a, getHoshi } from '../../utils/utils';

@Component({
  tag: 'gc-board',
  styleUrl: 'board.css',
  shadow: false
})
export class Board {
  @Element() el: HTMLElement;
  @Prop() options = {
    order: false,
    zoom: 100,
    style: {
      texture: false
    }
  };

  @Prop() size: number = 19;
  @Prop() state: any[] = [];
  @Prop() overlay: any[] = [];
  @Prop() ghosts: any[] = [];

  @Event() moveAttempt:  EventEmitter;

  target = null;

  width = 700;
  padding = 40;
  innerGridSize = this.width - this.padding;
  outerPath = `M 0, 0 H ${this.width} V ${this.width} H 0 V 0`;
  innerPath = `M ${this.padding}, ${this.padding} H ${this.innerGridSize} V ${this.innerGridSize} H ${this.padding} V ${this.padding}`;
  getLineSpace = (w:number, s:number, p:number) => (w - 2 * p) / (s - 1);

  @State() lineSpace = this.getLineSpace(this.width, this.size, this.padding)
  @State() lines = this.getLines();
  @State() coordMarkers = this.getCoordMarkers();
  @Watch('size')
  onSizeChange(newSize: number) {
    console.log({newSize});
    this.lineSpace = this.getLineSpace(this.width, this.size, this.padding)
    this.lines = this.getLines();
    this.coordMarkers = this.getCoordMarkers();

  }

  handleOver(e: MouseEvent) {
    this.target = this.getPosFromCoord(e.x, e.y);
    const pointer = this.el.querySelector('.target');
    const ox = pointer.getAttribute("x");
    const oy = pointer.getAttribute("y");
    const nx = this.getPos(this.target.x).toString();
    const ny = this.getPos(this.target.y).toString();

    if (ox != nx || oy != ny ) {
      animateCirclePosition(pointer, {x: ox, y: oy},  {x: nx, y: ny});
    }
  }

  handleLeave() {
    this.target = null;
  }

  sendMove() {

    this.moveAttempt.emit(this.target);
  }

  getPosFromCoord(x:number, y:number) {
    const { width, top, left } = this.el.querySelector(".woodboard").getClientRects()[0];
    const relSize = (v:number) => (this.width / width) * v;
    const pos = (n:number) => Math.ceil((relSize(n) - this.padding - (this.lineSpace / 2)) / this.lineSpace);
    return {x: pos(x + -(left)), y:pos(y + -(top))};
  }

  render() {
    const stones: any[] = (this.state || [])
    .map(({order, state, x, y}, i) => ({
      order: order + 1,
      index: i,
      color: state,
      xt: this.getPos(x) + (this.lineSpace / 2),
      yt: this.getPos(y) + (this.lineSpace / 2),
      x: this.getPos(x),
      y: this.getPos(y),
    }));

    const last = [...stones].sort((a, b) => b.order - a.order)[0];
    const ghosts = this.ghosts.map(({state, x, y, inPath}, i) => {
      return ({
        color: state,
        order: n2a(i),
        inPath,
        xt: this.getPos(x) + (this.lineSpace / 2),
        yt: this.getPos(y) + (this.lineSpace / 2),
        x: this.getPos(x),
        y: this.getPos(y),
      });
    });

    const markers: any[] = (this.overlay || [])
      .map(({x, y, ...marker}) => ({
        ...marker,
        xt: this.getPos(x) + (this.lineSpace / 2),
        yt: this.getPos(y) + (this.lineSpace / 2),
        x: this.getPos(x),
        y: this.getPos(y)
      }));

    const target = this.target ? {
      x: this.getPos(this.target.x),
      y: this.getPos(this.target.y),
    } : {x: 0, y: 0};

    const zoomFactor = 100 / this.options.zoom;
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

    const hoshis = getHoshi(this.size).map(({x, y}) =>  ({
      x: this.getPos(x),
      y: this.getPos(y)
    }));
    const linesPath = [this.innerPath, ...this.lines].join(' ');
    return (
      <svg
      class="svgboard"
      onMouseLeave={() => this.handleLeave()}
      onMouseMove={e => this.handleOver(e)}
      viewBox={`${cvb.x} ${cvb.x} ${this.width * zoomFactor} ${this.width * zoomFactor}`}>
        <defs>
          <filter id="wood_texture" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="5" seed="1" stitchTiles="stitch" result="turbulence"/>
            <feDiffuseLighting surfaceScale="1" diffuseConstant="4" lighting-color="rgb(223, 178, 96)" in="turbulence" result="diffuseLighting">
                  <feDistantLight azimuth="100" elevation="17"/>
              </feDiffuseLighting>
            <feComposite in="diffuseLighting" in2="SourceAlpha" operator="in" result="composite"/>
            <feMorphology operator="erode" radius="1 15" x="0%" y="0%" width="100%" height="100%" in="composite" result="morphology"/>
            </filter>
            <filter id="MyFilter"
              filterUnits="objectBoundingBox"
              x="0" y="0"
              width="100%" height="100%">

              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="2"
                result="blur"/>
              <feOffset
                in="blur"
                dx="1"
                dy="2"
                result="offsetBlur"/>

              <feSpecularLighting
                in="blur"
                surfaceScale="3"
                specularConstant=".3"
                specularExponent="20"
                lighting-color="#666666"
                result="specOut">
                <fePointLight
                  x="-50000"
                  y="-100000"
                  z="200000"/>
              </feSpecularLighting>
              <feComposite
                in="specOut"
                in2="SourceAlpha"
                operator="in"
                result="specOut"/>
              <feComposite
                in="SourceGraphic"
                in2="specOut"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="litPaint"/>

              <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="litPaint"/>
              </feMerge>
            </filter>
            <radialGradient
              id="stone_grad_black"
              cx="0.5"
              cy="0.5"
              r="0.5"
              fx="0.25"
              fy="0.25">
                <stop
                  offset="0%"
                  stop-color="#aaa"/>
                <stop
                  offset="100%"
                  stop-color="rgb(25, 25, 40)"/>
            </radialGradient>
            <radialGradient
              id="stone_grad_white"
              cx="0.5"
              cy="0.5"
              r="0.5"
              fx="0.25"
              fy="0.25">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#aaaaaa"/>
            </radialGradient>
          </defs>
        <symbol
          id="target"
          width={this.lineSpace}
          height={this.lineSpace}
          viewBox="0 0 2 2">
        <circle cx="1" cy="1" r="0.5" fill="rgba(0,0,0,.3)"/>
        </symbol>
        <symbol
          id="hoshi"
          width={this.lineSpace}
          height={this.lineSpace}
          viewBox="0 0 2 2">
        <circle cx="1" cy="1" r="0.1" fill="rgba(0,0,0,.8)"/>
        </symbol>
        <symbol
          id="last"
          width={this.lineSpace}
          height={this.lineSpace}
          viewBox="0 0 2 2">
          <circle cx="1" cy="1" r="0.4" fill="rgba(250,150,150,.8)"/>
        </symbol>
        {this.renderStoneSymbol(this.lineSpace, BLACK)}
        {this.renderStoneSymbol(this.lineSpace, WHITE)}
        {markers.length && this.renderMarkersSymbol(this.lineSpace) }
        <path class="woodboard" data-textured={this.options.style?.texture} d={this.outerPath}></path>
        <path class="lines" d={linesPath}></path>
        {hoshis.map(({x, y}) => <use xlinkHref="#hoshi" x={x} y={y}/>)}
        <g class="coords">{this.coordMarkers.map(({m, x, y}) => <text x={x} y={y}>{m}</text>)}</g>
        <g class="stones" filter="url(#MyFilter)">
          <path fill="transparent" d={this.outerPath}></path>
          {stones.map((s) => this.renderStone(s))}
        </g>

        {ghosts.map((g, _, a) => this.renderGhost(g, a.length > 1))}
        {last && <use xlinkHref="#last" x={last.x} y={last.y}/>}
        <g class="markers">
          <path fill="transparent" d={this.outerPath}></path>
          {markers.map(({state, label, boardState, x, y, xt, yt}) => <g>
              {state && <use xlinkHref={`#marker_${state}_on${boardState}`} x={x}  y={y}/>}
              {label && boardState === 'empty' && <use xlinkHref={`#marker_label_on${boardState}`} x={x}  y={y}/>}
              {label && <text class={`on${boardState}`} x={xt} y={yt}>{label}</text>}
            </g>)}
        </g>
        <use onClick={() => this.sendMove()} class="target" xlinkHref="#target" x={target.x} y={target.y}/>
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
    const x = isz.map(i => ({
      x: (i * this.lineSpace) + this.padding,
      y: this.padding / 2,
      m: (i < 8 ? n2a(i) : n2a(i+1)).toUpperCase()
    }));
    const x2 = x.map(e => ({...e, y: this.width - this.padding / 2 }));
    const y = isz.map(i => ({
      y: (i * this.lineSpace) + this.padding,
      x: this.padding / 2,
      m: this.size - i
    }));
    const y2 = y.map(e => ({...e, x: this.width - (this.padding / 2) }));
    return [].concat(x, x2, y ,y2);
  };

  renderStoneSymbol(size: number, color: string) {
    return (
      <symbol id={`stone_${color}`} width={size} height={size} viewBox="0 0 2 2">
        <circle class={`stone ${color}`} cx="1" cy="1" r="0.9" fill={`url(#stone_grad_${color})`}/>
      </symbol>
    );
  }
  renderMarkersSymbol(size: number) {
    return (
      <g>
        <symbol id={`marker_circle_onempty`} width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" fill="none" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_triangle_onempty`} width={size} height={size} viewBox="0 0 20 20">
          <polygon points="10,5 5,15 15,15" fill="transparent" strokeWidth="2" stroke="#000" opacity="0.7" />
        </symbol>
        <symbol id={`marker_square_onempty`} width={size} height={size} viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" fill="transparent" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_mark_onempty`} width={size} height={size} viewBox="0 0 20 20">
          <path d="M 5 5 L 15 15 M 5 15 L 15 5" fill="transparent" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>

        <symbol id={`marker_circle_onblack`} width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" fill="none" strokeWidth="1" stroke="#fff" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_triangle_onblack`} width={size} height={size} viewBox="0 0 20 20">
          <polygon points="10,5 5,15 15,15" fill="transparent" strokeWidth="2" stroke="#fff" opacity="0.7" />
        </symbol>
        <symbol id={`marker_square_onblack`} width={size} height={size} viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" fill="transparent" strokeWidth="1" stroke="#fff" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_mark_onblack`} width={size} height={size} viewBox="0 0 20 20">
          <path d="M 5 5 L 15 15 M 5 15 L 15 5" fill="transparent" strokeWidth="1" stroke="#fff" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_circle_onwhite`} width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" fill="none" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_triangle_onwhite`} width={size} height={size} viewBox="0 0 20 20">
          <polygon points="10,5 5,15 15,15" fill="transparent" strokeWidth="2" stroke="#000" opacity="0.7" />
        </symbol>
        <symbol id={`marker_square_onwhite`} width={size} height={size} viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" fill="transparent" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_mark_onwhite`} width={size} height={size} viewBox="0 0 20 20">
          <path d="M 5 5 L 15 15 M 5 15 L 15 5" fill="transparent" strokeWidth="1" stroke="#000" opacity="0.7"/>
        </symbol>
        <symbol id={`marker_label_onempty`} width={size} height={size} viewBox="0 0 20 20">
          <circle class="woodElement" cx="10" cy="10" r="6"/>
        </symbol>
    </g>
    );
  }
  renderStone({color, x, y, xt, yt, order}) {
    const displayOrder = Math.max(0, order);
    return <g class={color}>
      <use xlinkHref={`#stone_${color}`} x={x}  y={y}/>
      {this.options.order && displayOrder && <text x={xt} y={yt}>{displayOrder}</text>}
    </g>
  }

  renderGhost({color, order, x, y, xt, yt, inPath}, showLetter) {
    return <g class={color}>
      <use xlinkHref={`#stone_${color}`} x={x}  y={y} opacity={inPath ? "0.7" : "0.4"}/>
      {showLetter && <text x={xt} y={yt}>{order.toUpperCase()}</text>}
    </g>
  }
}
