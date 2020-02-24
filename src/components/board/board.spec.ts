import { Board } from './board';

describe('gc-board', () => {
  it('builds', () => {
    expect(new Board()).toBeTruthy();
  });
});
