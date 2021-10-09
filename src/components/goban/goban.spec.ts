import { Goban } from './goban';

describe('gc-goban', () => {
  it('builds', () => {
    expect(new Goban()).toBeTruthy();
  });
});
