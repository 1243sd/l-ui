import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LAvatar } from './components/Avatar';

describe('LAvatar', () => {
  it('renders image mode when src is provided', () => {
    const wrapper = mount(LAvatar, {
      props: {
        src: 'https://example.com/avatar.png',
        alt: 'Profile photo'
      }
    });

    const image = wrapper.find('img');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/avatar.png');
    expect(image.attributes('alt')).toBe('Profile photo');
  });

  it('renders fallback text and allows slot fallback content', () => {
    const textWrapper = mount(LAvatar, {
      props: {
        fallbackText: 'LU'
      }
    });

    expect(textWrapper.text()).toContain('LU');

    const slotWrapper = mount(LAvatar, {
      props: {
        fallbackText: 'LU'
      },
      slots: {
        default: 'Slot Avatar'
      }
    });

    expect(slotWrapper.text()).toContain('Slot Avatar');
    expect(slotWrapper.text()).not.toContain('LU');
  });

  it('applies size and shape classes', () => {
    const wrapper = mount(LAvatar, {
      props: {
        size: 'large',
        shape: 'square',
        fallbackText: 'LU'
      }
    });

    expect(wrapper.classes()).toContain('l-avatar--large');
    expect(wrapper.classes()).toContain('l-avatar--square');
  });
});
