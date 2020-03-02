import sgfgrove from 'sgfgrove';

export function format(first: string, middle: string, last: string): string {
  return (
    (first || '') +
    (middle ? ` ${middle}` : '') +
    (last ? ` ${last}` : '')
  );
}

export const alphabet = (s: number = 26) => {
  return new Array(s).fill(1).map((_, i) => String.fromCharCode(97 + i));
};

export const a2n = (a: string) => {
  return alphabet().indexOf(a);
};
export const n2a = (n: number) => {
  return alphabet()[n];
};

export const toCoord = (node: { x: number; y: number }) => {
  const { x, y } = node;
  return n2a(x) + n2a(y);
};
export const fromSGFCoord = (sgfnode: any) => {
  const move = sgfnode.B || sgfnode.W;
  if (move) {
    const [x, y] = move.split("");
    return { x: a2n(x), y: a2n(y) };
  }
  return { x: null, y: null };
};

export const EMPTY = null;
export const BLACK = 'BLACK';
export const WHITE = 'WHITE';

export const MODE = {
  READ: 'READ',
  EDIT: 'EDIT',
  PLAY: 'PLAY'
};

export const SELECTS = {
  intervals: [{
    label: '1s',
    value: 1
  }, {
    label: '5s',
    value: 5
  }, {
    label: '15s',
    value: 15
  }, {
    label: '30s',
    value: 30
  }],
  modes: [{
    value: MODE.EDIT,
    label: 'Edition',
  },
  {
    value: MODE.READ,
    label: 'Lecture',
  },
  {
    value: MODE.PLAY,
    label: 'Jeu',
  }
  ]
};

export const minMax = (min: number, val: number, max: number) => Math.min(Math.max(val, min), max)

export const isSamePosition = (
  a: { x: number, y: number },
  b: { x: number, y: number }
) => a && b && a.x === b.x && a.y === b.y


export const extractVariations = (tree, path = [], lvl = 0, order = 0) => {
  const [main, variations = []] = tree;
  const branch = path && path[lvl] || 0;
  const flat = main.map((m, o) => ({
    ...m, order: o + order, source: {
      pos: order - 1,
      branch,
      level: lvl,
      variations: variations.length
    }
  }))

  return variations.length
    ? [...flat, ...extractVariations(variations[branch], path, lvl + 1, flat.length + 1)]
    : flat;
};

export function getCurrentPath(tree, path = []) {
  return extractVariations(tree, path);
}

/* function defaultPath(tree: any[]) {
  const [main, variations] = tree;
  return variations && variations.length
    ? [...main, ...defaultPath(variations[0])]
    : main;
} */

export function toTree(collection: any[], o: number = 0) {
  const [main, variations = []] = collection;
  const moves = main.map((m: any, i: number) => toMove(m, i + o));
  if (variations && variations.length) {
    moves[moves.length - 1].variations = variations.map((v: any[]) => toTree(v, main.length + o));
  }

  return moves;
}

export const toMove = (m: any, i: number) => {

  const color = (m.B || m.W ? (m.B ? BLACK : WHITE) : EMPTY);
  return {
    order: i,
    ...m,
    comment: m.C,
    state: color,
    ...fromSGFCoord(m)
  };
};

export function getBoardState(board: any) {
  return board && board
    .reduce((a: any[], c: any[]) => [...a, ...c], [])
    .filter((i: any) => i.state || i.label);
}

export function getScore(history) {
  return (history || []).reduce((c, { state, captured = [] }) => {
    const color = state.toUpperCase();
    c.set(color, (c.has(color) ? c.get(color) : 0) + captured.length)
    return new Map(c);
  }, new Map());
}

export function baseVariation(forks: any[]) {
  const def = {
    source: 0,
    pos: 0,
    branch: 0,
    def: true
  };
  const vars = [def, ...forks.map((p, i) => ({ pos: p.order, source: i + 1, branch: 1 }))];
  const [current, ...path] = vars.reverse();
  return {
    ...current,
    path
  }
}

/* export function compareBranch(a = [], b = []) {

  const s = Math.min(a.length, b.length);
  const sa = a.slice(0, s).join(":");
  const sb = b.slice(0, s).join(":");
  return s && sa === sb;
} */

export function compareBranch(current = [], test = []) {

  return test.reduce((r, f, i) => {
    if (r) {
      const eq = current[i];
      return eq ? f === eq : f === 0;
    }
    return false;
  }, true);
}

export function parse(sgf: any) {
  const parsed = sgfgrove.parse(sgf);

  const [[meta]] = parsed;
  const [{ PB, PW, BR, WR, SZ, KM, RU, GN, CP, US, AN, TM, OT, RE, DT, ...rest }] = meta;
  return {
    players: [
      { color: 'BLACK', name: PB, level: BR },
      { color: 'WHITE', name: PW, level: WR },
    ],
    info: {
      size: SZ,
      komi: KM,
      rule: RU,
      time: TM,
      overtime: OT
    },
    meta: {
      name: GN,
      copyright: CP,
      scribe: US,
      commentator: AN,
      result: RE,
      date: DT
    },
    rest,
    tree: parsed[0],
  };
}

export function dowloadAsSGF(game) {
  const sgf = sgfgrove.stringify([game.tree]);
  console.log(sgf, game.tree);
  const blob = new Blob([sgf], { type: 'application/x-go-sgf' })
  // Other browsers
  // Create a link pointing to the ObjectURL containing the blob
  const blobURL = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', game.title || 'game.sgf');
  // Safari thinks _blank anchor are pop ups. We only want to set _blank
  // target if the browser does not support the HTML5 download attribute.
  // This allows you to download files in desktop safari if pop up blocking
  // is enabled.
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank');
  }
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(blobURL);
  }, 100);
}
