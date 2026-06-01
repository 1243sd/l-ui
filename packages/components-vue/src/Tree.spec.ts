import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { LTree, type TreeNode } from './components/Tree';

const treeData: TreeNode[] = [
  {
    key: 'team',
    title: 'Team',
    children: [
      { key: 'design', title: 'Design' },
      { key: 'engineering', title: 'Engineering', disabled: true }
    ]
  },
  {
    key: 'ops',
    title: 'Operations'
  }
];

describe('LTree', () => {
  it('expands and collapses nodes in uncontrolled mode', async () => {
    const wrapper = mount(LTree, {
      props: {
        treeData
      }
    });

    expect(wrapper.text()).not.toContain('Design');

    await wrapper.find('[data-tree-toggle="team"]').trigger('click');
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual(['team']);
    expect(wrapper.text()).toContain('Design');

    await wrapper.find('[data-tree-toggle="team"]').trigger('click');
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual([]);
    expect(wrapper.text()).not.toContain('Design');
  });

  it('selects a node and emits selected keys', async () => {
    const wrapper = mount(LTree, {
      props: {
        treeData,
        defaultExpandedKeys: ['team']
      }
    });

    await wrapper.find('[data-tree-node="design"]').trigger('click');

    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['design']);
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toEqual(['design']);
    expect(wrapper.find('[data-tree-node="design"]').classes()).toContain('l-tree-node--selected');
  });

  it('keeps controlled expanded keys stable until parent updates props', async () => {
    const wrapper = mount(LTree, {
      props: {
        treeData,
        expandedKeys: []
      }
    });

    await wrapper.find('[data-tree-toggle="team"]').trigger('click');

    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual(['team']);
    expect(wrapper.text()).not.toContain('Design');

    await wrapper.setProps({ expandedKeys: ['team'] });
    expect(wrapper.text()).toContain('Design');
  });

  it('skips disabled nodes in keyboard navigation', async () => {
    const flatTree: TreeNode[] = [
      { key: 'alpha', title: 'Alpha', disabled: true },
      { key: 'beta', title: 'Beta' },
      { key: 'gamma', title: 'Gamma' }
    ];

    const wrapper = mount(LTree, {
      props: {
        treeData: flatTree
      }
    });

    const tree = wrapper.find('.l-tree');
    await tree.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('[data-tree-node="beta"]').classes()).toContain('l-tree-node--active');

    await tree.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['beta']);
  });

  it('respects disabled state', async () => {
    const wrapper = mount(LTree, {
      props: {
        treeData,
        disabled: true
      }
    });

    await wrapper.find('[data-tree-toggle="team"]').trigger('click');

    expect(wrapper.emitted('update:expandedKeys')).toBeUndefined();
    expect(wrapper.text()).not.toContain('Design');
    expect(wrapper.find('.l-tree').classes()).toContain('l-tree--disabled');
  });
});
