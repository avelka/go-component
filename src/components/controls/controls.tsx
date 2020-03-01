import { Component, Event,
  EventEmitter, h, Prop } from '@stencil/core';

import pause from '../../assets/pause-24px.svg';
import play from '../../assets/play_arrow-24px.svg';
import prev from '../../assets/skip_previous-24px.svg';
import next from '../../assets/skip_next-24px.svg';
import number from '../../assets/format_list_numbered-24px.svg';
import tree from '../../assets/account_tree-24px.svg';

import {MODE, SELECTS} from "../../utils/utils";

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
        <nav>
          <button type="button" onClick={() => this.prev()}><img src={prev}/></button>
          <button type="button"
          disabled={this.options.mode !== MODE.READ}
          data-enabled={this.options.play}
          onClick={() => this.playPause()}>
          {this.options.play
          ? <img src={pause}/>
          : <img src={play}/>}
          </button>
          <select
            disabled={this.options.play}
            name="interval"
            onInput={e => this.changeInterval(e)}>
           {SELECTS.intervals.map(({value, label}) => <option value={value} selected={this.options.interval == value }>{label}</option>)}
          </select>
          <button type="button" onClick={() => this.next()}>
            <img src={next}/>
          </button>
          <button type="button" data-enabled={this.options.order} onClick={() => this.toggleNumber()}>
            <img src={number}/>
          </button>
          <button type="button" data-enabled={this.options.tree} onClick={() => this.toggleTree()}>
            <img src={tree}/>
          </button>
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

          <span>
            Zoom: {this.options.zoom}
          </span>
        </nav>

        <div>

        </div>
      </section>
    );
  }

}
