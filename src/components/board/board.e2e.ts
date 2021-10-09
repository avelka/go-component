import { newE2EPage } from '@stencil/core/testing';

describe('gc-board', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gc-board></gc-board>');

    const element = await page.find('gc-board');
    expect(element).toHaveClass('hydrated');
  });
});
