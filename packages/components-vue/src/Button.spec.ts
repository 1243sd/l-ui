import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { LButton } from './components/Button';
import { LConfigProvider } from './components/ConfigProvider';

describe('LButton', () => {
  it('renders slot and type class', () => {
    const wrapper = mount(LButton, {
      props: { type: 'primary' },
      slots: { default: 'Cute' }
    });

    expect(wrapper.text()).toContain('Cute');
    expect(wrapper.classes()).toContain('l-btn--primary');
  });

  it('uses componentSize from ConfigProvider when size is not provided', () => {
    const Root = defineComponent({
      components: { LButton, LConfigProvider },
      template: `
        <LConfigProvider component-size="large">
          <LButton>Size</LButton>
        </LConfigProvider>
      `
    });

    const wrapper = mount(Root);
    expect(wrapper.find('button').classes()).toContain('l-btn--large');
  });

  it('prevents click emit while loading', async () => {
    const wrapper = mount(LButton, {
      props: { loading: true }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
