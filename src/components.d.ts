/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface GcBoard {
    'options': { order: boolean; zoom: number; };
    'size': number;
    'state': any[];
  }
  interface GcComments {
    'path': any[];
    'position': number;
  }
  interface GcControls {
    'data': any;
    'history': any[];
    'options': any;
    'position': number;
    'score': any;
    'variations': any;
  }
  interface GcGoban {
    'currentPosition': number;
    'options': any;
    'sgf': any;
    'variations': any;
  }
  interface GcTree {
    'current': any[];
    'position': number;
    'tree': any[];
    'variations': any[];
  }
  interface MyComponent {
    /**
    * The first name
    */
    'first': string;
    /**
    * The last name
    */
    'last': string;
    /**
    * The middle name
    */
    'middle': string;
  }
}

declare global {


  interface HTMLGcBoardElement extends Components.GcBoard, HTMLStencilElement {}
  var HTMLGcBoardElement: {
    prototype: HTMLGcBoardElement;
    new (): HTMLGcBoardElement;
  };

  interface HTMLGcCommentsElement extends Components.GcComments, HTMLStencilElement {}
  var HTMLGcCommentsElement: {
    prototype: HTMLGcCommentsElement;
    new (): HTMLGcCommentsElement;
  };

  interface HTMLGcControlsElement extends Components.GcControls, HTMLStencilElement {}
  var HTMLGcControlsElement: {
    prototype: HTMLGcControlsElement;
    new (): HTMLGcControlsElement;
  };

  interface HTMLGcGobanElement extends Components.GcGoban, HTMLStencilElement {}
  var HTMLGcGobanElement: {
    prototype: HTMLGcGobanElement;
    new (): HTMLGcGobanElement;
  };

  interface HTMLGcTreeElement extends Components.GcTree, HTMLStencilElement {}
  var HTMLGcTreeElement: {
    prototype: HTMLGcTreeElement;
    new (): HTMLGcTreeElement;
  };

  interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {}
  var HTMLMyComponentElement: {
    prototype: HTMLMyComponentElement;
    new (): HTMLMyComponentElement;
  };
  interface HTMLElementTagNameMap {
    'gc-board': HTMLGcBoardElement;
    'gc-comments': HTMLGcCommentsElement;
    'gc-controls': HTMLGcControlsElement;
    'gc-goban': HTMLGcGobanElement;
    'gc-tree': HTMLGcTreeElement;
    'my-component': HTMLMyComponentElement;
  }
}

declare namespace LocalJSX {
  interface GcBoard {
    'options'?: { order: boolean; zoom: number; };
    'size'?: number;
    'state'?: any[];
  }
  interface GcComments {
    'path'?: any[];
    'position'?: number;
  }
  interface GcControls {
    'data'?: any;
    'history'?: any[];
    'onOptionChange'?: (event: CustomEvent<any>) => void;
    'onSelectPosition'?: (event: CustomEvent<any>) => void;
    'options'?: any;
    'position'?: number;
    'score'?: any;
    'variations'?: any;
  }
  interface GcGoban {
    'currentPosition'?: number;
    'options'?: any;
    'sgf'?: any;
    'variations'?: any;
  }
  interface GcTree {
    'current'?: any[];
    'onSelectPosition'?: (event: CustomEvent<any>) => void;
    'onSelectVariation'?: (event: CustomEvent<any>) => void;
    'position'?: number;
    'tree'?: any[];
    'variations'?: any[];
  }
  interface MyComponent {
    /**
    * The first name
    */
    'first'?: string;
    /**
    * The last name
    */
    'last'?: string;
    /**
    * The middle name
    */
    'middle'?: string;
  }

  interface IntrinsicElements {
    'gc-board': GcBoard;
    'gc-comments': GcComments;
    'gc-controls': GcControls;
    'gc-goban': GcGoban;
    'gc-tree': GcTree;
    'my-component': MyComponent;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'gc-board': LocalJSX.GcBoard & JSXBase.HTMLAttributes<HTMLGcBoardElement>;
      'gc-comments': LocalJSX.GcComments & JSXBase.HTMLAttributes<HTMLGcCommentsElement>;
      'gc-controls': LocalJSX.GcControls & JSXBase.HTMLAttributes<HTMLGcControlsElement>;
      'gc-goban': LocalJSX.GcGoban & JSXBase.HTMLAttributes<HTMLGcGobanElement>;
      'gc-tree': LocalJSX.GcTree & JSXBase.HTMLAttributes<HTMLGcTreeElement>;
      'my-component': LocalJSX.MyComponent & JSXBase.HTMLAttributes<HTMLMyComponentElement>;
    }
  }
}


