import { Component, Prop, State, h, Listen, Element } from '@stencil/core';
import { minMax, getCurrentPath, getScore, parse, compareBranch, getBoardState, dowloadAsSGF, getGhosts, toSGFObject, nextPlayer, isSamePosition, n2a, MODE, ATTR_SGF, alphabetLabelGenerator, numericLabelGenerator, conditionalStyles, showMenu } from '../../utils/utils';
import { BoardService, RuleService } from 'kifu';

const STONE_COMPOSED_UNIQUE = [ATTR_SGF.ADD_EMPTY, ATTR_SGF.ADD_BLACK, ATTR_SGF.ADD_WHITE];
const SYMBOL_COMPOSED_UNIQUE = [ATTR_SGF.CIRCLE, ATTR_SGF.SQUARE, ATTR_SGF.TRIANGLE, ATTR_SGF.MARK];

import keyboard from '../../assets/keybpoard.svg';

@Component({
  tag: 'gc-goban',
  styleUrl: 'goban.css',
  shadow: true
})
export class Goban {
  bs = new BoardService();
  rule = new RuleService();
  @Element() el: HTMLElement;
  @Prop() sgf = null;
  @Prop() currentPosition: number = 0;
  @State() variations: any = [0];
  @Prop() options: any = {
    play: false,
    showOrder: false,
    interval: 1,
    mode: MODE.READ,
    zoom: 100,
    comments: false,
    controls: false,
    tree: false,
    style: {
      texture: false,
    }
  };

  party = parse(this.sgf);
  @State() currentPath = getCurrentPath(this.party.tree, this.variations)
  @State() board = this.getGameState();
  timer: number;
  @State() displayControls = false;

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

    try {
      const move = {
        x: minMax(0, event.detail.x, this.party.info.size - 1),
        y: minMax(0, event.detail.y, this.party.info.size - 1),
        state: nextPlayer(this.currentPosition)
      }

      switch (this.options.mode) {
        case MODE.EDIT:
          this.editCurrent(move);
          break;
        case MODE.PLAY:
        case MODE.READ:
          this.rule.validate(this.board.board, move);
          this.updateTree(move);
          break;
      }

    } catch (e) {
      console.error(e)
    }
  }

  updateTree(move: any) {
    const ghosts = getGhosts(this.currentPath, this.currentPosition)
    const isNext = ghosts.findIndex(g => isSamePosition(g, move))
    const { branchIndex, source: { treeRef, level }} = this.currentPath[this.currentPosition];
    const isLastInbranch = branchIndex === (treeRef[0].length - 1);

    if (isNext < 0) {
      const node = [[toSGFObject(move)], []];
      if (isLastInbranch && !treeRef[1].length) {
        treeRef[0] = [...treeRef[0], toSGFObject(move)];
      } else {
        const start = treeRef[0].slice(0, branchIndex + 1);
        const end = treeRef[0].slice(branchIndex + 1);
        treeRef[0] = start;
        treeRef[1] = [[end, [...treeRef[1]]], node];
      }
    }

    const newVariation = [...this.variations.slice(0, level), isNext < 0 ? treeRef[1].length - 1 : isNext]
    this.updatePosition({order: this.currentPosition + 1, variation: newVariation})
  }

  editCurrent({x, y}: any) {
    const { branchIndex, source: { treeRef }} = this.currentPath[this.currentPosition];
    const current = treeRef[0][branchIndex];
    const type = this.options.marker;
    const coord = n2a(x) + n2a(y);
    // AE : empty should be filtered out on board (but only ghosted in edit mode)
    let change: any;
    switch (true) {
      case STONE_COMPOSED_UNIQUE.includes(type):
        change = this.setStone({current, type, coord})
        break;
      case type === ATTR_SGF.LABEL_ALPHA:
        change = this.setLabel({type: ATTR_SGF.LABEL, current, coord, generator: alphabetLabelGenerator });
        break;
      case type === ATTR_SGF.LABEL_NUMERIC:
        change = this.setLabel({type: ATTR_SGF.LABEL, current, coord, generator: numericLabelGenerator });
        console.log(change);
        break;
      case SYMBOL_COMPOSED_UNIQUE.includes(type):
        change = this.setMarker({current, type, coord});
      default:
        console.log({STONE_COMPOSED_UNIQUE, type})

    }

    treeRef[0][branchIndex] = {...current, ...change}
    this.updatePosition({order: this.currentPosition});
  }

  setMarker({type, current, coord}) {
    const labels = (current[type] || []);
    const different = i => i !== coord;
    const filteredLabels = labels.filter(different);
    if (filteredLabels.length < labels.length) {
      return {[type]: filteredLabels};
    }
    const unify = (changes, type) => ({...changes, [type]: (current[type] || []).filter(different) });
    const unified = SYMBOL_COMPOSED_UNIQUE.reduce(unify ,{});
    return {...unified, [type]: [...(unified[type] || []), coord ]};
  }

  setStone({current, type, coord}) {

    const different = i => i !== coord;
    const unify = (changes, type) => ({...changes, [type]: (current[type] || []).filter(different) });

    const labels = (current[type] || []);
    const filteredLabels = labels.filter(different);
    if (filteredLabels.length < labels.length) {
      return {[type]: filteredLabels};
    }
    const unified = STONE_COMPOSED_UNIQUE.reduce(unify ,{});
    return {...unified, [type]: [...(unified[type] || []), coord ]};
  }

  setLabel({type, current, coord, generator}) {
    const different = ([i]) => i !== coord;
    const labels = (current[type] || []);
    const filteredLabels = labels.filter(different);

    if (filteredLabels.length < labels.length) {
      return {[type]: filteredLabels};
    }

    const newLabel = [coord, generator(labels)];
    return {[type]: [...labels, newLabel ]};
  }

  updateOptions(change: any) {
    this.options = {
      ...this.options,
      ...change
    };
  }

  @Listen('download')
  dowloadGame() {
    dowloadAsSGF(this.party);
  }

  @Listen('keydown')
  keydownComponent(ev: KeyboardEvent){
    if (!this.options.allowWindowsEvent) {
      this.handleKeydown(ev);
    }
  }

  @Listen('keydown', { target: 'window' })
  keydownWindow(ev: KeyboardEvent) {
    if (this.options.allowWindowsEvent) {
      this.handleKeydown(ev);
    }
  }

  handleKeydown(ev) {
    ev.preventDefault();
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
      case 'o':
      case 'O':
        this.updateOptions({order: !this.options.order});
        break;
      case 't':
      case 'T':
        this.updateOptions({tree: !this.options.tree});
        break;
      case 'n':
      case 'N':
        this.updateOptions({controls: !this.options.controls});
        break;
      case 'c':
      case 'C':
        this.updateOptions({comments: !this.options.comments});
        break;
      case 'e':
      case 'E':
        this.updateOptions({mode: MODE.EDIT});
        break;
      case 'p':
      case 'P':
        this.updateOptions({mode: MODE.PLAY});
        break;
      case 'r':
      case 'R':
        this.updateOptions({mode: MODE.READ});
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

  componentDidRender() {
    this.options.style = conditionalStyles(this.el);
    this.displayControls = showMenu(this.options.style)
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
      <div class="goban" tabindex="0"  data-variante={this.options.style}>
        <img class="focus-indicator" src={keyboard}/>
        <gc-board
          class="goboard"
          options={this.options}
          size={this.party.info.size}
          state={getBoardState(this.board.board)}
          overlay={overlay}
          ghosts={getGhosts(this.currentPath, this.currentPosition)}>
        </gc-board>

          {this.displayControls && <gc-controls
            class="controls"
            data={meta}
            score={score}
            options={this.options}
            variations={this.variations}
            history={this.currentPath}
            position={this.currentPosition}>
          </gc-controls> }
          { this.options.comments &&
            <gc-comments
              class="comments"
              position={this.currentPosition}
              path={this.currentPath}>
            </gc-comments> }
          { this.options.tree &&
            <gc-tree class="tree"
              variations={this.variations}
              tree={this.party.tree}
              current={this.currentPath}
              position={this.currentPosition}>
            </gc-tree> }
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
