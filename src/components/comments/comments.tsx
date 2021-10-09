import { Component, h, Prop, Event, EventEmitter, Element  } from '@stencil/core';

import {ATTR_SGF} from '../../utils/utils';

@Component({
  tag: 'gc-comments',
  styleUrl: 'comments.css',
  shadow: true
})
export class Comments {
  @Element() commentsList: HTMLElement;
  @Prop() path = [];
  @Prop() position = 0;

  @Event() addComment: EventEmitter;

  sendComment(event: any) {
    event.preventDefault();
    const formInputs = event.target.querySelectorAll("input, textarea, select");
    const values = [...formInputs].reduce((v, e) => {
      v[e.attributes.name.value] = e.value;
      return v;
    }, {});
    this.addComment.emit(values);
    const form = this.commentsList.shadowRoot.querySelector("form");
    form.reset();
  }

  render() {
    const moves = this.path
      .sort((a, b) => a.order - b.order)
      .slice(0, this.position)
      .map((m, i) => ({...m, order: i + 1}));

    const comments = moves.filter(m => m[ATTR_SGF.COMMENT]);
    const last = moves[moves.length - 1];
    const current = last && last[ATTR_SGF.COMMENT] || "";

    return (
      <form class="wrapper" onSubmit={ev => this.sendComment(ev)}>
        <div class="comments">
        {comments.map(m => <p>
            {m.order}:
            {m[ATTR_SGF.COMMENT]}
          </p>)}
        </div>
        <div class="comment-input">
          <textarea name="comment">{current}</textarea>
          <button>send</button>
          <button type="reset">reset</button>
        </div>
      </form>
    );
  }
}
