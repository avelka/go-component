import { Component, Event,
  EventEmitter, h, Prop } from '@stencil/core';

import pause from '../../assets/control_pause.svg';
import play from '../../assets/control_play.svg';
import prev from '../../assets/control_prev.svg';
import next from '../../assets/control_next.svg';
import last from '../../assets/control_last.svg';
import first from '../../assets/control_first.svg';

import cross from '../../assets/marker_cross.svg';
import square from '../../assets/marker_square.svg';
import circle from '../../assets/marker_circle.svg';
import triangle from '../../assets/marker_triangle.svg';

import number from '../../assets/toggle_order.svg';
import tree from '../../assets/toggle_tree.svg';
import download from '../../assets/download.svg';
import comments from '../../assets/toggle_comments.svg';
// import category from '../../assets/category-24px.svg';
import zoom1 from '../../assets/control_zoom_in.svg';
import zoom0 from '../../assets/control_zoom_out.svg';
import addBlack from '../../assets/marker_black.svg';
import addWhite from '../../assets/marker_white.svg';
import addEmpty from '../../assets/marker_empty.svg';
import remove from '../../assets/marker_remove.svg';
/*
import arrow from '../../assets/marker_remove.svg';
import line from '../../assets/marker_remove.svg'; */
import addLabelAlpha from '../../assets/marker_label_alpha.svg';
import addLabelFree from '../../assets/marker_label_free.svg';



import {MODE, SELECTS, ATTR_SGF} from "../../utils/utils";


const markers = [
  [ATTR_SGF.SQUARE, square, 'Square'],
  [ATTR_SGF.CIRCLE, circle, 'Circle'],
  [ATTR_SGF.MARK, cross, 'Mark'],
  [ATTR_SGF.TRIANGLE, triangle, 'Triangle'],
/*   [ATTR_SGF.ARROW, arrow, 'Arrow'],
  [ATTR_SGF.LINE, line, 'Line'], */

  [ATTR_SGF.ADD_BLACK, addBlack, 'Add black'],
  [ATTR_SGF.ADD_WHITE, addWhite, 'Add white'],
  [ATTR_SGF.ADD_EMPTY, addEmpty, 'Add empty'],
  [ATTR_SGF.LABEL, addLabelAlpha, 'Add label'],
  [ATTR_SGF.LABEL, addLabelFree, 'Add label'],
  [null, remove, 'Delete marker'],

];

const MarkerButton = ({icon, onAction, marker, title, selected}) => <button
  data-enabled={selected}
  title={title}
  type="button"
  onClick={() => onAction(marker)}>
  <img src={icon} alt={title} title={title}/>
</button>;

@Component({
  tag: 'gc-controls',
  styleUrl: 'controls.css',
  shadow: true
})
export class Controls {

  @Prop() history: any[] = [];
  @Prop() data: any = {};
  @Prop() variations: any = {};
  @Prop() position: number = 0;
  @Prop() options: any = {};
  @Prop() score: any = {};
  @Event() selectPosition: EventEmitter;
  @Event() download: EventEmitter;
  @Event() optionChange: EventEmitter;

  next() {
    this.selectPosition.emit({ order: this.position + 1 });
  }

  prev() {
    this.selectPosition.emit({ order: this.position - 1 });
  }
  first() {
    this.selectPosition.emit({ order: 0 });
  }
  last() {
    this.selectPosition.emit({ order: this.history.length });
  }

  toggleNumber() {
    this.optionChange.emit({order: !this.options.order});
  }

  toggleTree() {
    this.optionChange.emit({tree: !this.options.tree});
  }
  toggleComments() {
    this.optionChange.emit({comments: !this.options.comments});
  }

  playPause() {
    if (MODE.READ) {
      this.optionChange.emit({play: !this.options.play});
    } else {
      this.optionChange.emit({play: false});
    }
  }

  changeInterval(event) {
    this.optionChange.emit({interval: parseInt(event.target.value, 10)});
  }

  changeMode(event) {
    this.optionChange.emit({mode: event.target.value});
  }
  getSGF() {
    this.download.emit({type: 'sgf'})
  }
  selectMarker(marker) {
    this.optionChange.emit({marker});
  }
  render() {
    const isTurn = this.data.players[this.position % this.data.players.length].color;
    const players = this.data.players.map(p => {
      return {...p, score: this.score.get(p.color)};
    });

    return (
      <section>
        <header class="players-container">
          {players.map(({color, name, level, score}) => <div
          data-player={color}
          data-isturn={color === isTurn}
          >
            <div>
              <span>{name} {level && `(${level})`}</span>
              <span class="captured">Captured: {score}</span>
            </div>
          </div>)}
        </header>
        { this.options.controls &&
          (<div>
              <select
                  disabled={this.options.play}
                  name="interval"
                  onInput={e => this.changeMode(e)}>
                {SELECTS.modes.map(({value, label}) => <option
                  value={value}
                  selected={this.options.mode == value }>
                    {label}
                  </option>)}
              </select>
            <nav>
              <button type="button" onClick={() => this.prev()}><img src={first}/></button>
              <button type="button" onClick={() => this.prev()}><img src={prev}/></button>
              <button type="button"
                disabled={this.options.mode !== MODE.READ}
                data-enabled={this.options.play}
                onClick={() => this.playPause()}>
              {this.options.play ? <img src={pause}/> : <img src={play}/>}
              </button>
              <button type="button" onClick={() => this.next()}>
                <img src={next}/>
              </button>
              <button type="button" onClick={() => this.prev()}><img src={last}/></button>
              <span class="input-control zoom">
                <img src={zoom0}/>
                <input type="number" min="10" max="200" value={this.options.zoom}/>%
                <img src={zoom1}/>
              </span>
            </nav>
            <nav>
              <button type="button" data-enabled={this.options.order} onClick={() => this.toggleNumber()}>
                <img src={number}/>
              </button>
              <button type="button" data-enabled={this.options.tree} onClick={() => this.toggleTree()}>
                <img src={tree}/>
              </button>
              <button type="button" data-enabled={this.options.comments} onClick={() => this.toggleComments()}>
                <img src={comments}/>
              </button>
              <button type="button" onClick={() => this.getSGF()}>
                <img src={download}/>
              </button>
            </nav>
            {this.options.mode === MODE.EDIT
            && <nav>
              { markers.map(([mk, icn, title]) => <MarkerButton
                title={title}
                icon={icn}
                selected={mk === this.options.marker}
                onAction={v => this.selectMarker(v)}
                marker={mk} />)}
            </nav>}
          </div>)
        }

{/* <select
disabled={this.options.play}
name="interval"
onInput={e => this.changeInterval(e)}>
{SELECTS.intervals.map(({value, label}) => <option value={value} selected={this.options.interval == value }>{label}</option>)}
</select> */}
      </section>

    );
  }

}

