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


import addBlack from '../../assets/marker_black.svg';
import addWhite from '../../assets/marker_white.svg';
import addEmpty from '../../assets/marker_empty.svg';

import addLabelAlpha from '../../assets/marker_label_alpha.svg';
import addLabelFree from '../../assets/marker_label_free.svg';

import more from '../../assets/more.svg';
import infos from '../../assets/infos.svg';
import read from '../../assets/read.svg';
import edit from '../../assets/edit.svg';
import settings from '../../assets/settings.svg';


import {MODE, ATTR_SGF, STYLES} from "../../utils/utils";

const markers = [
  [ATTR_SGF.SQUARE, square, 'Square'],
  [ATTR_SGF.CIRCLE, circle, 'Circle'],
  [ATTR_SGF.MARK, cross, 'Mark'],
  [ATTR_SGF.TRIANGLE, triangle, 'Triangle'],

  [ATTR_SGF.ADD_BLACK, addBlack, 'Add black'],
  [ATTR_SGF.ADD_WHITE, addWhite, 'Add white'],
  [ATTR_SGF.ADD_EMPTY, addEmpty, 'Add empty'],
  [ATTR_SGF.LABEL_ALPHA, addLabelAlpha, 'Add alphabetic label '],
  [ATTR_SGF.LABEL_NUMERIC, addLabelFree, 'Add number label '],

];
const Player = ({color, name, level, score, isTurn}) => <div
    title={`${name} (${level ? level : '-'})`}
    data-player={color}
    data-isturn={color === isTurn}
  >
      <span class="stone">
        <span class="captured">{score}</span>
      </span>
      <span class="name">{`${name} (${level ? level : '-'})`}</span>
  </div>;

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

  changeMode(mode) {
    this.optionChange.emit({mode});
  }

  toggleMenu() {
    this.optionChange.emit({ menu: !this.options.menu });
  }

  getSGF() {
    this.download.emit({type: 'sgf'})
  }

  selectMarker(marker) {
    this.optionChange.emit({marker});
  }

  toggleInfos() {
    this.optionChange.emit({infos: !!this.options.infos});
  }

  render() {
    const isTurn = this.data.players[this.position % this.data.players.length].color;
    const players = this.data.players.map(p => {
      return {...p, score: this.score.get(p.color)};
    });
    const showMenuToggle = this.options.style === STYLES.CONDENSED
    return (
      <section class={this.options.style}>
        <header>
          {players.map(p => <Player {...p} isTurn={isTurn}></Player>)}
          {showMenuToggle && <button type="button" onClick={() => this.toggleMenu()}>
            <img src={more}></img>
          </button>}
        </header>
        <div class="menu" data-hidden={!this.options.menu} data-displayed={!this.options.menu}>
          { this.renderModeBar()}
          { this.options.mode === MODE.SETTINGS && this.renderSettingsBar() }
          { this.options.mode === MODE.READ && this.renderReadBar() }
          { this.options.mode === MODE.EDIT && this.renderEditBar() }
        </div>
      </section>


    );
  }

  renderEditBar() {
    return <nav>
      { markers.map(([mk, icn, title]) => <MarkerButton
        title={title}
        icon={icn}
        selected={mk === this.options.marker}
        onAction={v => this.selectMarker(v)}
        marker={mk} />)}
    </nav>
  }

  renderModeBar() {
    const focusable = this.options.menu ? 0 : -1;
    return <nav class="tablist">
      <Button
        tabIndex={focusable}
        data-enabled={this.options.mode === MODE.READ}
        onClick={() => this.changeMode(MODE.READ)}
        icon={read}/>

      <Button
        tabIndex={focusable}
        data-enabled={this.options.mode === MODE.EDIT}
        onClick={() => this.changeMode(MODE.EDIT)}
        icon={edit}/>

      <Button
        tabIndex={focusable}
        data-enabled={this.options.mode === MODE.SETTINGS}
        onClick={() => this.changeMode(MODE.SETTINGS)}
        icon={settings}/>

    </nav>
  }

  renderReadBar() {
    const focusable = this.options.menu ? 0 : -1;
    return <nav>
      <Button
        tabIndex={focusable}
        onClick={() => this.first()}
        icon={first} />


      <Button
        tabIndex={focusable}
        onClick={() => this.prev()}
        icon={prev}/>

      <Button
        tabIndex={focusable}
        disabled={this.options.mode !== MODE.READ}
        data-enabled={this.options.play}
        onClick={() => this.playPause()}
        icon={this.options.play ? pause : play} />

      <Button
        tabIndex={focusable}
        onClick={() => this.next()}
        icon={next}/>

      <Button
        tabIndex={focusable}
        onClick={() => this.last()}
        icon={last}/>

    </nav>;
  }

  renderSettingsBar() {
    const focusable = this.options.menu ? 0 : -1;
    return <nav>
      <Button
        tabIndex={focusable}
        data-enabled={this.options.order}
        onClick={() => this.toggleNumber()} icon={number}/>

      <Button
        tabIndex={focusable}
        data-enabled={this.options.tree}
        onClick={() => this.toggleTree()} icon={tree} />

      <Button
        tabIndex={focusable}
        data-enabled={this.options.order}
        onClick={() => this.toggleInfos()} icon={infos}/>

      <Button
        tabIndex={focusable}
        data-enabled={this.options.comments}
        onClick={() => this.toggleComments()}
        icon={comments} />

      <Button
      tabIndex={focusable}
      onClick={() => this.getSGF()}
      icon={download} />

    </nav>;
  }

 }
 const Button = ({icon, ...props}) => <button type="button" {...props}> <img src={icon}/></button>



