import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LTag } from './components/Tag';

describe('LTag', () => {
  it('renders default content', () => {
    const wrapper = mount(LTag, {
      slots: {
        default: 'Default tag'
      }
    });

    expect(wrapper.text()).toContain('Default tag');
    expect(wrapper.classes()).toContain('l-tag');
    expect(wrapper.classes()).toContain('l-tag--default');
  });

  it('applies the semantic color class', () => {
    const wrapper = mount(LTag, {
      props: {
        color: 'primary'
      },
      slots: {
        default: 'Primary tag'
      }
    });

    expect(wrapper.classes()).toContain('l-tag--primary');
  });

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true]
  ])('supports bordered=%s and round=%s', (bordered, round) => {
    const wrapper = mount(LTag, {
      props: {
        bordered,
        round
      },
      slots: {
        default: 'Shape tag'
      }
    });

    expect(wrapper.classes().includes('l-tag--borderless')).toBe(!bordered);
    expect(wrapper.classes().includes('l-tag--round')).toBe(round);
  });
});
