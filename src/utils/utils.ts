import sgfgrove from 'sgfgrove';

interface Coord {
  x: number
  y: number
}

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
export const BLACK = 'black';
export const WHITE = 'white';
export const ATTR_SGF = {
  COMMENT: 'C',
  BLACK: 'B',
  WHITE: 'B',
  ADD_BLACK: 'AB',
  ADD_WHITE: 'AW',
  ADD_EMPTY: 'AE',
  CIRCLE: 'CR',
  TRIANGLE: 'TR',
  SQUARE: 'SQ',
  MARK: 'MA',
  LINE: 'LN',
  ARROW: 'AR',
  LABEL: 'LB',
  LABEL_ALPHA: 'LB_ALPHA',
  LABEL_NUMERIC: 'LB_NUMERIC',
  GHOST: 'DD'
}
export const MODE = {
  READ: 'READ',
  EDIT: 'EDIT',
  PLAY: 'PLAY',
  SETTINGS: 'SETTINGS'
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
    ...m, order: o + order,
    branchIndex: o,
    source: {
      treeRef: tree,
      pos: order - 1,
      branch,
      level: lvl,
      variations: variations.length,
    }
  }))

  return variations.length
    ? [...flat, ...extractVariations(variations[branch], path, lvl + 1, flat.length + 1)]
    : flat;
};

export function getCurrentPath(tree, path = []) {
  return extractVariations(tree, path);
}

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

export const animateCirclePosition = (circle, o, n) => {
  circle.setAttribute("x", n.x);
  circle.setAttribute("y", n.y);
  circle.animate([{
    x: o.x,
    y: o.y
  }, {
    x: n.x,
    y: n.y
  }], {
    duration: 200,
    iterations: 1,
    fill: "forwards"
  });
}

export function getGhosts(path, pos) {
  try {
    const { branchIndex, source: { treeRef } } = path[pos];
    const isLastInbranch = branchIndex === (treeRef[0].length - 1);
    const next = path[pos + 1];
    const variations = treeRef[1].map(i => i[0]).map(i => i[0]);
    const ghosts = isLastInbranch
      ? variations
      : [treeRef[0][branchIndex + 1]];
    return ghosts.filter(i => i).map((g, i) => {
      const inPath = (g.B || g.W) === (next.B || next.W);
      return toMove({ ...g, inPath }, i);
    });
  } catch (e) {
    console.error(e);
    return [];
  }

}

export const cloneArray = (items: any[]) => items.map(item => Array.isArray(item) ? cloneArray(item) : item);

export const toSGFObject = (move) => {
  const color = move.state === BLACK ? 'B' : 'W';
  const coord = '' + n2a(move.x) + n2a(move.y);
  return { [color]: coord };
}

export const nextPlayer = pos => {
  return pos % 2 ? WHITE : BLACK;
}

export function alphabetLabelGenerator(labels: any[]) {
  const alpha = Array.from(new Set(labels
    .filter((e: any) => /[A-Z]{1}/i.test(e[1]))
    .map(e => e[1].toLowerCase())));
  return alphabet(alpha.length + 1).find((l: string) => !alpha.includes(l)).toUpperCase();
}
const numberList = size => Array(size).fill(null).map((_, i) => i + 1);

export function numericLabelGenerator(labels: any[]) {
  const num = Array.from(new Set(labels
    .filter((e: any) => /[\d]{1,2}/i.test(e[1]))
    .map(e => e[1])));
  return numberList(num.length + 1).find((l: number) => !num.includes(l)) || 1;
}


export function getHoshi(size: number): Coord[] {
  const side = minMax(1, (Math.round(size / 3) - 1), 3);
  const oposite = size - side - 1;

  let centerPoints: Coord[] = [];

  if (size % 2) {
    const center: number = ((size + size % 2) / 2) - 1;
    centerPoints = [
      { x: center, y: center },
      { x: center, y: side },
      { x: side, y: center },
      { x: center, y: oposite },
      { x: oposite, y: center }
    ];
  }

  return [
    ...centerPoints,
    { x: side, y: side },
    { x: oposite, y: side },
    { x: side, y: oposite },
    { x: oposite, y: oposite },
  ]
}
