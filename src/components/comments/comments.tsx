import { Component, h, Prop } from '@stencil/core';
import {ATTR_SGF} from '../../utils/utils';
@Component({
  tag: 'gc-comments',
  styleUrl: 'comments.css',
  shadow: true
})
export class Comments {

  @Prop() path = [];
  @Prop() position = 0;
  render() {
    const comments = this.path
    .sort((a, b) => a.order - b.order)
    .slice(0, this.position)
    .filter(m => m[ATTR_SGF.COMMENT])
    return (
      <div>
        {comments.map(m => <p>
            {m.order}:
            {m[ATTR_SGF.COMMENT]}
          </p>)}
      </div>
    );
  }

}
