import { Component, Prop, State, h, Listen } from '@stencil/core';
import { minMax, getCurrentPath, getScore, parse, compareBranch, getBoardState, dowloadAsSGF, getGhosts, toMove, isSamePosition, toSGFObject, nextPlayer } from '../../utils/utils';
import { BoardService, RuleService } from 'kifu';

import { MODE } from "../../utils/utils";

@Component({
  tag: 'gc-goban',
  styleUrl: 'goban.css',
  shadow: true
})
export class Goban {
  bs = new BoardService();
  rule = new RuleService();
  @Prop() sgf = null;
  @Prop() currentPosition: number = 0;
  @State() variations: any = [0];
  @Prop() options: any = {
    play: false,
    showOrder: false,
    edit: false,
    nav: true,
    tree: true,
    interval: 5,
    mode: MODE.READ,
    zoom: 100
  };

  party = parse(this.sgf);
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

  @Listen('moveAttempt')
  handleMove(event: CustomEvent) {
    const move = {
      x: minMax(0, event.detail.x, this.party.info.size - 1),
      y: minMax(0, event.detail.y, this.party.info.size - 1),
      state: nextPlayer(this.currentPosition)
    }
    try {
      this.rule.validate(this.board.board, move);
      this.updateTree(move);
    } catch (e) {
      console.error(e)
    }
  }

  updateTree(move: any) {
   const {nextPositions: nexts, source: { treeRef }} = this.currentPath[this.currentPosition];

   const exist = nexts.find(e => isSamePosition(toMove(e, 0), move));

   const node = [[toSGFObject(move)], []];
   if (nexts.length && !exist) {
    treeRef[1] = [...treeRef[1], node];
   } else {
    treeRef[0] = [...treeRef[0], toSGFObject(move)];
   }
  }

  updateOptions(change: any) {
    const newOptions = {
      ...this.options,
      ...change
    };
    this.options = newOptions;
  }

  @Listen('download')
  dowloadGame() {
    dowloadAsSGF(this.party);
  }

  @Listen('keydown', { target: 'parent' })
  handleKeyDown(ev: KeyboardEvent){
    switch(ev.key) {
      case 'd':
        console.log('[DEBUG]', this.party.tree, this.currentPath, this.board.history);
        break;
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
    const overlay = getBoardState(this.board.overlay).map(o => {
      return {
        ...o,
        boardState: this.bs.at(o.x, o.y).state || 'empty'
      }
    });
    const score = getScore(this.board.history);

    return (
      <div class="goban">
        <gc-board
          class="goboard"
          options={this.options}
          size={this.party.info.size}
          state={getBoardState(this.board.board)}
          overlay={overlay}
          ghosts={getGhosts(this.currentPath, this.currentPosition)}>
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

  updatePosition({order, variation = []}) {
    if (variation.length && !compareBranch(this.variations, variation)) {
      this.variations = variation;
    }

    this.currentPath = getCurrentPath(this.party.tree, this.variations);
    this.currentPosition = minMax(0, order, this.currentPath.length - 1);
    this.board = this.getGameState();
  }

  getGameState() {
    const val = this.currentPath
      .slice(0, this.currentPosition + 1)
      .reduce(
        (a: any, m:any) => a.set(m),
        this.bs.init(this.party.info.size)
      );
    return val;
  }

  changeNextFork(inc:number) {
    const current = this.currentPath[this.currentPosition].source;
    const {source: nextFork} = this.currentPath.find(p => p.source.level == current.level + 1) || {};

    if (nextFork) {
      const currentFork = this.variations[nextFork.level - 1];
      const choices = current.variations - 1;
      const val = ((currentFork || nextFork.level) + inc);
      const branch = minMax(0, val, choices);
      const newVariation = [
        ...this.variations.slice(0, nextFork.level - 1),
        branch
      ];

      this.variations = newVariation;
      this.currentPath = getCurrentPath(this.party.tree, this.variations)
    }
  }
}
