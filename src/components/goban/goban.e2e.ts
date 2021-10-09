import { newE2EPage } from '@stencil/core/testing';

describe('gc-goban', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gc-goban></gc-goban>');

    const element = await page.find('gc-goban');
    expect(element).toHaveClass('hydrated');
  });
});
