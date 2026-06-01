import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { LTooltip } from './components/Tooltip';

describe('LTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens on hover and links aria-describedby', async () => {
    const wrapper = mount(LTooltip, {
      attachTo: document.body,
      props: {
        title: '柔和提示',
        teleported: false
      },
      slots: {
        default: '<button type="button">查看提示</button>'
      }
    });

    const trigger = wrapper.find('.l-overlay-trigger');
    await trigger.trigger('mouseenter');

    expect(wrapper.find('.l-tooltip__overlay').text()).toContain('柔和提示');
    expect(trigger.attributes('aria-describedby')).toBeDefined();

    await trigger.trigger('mouseleave');

    expect(wrapper.find('.l-tooltip__overlay').exists()).toBe(false);
  });

  it('renders into document.body when teleported is true', async () => {
    const wrapper = mount(LTooltip, {
      attachTo: document.body,
      props: {
        title: '浮到 body',
        teleported: true
      },
      slots: {
        default: '<button type="button">查看提示</button>'
      }
    });

    await wrapper.find('.l-overlay-trigger').trigger('mouseenter');

    expect(document.body.textContent).toContain('浮到 body');
    expect(wrapper.find('.l-tooltip__overlay').exists()).toBe(false);
  });
});
