import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'gc-comments',
  styleUrl: 'comments.css',
  shadow: true
})
export class Comments {

  @Prop() path = [];
  @Prop() position = 0;
  render() {
    const comments = this.path.slice(0, this.position).filter(m => m.comment)
    return (
      <div>
        {comments.map(m => <p>
            {m.order}:
            {m.comment}
          </p>)}
      </div>
    );
  }

}
