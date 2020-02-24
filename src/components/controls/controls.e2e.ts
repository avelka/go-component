import { newE2EPage } from '@stencil/core/testing';

describe('gc-controls', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gc-controls></gc-controls>');

    const element = await page.find('gc-controls');
    expect(element).toHaveClass('hydrated');
  });
});
