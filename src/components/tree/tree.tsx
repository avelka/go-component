import { Component, h, Prop , Event, EventEmitter} from '@stencil/core';
import { isSamePosition } from '../../utils/utils';

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

  isCurrent(move) {
    return this.isInPath(move)
      && move.order == this.position;
  }

  isInPath(move) {
    return isSamePosition(this.current[move.order], move);
  }

  showStone({state, order, variations, x, y}, {source = 0, pos, branch, path = []} ) {
    return  <div class="stone-wrapper"
      data-has-variations={variations && variations.length}
      data-in-path={this.isInPath({state, order, x, y})}>
          <button
            type="button"
            title={`x:${x};y${y}`}
            data-is-current={this.isCurrent({state, order, x, y})}
            onClick={() => this.select(order, {source, pos, branch, path})}
            class="stone"
            data-color={state}>
              {order + 1}
          </button>
          <div class="variations">
          {variations && variations.length && variations.map((v, vi) => <div class="tree-view">
            {v.map(s => this.showStone(s, {source: source + 1, pos:order, branch: vi + 1, path: [...path, {source, pos, branch}] }))}
          </div>)}
          </div>
        </div>
  }

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
