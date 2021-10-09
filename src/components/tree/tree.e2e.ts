import { newE2EPage } from '@stencil/core/testing';

describe('gc-tree', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gc-tree></gc-tree>');

    const element = await page.find('gc-tree');
    expect(element).toHaveClass('hydrated');
  });
});
