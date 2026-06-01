import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { LTabPane, LTabs } from './components/Tabs';

const tabItems = [
  { key: 'overview', label: '概览' },
  { key: 'archive', label: '归档', disabled: true },
  { key: 'notes', label: '便签' }
];

describe('LTabs', () => {
  it('renders items mode and switches active panels by click', async () => {
    const wrapper = mount(LTabs, {
      props: {
        items: tabItems,
        defaultActiveKey: 'overview'
      },
      slots: {
        'pane-overview': '<div>概览内容</div>',
        'pane-notes': '<div>便签内容</div>'
      }
    });

    expect(wrapper.find('[role="tabpanel"]').text()).toContain('概览内容');

    await wrapper.findAll('[role="tab"]')[2].trigger('click');

    expect(wrapper.emitted('update:activeKey')?.at(-1)?.[0]).toBe('notes');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('notes');
    expect(
      wrapper
        .findAll('[role="tabpanel"]')
        .find((panel) => panel.attributes('hidden') === undefined)
        ?.text()
    ).toContain('便签内容');
  });

  it('supports keyboard navigation and skips disabled tabs', async () => {
    const wrapper = mount(LTabs, {
      props: {
        items: tabItems,
        defaultActiveKey: 'overview'
      },
      attachTo: document.body,
      slots: {
        'pane-overview': '<div>概览内容</div>',
        'pane-notes': '<div>便签内容</div>'
      }
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[0].trigger('keydown', { key: 'ArrowRight' });

    expect(document.activeElement?.textContent).toContain('便签');
    expect(wrapper.emitted('update:activeKey')?.at(-1)?.[0]).toBe('notes');

    await tabs[2].trigger('keydown', { key: 'Home' });
    expect(document.activeElement?.textContent).toContain('概览');

    await tabs[0].trigger('keydown', { key: 'End' });
    expect(document.activeElement?.textContent).toContain('便签');
  });

  it('supports LTabPane mode and destroys inactive panels when requested', async () => {
    const wrapper = mount(LTabs, {
      props: {
        defaultActiveKey: 'timeline',
        destroyInactiveTabPane: true
      },
      slots: {
        default: `
          <LTabPane key="timeline" tab="时间线">
            <div>时间线面板</div>
          </LTabPane>
          <LTabPane key="assets" tab="素材库">
            <div>素材库面板</div>
          </LTabPane>
        `
      },
      global: {
        components: {
          LTabPane
        }
      }
    });

    expect(wrapper.text()).toContain('时间线面板');
    expect(wrapper.text()).not.toContain('素材库面板');

    await wrapper.findAll('[role="tab"]')[1].trigger('click');

    expect(wrapper.text()).not.toContain('时间线面板');
    expect(wrapper.text()).toContain('素材库面板');
  });

  it('warns and prefers LTabPane mode when items are mixed with panes', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const wrapper = mount(LTabs, {
      props: {
        items: tabItems
      },
      slots: {
        default: `
          <LTabPane key="timeline" tab="时间线">
            <div>时间线面板</div>
          </LTabPane>
        `
      },
      global: {
        components: {
          LTabPane
        }
      }
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(wrapper.text()).toContain('时间线面板');
    expect(wrapper.text()).not.toContain('概览');

    warnSpy.mockRestore();
  });

  it('generates unique aria ids across multiple tab instances', () => {
    const wrapper = mount(
      defineComponent({
        components: {
          LTabs
        },
        data: () => ({
          items: tabItems
        }),
        template: `
          <div>
            <LTabs :items="items" default-active-key="overview">
              <template #pane-overview>第一个概览</template>
              <template #pane-notes>第一个便签</template>
            </LTabs>
            <LTabs :items="items" default-active-key="overview">
              <template #pane-overview>第二个概览</template>
              <template #pane-notes>第二个便签</template>
            </LTabs>
          </div>
        `
      })
    );

    const tabIds = wrapper.findAll('[role="tab"]').map((tab) => tab.attributes('id'));
    const panelIds = wrapper.findAll('[role="tabpanel"]').map((panel) => panel.attributes('id'));

    expect(new Set(tabIds).size).toBe(tabIds.length);
    expect(new Set(panelIds).size).toBe(panelIds.length);
  });
});
