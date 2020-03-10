import { Component, h, Prop , Event, EventEmitter} from '@stencil/core';
import {toMove, compareBranch } from '../../utils/utils';

@Component({
  tag: 'gc-tree',
  styleUrl: 'tree.css',
  shadow: true
})
export class Tree {
  @Prop() variations: any[] = [];
  @Prop() current: any[] = [];
  @Prop() tree: any[] = [];
  @Prop() position: number = 0;
  @Event() selectPosition: EventEmitter;
  @Event() selectVariation: EventEmitter;

  select(order:number, variation: any) {
    this.selectPosition.emit({order, variation});
  }

  isCurrent(move, vpath) {
    return this.isInPath(vpath)
      && move.order == this.position;
  }

  isInPath(path = []) {
   return compareBranch(this.variations, path);
  }
  showBranch(branch, order = 0, vpath = []) {
    const [main, variations = []] = branch;
    return (<div class="tree-view">
      <div class="stones-wrapper">{
        Array.isArray(main)
          ? main.map((m, o) => this.showStone(m, o + order, vpath))
          : this.showStone(main, order, vpath)
      }</div>
      <div>
        {variations.map((v, bi) => this.showBranch(v, order + main.length, [...vpath, bi]))}
      </div>
    </div>);
  }

  showStone(stone, i, vpath) {
    const move = toMove(stone, i);
    return <button
    type="button"
    class="stone"
    title={`${move.x + 1}.${move.y + 1}`}
    onClick={() => this.select(move.order || 0, vpath)}
    data-in-path={this.isInPath(vpath)}
    data-is-current={this.isCurrent(move, vpath)}
    data-color={move.state}>
      {move.order}
    </button>
  }

  render() {
    return (
      <div>
        <div class="tree-view">
          {this.showBranch(this.tree)}
        </div>
      </div>
    );
  }

}
