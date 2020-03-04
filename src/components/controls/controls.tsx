import { Component, Event,
  EventEmitter, h, Prop } from '@stencil/core';

import pause from '../../assets/pause-24px.svg';
import play from '../../assets/play_arrow-24px.svg';
import prev from '../../assets/chevron_left-24px.svg';
import next from '../../assets/chevron_right-24px.svg';
import last from '../../assets/last_page-24px.svg';
import first from '../../assets/first_page-24px.svg';

import cross from '../../assets/close-24px.svg';
import square from '../../assets/crop_square-24px.svg';
import circle from '../../assets/panorama_fish_eye-24px.svg';
import triangle from '../../assets/details-24px.svg';


import number from '../../assets/format_list_numbered-24px.svg';
import tree from '../../assets/account_tree-24px.svg';
import download from '../../assets/get_app-24px.svg';
// import category from '../../assets/category-24px.svg';
import zoom from '../../assets/zoom_in-24px.svg';


import {MODE, SELECTS, ATTR_SGF} from "../../utils/utils";


const markers = [
  [ATTR_SGF.SQUARE, square],
  [ATTR_SGF.CIRCLE, circle],
  [ATTR_SGF.MARK, cross],
  [ATTR_SGF.TRIANGLE, triangle],
  [ATTR_SGF.ARROW, next],
  [ATTR_SGF.ADD_BLACK, next],
  [ATTR_SGF.ADD_WHITE, next],
  [ATTR_SGF.ADD_EMPTY, next],
];

const MarkerButton = ({icon, onAction, marker, title, selected}) => <button
  data-enabled={selected}
  title={title}
  type="button"
  onClick={() => onAction(marker)}>
  <img src={icon}/>
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

  toggleNumber() {
    this.optionChange.emit({order: !this.options.order});
  }

  toggleTree() {
    this.optionChange.emit({tree: !this.options.tree});
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
        <div>
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
          <img src={zoom}/>
          <input type="number" min="10" max="200" value={this.options.zoom}/>%
        </span>
      </nav>
      <nav>
        <button type="button" data-enabled={this.options.order} onClick={() => this.toggleNumber()}>
          <img src={number}/>
        </button>
        <button type="button" data-enabled={this.options.tree} onClick={() => this.toggleTree()}>
          <img src={tree}/>
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


        <button type="button" onClick={() => this.selectMarker(ATTR_SGF.LINE)}>
          <img src={triangle}/>
        </button>

        <button type="button" onClick={() => this.selectMarker(ATTR_SGF.LABEL)}>
          <img src={triangle}/>
        </button>

      </nav>}
    </div>

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

