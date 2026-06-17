import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LTable } from './components/Table';

const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name' },
  { key: 'role', title: '角色', dataIndex: 'role', align: 'center' as const },
  { key: 'city', title: '城市', dataIndex: 'city', align: 'right' as const }
];

const dataSource = [
  { id: 'u-1', name: '小满', role: '研究员', city: '杭州' },
  { id: 'u-2', name: '阿橙', role: '设计师', city: '上海' },
  { id: 'u-3', name: '阿远', role: '工程师', city: '深圳' }
];

describe('LTable', () => {
  it('renders headers and rows from columns and dataSource', () => {
    const wrapper = mount(LTable, {
      props: {
        columns,
        dataSource,
        rowKey: 'id'
      }
    });

    expect(wrapper.findAll('thead th')).toHaveLength(3);
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
    expect(wrapper.findAll('tbody tr')[0].attributes('data-row-key')).toBe('u-1');
    expect(wrapper.text()).toContain('小满');
    expect(wrapper.text()).toContain('研究员');
    expect(wrapper.text()).toContain('深圳');
  });

  it('supports rowKey as a function', () => {
    const wrapper = mount(LTable, {
      props: {
        columns,
        dataSource,
        rowKey: (record: Record<string, unknown>, index: number) =>
          `${record.name as string}-${index}`
      }
    });

    expect(wrapper.findAll('tbody tr')[1].attributes('data-row-key')).toBe('阿橙-1');
  });

  it('renders loading state and empty state with slot fallback', () => {
    const loadingWrapper = mount(LTable, {
      props: {
        columns,
        dataSource: [],
        loading: true
      }
    });

    expect(loadingWrapper.text()).toContain('加载中');
    expect(loadingWrapper.findAll('tbody tr')).toHaveLength(1);

    const emptyWrapper = mount(LTable, {
      props: {
        columns,
        dataSource: []
      },
      slots: {
        empty: () => '没有数据啦'
      }
    });

    expect(emptyWrapper.text()).toContain('没有数据啦');
  });

  it('renders bodyCell slot content per cell', () => {
    const wrapper = mount(LTable, {
      props: {
        columns,
        dataSource: [dataSource[0]]
      },
      slots: {
        bodyCell: ({ column, value }) => `${column.key}:${String(value)}`
      }
    });

    expect(wrapper.text()).toContain('name:小满');
    expect(wrapper.text()).toContain('role:研究员');
    expect(wrapper.text()).toContain('city:杭州');
  });

  it('supports built-in pagination linkage', async () => {
    const wrapper = mount(LTable, {
      props: {
        columns,
        dataSource,
        rowKey: 'id',
        pagination: {
          pageSize: 1,
          total: 3,
          defaultCurrent: 1
        }
      }
    });

    expect(wrapper.text()).toContain('小满');
    expect(wrapper.text()).not.toContain('阿橙');
    expect(wrapper.findAll('.l-pagination__item')).toHaveLength(3);

    await wrapper.find('.l-pagination__nav--next').trigger('click');

    expect(wrapper.text()).toContain('阿橙');
    expect(wrapper.text()).not.toContain('小满');
    expect(wrapper.find('[aria-current="page"]').text()).toBe('2');
  });

  it('cycles sortable headers through ascend, descend, and cleared states', async () => {
    const wrapper = mount(LTable as any, {
      props: {
        columns: [
          { key: 'name', title: '姓名', dataIndex: 'name', sortable: true },
          { key: 'role', title: '角色', dataIndex: 'role' }
        ],
        dataSource,
        rowKey: 'id'
      }
    });

    await wrapper.find('[data-column-key="name"]').trigger('click');
    expect(wrapper.emitted('update:sortState')?.at(-1)?.[0]).toEqual({
      columnKey: 'name',
      order: 'ascend'
    });

    await wrapper.find('[data-column-key="name"]').trigger('click');
    expect(wrapper.emitted('update:sortState')?.at(-1)?.[0]).toEqual({
      columnKey: 'name',
      order: 'descend'
    });

    await wrapper.find('[data-column-key="name"]').trigger('click');
    expect(wrapper.emitted('update:sortState')?.at(-1)?.[0]).toBeUndefined();
  });

  it('supports current-page row selection and skips disabled rows on select-all', async () => {
    const wrapper = mount(LTable as any, {
      props: {
        columns,
        dataSource,
        rowKey: 'id',
        pagination: {
          pageSize: 2,
          total: 3,
          defaultCurrent: 1
        },
        rowSelection: {
          getDisabled: (record: Record<string, unknown>) => record.id === 'u-2'
        }
      }
    });

    await wrapper.find('[data-testid="l-table-select-all"]').setValue(true);

    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(['u-1']);
    expect(wrapper.emitted('selectionChange')?.at(-1)?.[0]).toEqual(['u-1']);

    await wrapper.find('.l-pagination__nav--next').trigger('click');
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([]);

    await wrapper.find('[data-testid="l-table-row-select-u-3"]').setValue(true);
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(['u-3']);
  });

  it('preserves selected row keys across pagination when configured', async () => {
    const wrapper = mount(LTable as any, {
      props: {
        columns,
        dataSource,
        rowKey: 'id',
        pagination: {
          pageSize: 2,
          total: 3,
          defaultCurrent: 1
        },
        rowSelection: {
          preserveSelectedRowKeys: true
        }
      }
    });

    await wrapper.find('[data-testid="l-table-row-select-u-1"]').setValue(true);
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(['u-1']);

    await wrapper.find('.l-pagination__nav--next').trigger('click');
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(['u-1']);
  });
});
