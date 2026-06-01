import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LBadge } from './components/Badge';

describe('LBadge', () => {
  it('applies the status class', () => {
    const wrapper = mount(LBadge, {
      props: {
        status: 'success'
      }
    });

    expect(wrapper.classes()).toContain('l-badge');
    expect(wrapper.classes()).toContain('l-badge--success');
  });

  it('renders dot mode with slotted content and prioritizes the dot over text', () => {
    const wrapper = mount(LBadge, {
      props: {
        status: 'processing',
        text: 'Queued',
        dot: true
      },
      slots: {
        default: '<button type="button">Inbox</button>'
      }
    });

    expect(wrapper.find('.l-badge__content').text()).toContain('Inbox');
    expect(wrapper.find('.l-badge__dot').exists()).toBe(true);
    expect(wrapper.find('.l-badge__text').exists()).toBe(false);
  });

  it('renders text when dot mode is disabled', () => {
    const wrapper = mount(LBadge, {
      props: {
        status: 'warning',
        text: 'Pending'
      }
    });

    expect(wrapper.find('.l-badge__text').text()).toBe('Pending');
  });
});
