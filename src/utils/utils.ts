
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


export const extractVariations = (flatTree, dir) => {
  if (dir.source && flatTree[dir.pos]) {
    return [...flatTree.slice(0, dir.pos + 1), ...flatTree[dir.pos].variations[dir.branch - 1]];
  }
  return flatTree;
};

export function getCurrentPath(tree, variations) {
  const { path = [], ...cv } = variations || { path: [] };
  const vpath = cv ? [...path, cv] : path;
  return variations && vpath && vpath.length
    ? vpath.reduce(extractVariations, tree)
    : defaultPath(tree);
}

function defaultPath(tree: any[]) {
  return tree.reduce((path: any[], m: any) => {
    if (m.variations && m.variations.length) {
      return [...path, m, ...defaultPath(m.variations[0])];
    }
    return [...path, m]
  }, [])
}

export function toTree(collection: any[], o: number = 0) {
  const [main, variations = []] = collection;
  const moves = main.map((m: any, i: number) => toMove(m, i + o));
  if (variations && variations.length) {
    moves[moves.length - 1].variations = variations.map((v: any[]) => toTree(v, main.length + o));
  }
  return moves;
}

export const toMove = (m: any, i: number) => ({
  order: i,
  comment: m.C,
  state: m.B ? 'BLACK' : 'WHITE',
  ...fromSGFCoord(m)
});

export function getBoardState(gs: any) {
  return gs.board
    .reduce((a: any[], c: any[]) => [...a, ...c], [])
    .filter((i: any) => i.state);
}

export function getScore(history) {
  return history.reduce((c, { state, captured = [] }) => {
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
  };
  const vars = [def, ...forks.map((p, i) => ({ pos: p.order, source: i + 1, branch: 1 }))];
  const [current, ...path] = vars.reverse();
  return {
    ...current,
    path
  }
}
