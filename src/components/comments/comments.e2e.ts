import { newE2EPage } from '@stencil/core/testing';

describe('gc-comments', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gc-comments></gc-comments>');

    const element = await page.find('gc-comments');
    expect(element).toHaveClass('hydrated');
  });
});
