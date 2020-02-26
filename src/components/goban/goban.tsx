import { Component, Prop, State, h, Listen } from '@stencil/core';
import sgfgrove from 'sgfgrove';
import { minMax, getCurrentPath, toTree, getBoardState, getScore, baseVariation } from '../../utils/utils';
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
  @State() variations: any = null;
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
  @State() currentPath = getCurrentPath(this.party.tree, this.variations)
  @State() board = this.getGameState();
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
      case 'ArrowDown':
      case 'ArrowUp':
        const inc: number = ev.key == 'ArrowUp' ? -1 : 1;
        this.changeNextFork(inc);

        break;
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
    const meta = {
      ...this.party.meta,
      ...this.party.info,
      players: this.party.players,
    };
    const score = getScore(this.board.history);
    return (
      <div class="goban">
        <gc-board
          class="goboard"
          options={this.options}
          size={this.party.info.size}
          state={getBoardState(this.board)}>
        </gc-board>
        <div class="controls">
          <gc-controls
            data={meta}
            score={score}
            options={this.options}
            variations={this.variations}
            position={this.currentPosition}>
          </gc-controls>
          <gc-comments
            class="comments"
            position={this.currentPosition}
            path={this.currentPath}>
          </gc-comments>
          { this.options.tree &&
          <gc-tree class="tree"
            variations={this.variations}
            tree={this.party.tree}
            current={this.currentPath}
            position={this.currentPosition}>
          </gc-tree> }
        </div>
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

  updatePosition({order, variation = null}) {

    if (variation) {
      this.variations = variation.source ? variation : null;
    }
    this.currentPath = getCurrentPath(this.party.tree, this.variations);
    this.currentPosition = minMax(0, order, this.currentPath.length);
    this.board = this.getGameState();
  }

  parse(sgf: any) {
    const parsed = sgfgrove.parse(sgf)
    const [[[meta, ...game], branchs]] = parsed;
    const { PB, PW, BR, WR, SZ, KM, RU, GN, CP, US, AN, TM, OT, RE, DT, ...rest } = meta;

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
        tree: toTree([game, branchs])
    };
  }

  getGameState() {
    return this.currentPath
      .slice(0, this.currentPosition + 1)
      .reduce((a: any, { x, y }) => a.play(x, y),
      this.bs.init(this.party.info.size)
    );
  }
  changeNextFork(inc:number) {

    const forks = this.currentPath.filter(el => el.variations && el.variations.length);
    const nextFork = forks.find(el => el.order >= this.currentPosition);
    const current = this.variations
      ? {...this.variations}
      : baseVariation(forks);

    const newVariation = {
      ...current,
      branch: minMax(1, current.branch + inc, nextFork.variations.length) };
    this.variations = newVariation;
    this.currentPath = getCurrentPath(this.party.tree, this.variations)
  }
}
