import { Component, Prop, State, h, Listen } from '@stencil/core';
import sgfgrove from 'sgfgrove';
import { fromSGFCoord, minMax } from '../../utils/utils';
import { BoardService } from 'kifu';

import {MODE} from "../../utils/utils";

@Component({
  tag: 'gc-goban',
  styleUrl: 'goban.css',
  shadow: true
})
export class Goban {
  bs = new BoardService();

  @Prop() sgf = null;
  @Prop() currentPosition: number = 0;
  @Prop() variations: any = [];
  @Prop() options: any = {
    play: false,
    showOrder: false,
    edit: false,
    nav: true,
    tree: false,
    interval: 5,
    mode: MODE.READ,
    zoom: 100
  };
  party = this.parse(this.sgf);

  @State() board = this.getPartyBoard();
  timer: number;

  @Listen('selectPosition')
  handlePosition(event: CustomEvent) {
   this.updatePosition(event.detail);
  }

  @Listen('optionChange')
  handleOptionChange(event: CustomEvent) {
    this.updateOptions(event.detail);
  }

  updateOptions(change) {
    const newOptions = {
      ...this.options,
      ...change
    };
    this.options = newOptions;
  }

  @Listen('keydown', { target: 'parent' })
  handleKeyDown(ev: KeyboardEvent){
    switch(ev.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        const dir: number = ev.key == 'ArrowLeft' ? -1 : 1;
        const speed:number = ev.shiftKey ? 10 : 1;
        this.updatePosition({order: this.currentPosition + dir * speed });
        break;
      case 'n':
      case 'N':
        this.updateOptions({order: !this.options.order});
        break;
      case 't':
      case 'T':
        console.log(this.party.tree);
        this.updateOptions({tree: !this.options.tree});
        break;
      case ' ':
        this.updateOptions({play: !this.options.play});
        break;
      case '+':
        this.updateOptions({zoom: minMax(10, this.options.zoom + 1, 200)});
        break;
      case '-':
        this.updateOptions({zoom: minMax(10, this.options.zoom - 1, 200)});
        break;
      case '=':
        this.updateOptions({zoom: 100});
        break;
    }
  }

  @Listen('wheel', { target: 'parent' })
  handleScroll(ev: WheelEvent) {
    if (ev.ctrlKey) {
      this.updateOptions({zoom: minMax(10, this.options.zoom -(Math.sign(ev.deltaY)), 200)});
    }
  }

  componentDidUpdate() {
    this.handleAutoPlay(this.options);
  }

  render() {
    const controlsMeta = {
      ...this.party.meta,
      ...this.party.info,
      players: this.party.players
    }

    const state = this.board.board.reduce((a: any[], c: any[]) => [...a, ...c], [])
    .filter((i: any) => i.state);

    return (
      <div class="goban">
        <gc-board
          class="goboard"
          options={this.options}
          size={this.party.info.size}
          state={state}></gc-board>
        <gc-controls
        class="controls"
        data={controlsMeta}
        options={this.options}
        variations={this.variations}
        position={this.currentPosition}></gc-controls>
        { this.options.tree ? <gc-tree class="tree"
          tree={this.party.tree}
          variations={this.variations}
          position={this.currentPosition}>
        </gc-tree> :<span></span>}
      </div>
    );
  }

  autoPlay(interval: number) {
    return window.setInterval(() => {
      if (MODE.READ) { this.updatePosition({order: this.currentPosition + 1}) };
    }, interval * 1000)
  }

  clearAutoPlay() {
    window.clearInterval(this.timer);
    this.timer = null;
  }

  componentDidUnload() {
    this.clearAutoPlay()
  }

  handleAutoPlay({interval, play}) {
    if (play && !this.timer) {
      this.timer = this.autoPlay(interval);
    } else if (this.timer && !play){
      this.clearAutoPlay();
    }
  }

  updatePosition({order, variation = { source: null, pos: null, branch: null, path: []}}) {

    const { source, ...vari } = variation;
    this.currentPosition = minMax(0, order, this.party.tree.length - 1);

      const newVariation = new Map(this.variations);
      if (source) {
        newVariation.set(source, vari);
        this.variations = newVariation;
      }



    this.board = this.getPartyBoard();
  }

  parse(sgf: any) {
    const parsed = sgfgrove.parse(sgf)
    const [[[meta, ...game], branchs]] = parsed;
    const { PB, PW, BR, WR, SZ, KM, RU, GN, CP, US, AN, TM, OT, RE, DT,  ...rest } = meta;
    const toMove = (m: any, i: number) => ({
      order: i,
      comment: m.C,
      state: m.B ? 'BLACK' : 'WHITE',
      ...fromSGFCoord(m)
    });
    function toTree(collection: any[], o: number = 0) {

      const [main, variations = []] = collection;
      const moves = main.map((m:any, i:number) => toMove(m, i + o));

      if (variations && variations.length) {
        moves[moves.length - 1].variations = variations.map((v: any[]) => toTree(v, main.length + o));
      }
      return moves;
    }

    const flatten = (acc: any[], c:any) => {
      if (c.variations && c.variations.length) {
        const [main, ...variations ] = c.variations;
        return [...acc, {...c, variations: variations.reduce(flatten, [])}, ...main.reduce(flatten, [])];
      }
      return [...acc, c];
    };

    return {
        players: [
            { color: 'BLACK', name: PB, level: BR },
            { color: 'WHITE', name: PW, level: WR },
        ],
        info: {
            size: SZ,
            komi: KM,
            rule: RU,
            time: TM,
            overtime: OT
        },
        meta: {
            name: GN,
            copyright: CP,
            scribe: US,
            commentator: AN,
            result: RE,
            date: DT
        },
        rest,
        tree: toTree([game, branchs]).reduce(flatten, [])
    };
  }

  getPartyBoard() {
    const chosenVariation = this.party.tree;
    console.log(this.variations)
    return chosenVariation.slice(0, this.currentPosition + 1).reduce(
      (a: any, { x, y }) => a.play(x, y),
      this.bs.init(this.party.info.size)
    );
  }

}
