
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
