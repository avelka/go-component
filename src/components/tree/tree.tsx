import { Component, h, Prop , Event, EventEmitter} from '@stencil/core';
import { isSamePosition } from '../../utils/utils';

@Component({
  tag: 'gc-tree',
  styleUrl: 'tree.css',
  shadow: true
})
export class Tree {
  @Prop() history: any[] = [];
  @Prop() tree: any[] = [];
  @Prop() variations: any[] = [];
  @Prop() position: number = 0;
  @Event() selectPosition: EventEmitter;
  @Event() selectVariation: EventEmitter;
  select(order, variation) {
    this.selectPosition.emit({order, variation});
  }

  showStone = ({state, order, variations}, {source, pos, branch, path = []} ) => <span>
      <button
        type="button"
        data-selected={order == this.position}
        onClick={() => this.select(order, {source, pos, branch, path})}
        class="stone"
        data-color={state}>
          {order + 1}
      </button>
      {variations && variations.length && variations.map((v, vi) => <div class="tree-view">
        {v.map(s => this.showStone(s, {source: source + 1, pos:order, branch: vi + 1, path: [...path, {source, pos, branch}] }))}
      </div>)}
    </span>

  render() {
    return (
      <div>
        {this.position + 1} / {this.tree.length}
        <div class="tree-view">
          {this.tree.map(s => this.showStone(s, {source: 0, pos: 0, branch: 0}))}
        </div>
      </div>
    );
  }

}
