import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProSearchTable from './ProSearchTable.vue';
import type { ProSearchTableLifecycle, ProSearchTableRequest } from './types';

const waitFor = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ProSearchTable', () => {
  it('loads data on mount when autoQuery is true', async () => {
    const requestImpl: ProSearchTableRequest<Record<string, unknown>> = async () => ({
        data: [{ id: 1, name: 'A' }],
        total: 1
      });
    const request = vi.fn(requestImpl);

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
        request
      }
    });

    await waitFor(20);
    expect(request).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('A');
  });

  it('passes form values to request after search click', async () => {
    const request = vi.fn(async ({ formValues }) => ({
      data: [{ id: 'row-1', name: String(formValues.keyword || '') }],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
        request
      }
    });

    await wrapper.find('input').setValue('cute');
    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].formValues.keyword).toBe('cute');
    expect(wrapper.text()).toContain('cute');
  });

  it('does not auto-query on text input, but submits on Enter', async () => {
    const request = vi.fn(async ({ queryValues }) => ({
      data: [{ id: 'row-1', name: String(queryValues.keyword || '') }],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
        request
      }
    });

    await wrapper.get('.l-input').setValue('violet');
    expect(request).toHaveBeenCalledTimes(0);

    await wrapper.get('.l-input').trigger('keydown', { key: 'Enter' });
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].queryValues.keyword).toBe('violet');
  });

  it('passes queryValues built from schema defaults to request', async () => {
    const request = vi.fn(async ({ queryValues }) => ({
      data: [{ id: 'row-1', name: JSON.stringify(queryValues) }],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [
          { name: 'keyword', label: 'Keyword', type: 'text', defaultValue: 'violet' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Enabled', value: true }],
            defaultValue: true
          },
          {
            name: 'releasedAt',
            label: 'Release date',
            type: 'date',
            defaultValue: '2026-05-26'
          },
          {
            name: 'window',
            label: 'Window',
            type: 'dateRange',
            defaultValue: ['2026-06-01', '2026-06-08']
          },
          {
            name: 'region',
            label: 'Region',
            type: 'cascader',
            options: [{ label: 'Zhejiang', value: 'zhejiang' }],
            defaultValue: ['zhejiang']
          }
        ],
        request
      }
    });

    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].queryValues).toEqual({
      keyword: 'violet',
      status: true,
      releasedAt: '2026-05-26',
      window: ['2026-06-01', '2026-06-08'],
      region: ['zhejiang']
    });
  });

  it('blocks duplicate query keys before request execution', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const request = vi.fn(async () => ({ data: [], total: 0 }));

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [
          {
            name: 'keyword',
            label: 'Keyword',
            type: 'text',
            defaultValue: 'violet',
            toQuery: (value: string) => ({ q: value })
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Enabled', value: true }],
            defaultValue: true,
            toQuery: (value: string | number | boolean | undefined) => ({ q: value })
          }
        ],
        request
      }
    });

    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(request).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      '[ProSearchTable] Duplicate query key "q" from "keyword" and "status".'
    );
  });

  it('renders search schema with Lolita field primitives', async () => {
    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [
          { name: 'keyword', label: 'Keyword', type: 'text' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Enabled', value: true }]
          },
          {
            name: 'releasedAt',
            label: 'Release date',
            type: 'date'
          },
          {
            name: 'window',
            label: 'Window',
            type: 'dateRange'
          },
          {
            name: 'region',
            label: 'Region',
            type: 'cascader',
            options: [{ label: 'Zhejiang', value: 'zhejiang' }]
          }
        ],
        request: async () => ({ data: [], total: 0 })
      }
    });

    expect(wrapper.find('.l-form').exists()).toBe(true);
    expect(wrapper.findAll('.l-form-item')).toHaveLength(4);
    expect(wrapper.get('[data-testid="pro-search-summary"]').text()).toContain('4/5 常用');
    expect(wrapper.text()).toContain('高级待展开');
    expect(wrapper.text()).toContain('+1');
    expect(wrapper.get('[data-testid="pro-search-toggle"]').attributes('aria-expanded')).toBe(
      'false'
    );
    expect(wrapper.find('.l-input-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-select-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-date-picker-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-date-range-picker-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-cascader-wrapper').exists()).toBe(false);

    await wrapper.get('[data-testid="pro-search-toggle"]').trigger('click');

    expect(wrapper.findAll('.l-form-item')).toHaveLength(5);
    expect(wrapper.get('[data-testid="pro-search-summary"]').text()).toContain('5 项筛选');
    expect(wrapper.find('.l-cascader-wrapper').exists()).toBe(true);
  });

  it('surfaces hidden active filters before advanced search is expanded', async () => {
    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [
          { name: 'keyword', label: 'Keyword', type: 'text' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Enabled', value: true }]
          },
          { name: 'releasedAt', label: 'Release date', type: 'date' },
          { name: 'window', label: 'Window', type: 'dateRange' },
          {
            name: 'region',
            label: 'Region',
            type: 'cascader',
            options: [{ label: 'Zhejiang', value: 'zhejiang' }],
            defaultValue: ['zhejiang']
          },
          {
            name: 'owner',
            label: 'Owner',
            type: 'text',
            defaultValue: 'Eve'
          }
        ],
        request: async () => ({ data: [], total: 0 })
      }
    });

    expect(wrapper.text()).toContain('高级已生效');
    expect(wrapper.text()).toContain('2');
    expect(wrapper.get('[data-testid="pro-search-toggle"]').text()).toContain('高级');
    expect(wrapper.get('[data-testid="pro-search-toggle"]').text()).toContain('2');
  });

  it('retries request when configured', async () => {
    let count = 0;
    const request = vi.fn(async () => {
      count += 1;
      if (count === 1) {
        throw new Error('temporary');
      }
      return { data: [{ id: 'row-1', name: 'ok' }], total: 1 };
    });

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request,
        retries: 1,
        retryDelay: 0
      }
    });

    await waitFor(60);
    expect(request).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('ok');
  });

  it('reflects lifecycle-adjusted pagination in the rendered meta state', async () => {
    const requestImpl: ProSearchTableRequest<Record<string, unknown>> = async ({
      queryValues
    }) => ({
      data: [{ id: 'row-1', name: String(queryValues.keyword ?? '') }],
      total: 5
    });
    const request = vi.fn(requestImpl);
    const lifecycle: ProSearchTableLifecycle<Record<string, unknown>> = {
      beforeQuery: async (payload) => ({
        ...payload,
        pagination: {
          current: 2,
          pageSize: 2
        },
        queryValues: {
          ...payload.queryValues,
          keyword: 'beta'
        }
      })
    };

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text', defaultValue: 'alpha' }],
        lifecycle,
        request
      }
    });

    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].pagination.current).toBe(2);
    expect(request.mock.calls[0][0].queryValues.keyword).toBe('beta');
    expect(wrapper.text()).toContain('beta');
    expect(wrapper.text()).toContain('第 2/3 页');
  });

  it('uses row id as the default row key when every row has a primitive id', async () => {
    const request = vi.fn(async () => ({
      data: [{ id: 'user-1', name: 'Alice' }],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request
      }
    });

    await waitFor(20);

    expect(wrapper.find('[data-row-key="user-1"]').exists()).toBe(true);
  });

  it('warns and blocks row rendering when rowKey is missing and rows have no primitive id', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const request = vi.fn(async () => ({
      data: [{ name: 'Alice' }],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request
      }
    });

    await waitFor(20);

    expect(warn).toHaveBeenCalledWith(
      '[ProSearchTable] rowKey is required when rows do not expose a primitive "id".'
    );
    expect(wrapper.text()).not.toContain('Alice');
  });

  it('refreshes after a successful row action by default and can opt out', async () => {
    const request = vi
      .fn<ProSearchTableRequest<Record<string, unknown>>>()
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Alpha' }],
        total: 1
      })
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Beta' }],
        total: 1
      });

    const refreshingAction = vi.fn(async () => {});
    const passiveAction = vi.fn(async () => {});

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request,
        rowActions: [
          {
            key: 'refresh',
            label: 'Refresh',
            onClick: refreshingAction
          },
          {
            key: 'stay',
            label: 'Stay',
            refreshOnSuccess: false,
            onClick: passiveAction
          }
        ]
      }
    });

    await waitFor(20);
    expect(request).toHaveBeenCalledTimes(1);

    await wrapper.findAll('.l-pro-table__row-actions .l-btn')[0].trigger('click');
    await waitFor(20);

    expect(refreshingAction).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('Beta');

    await wrapper.findAll('.l-pro-table__row-actions .l-btn')[1].trigger('click');
    await waitFor(20);

    expect(passiveAction).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('re-queries with sortState when a sortable header is toggled', async () => {
    const request = vi.fn(async ({ sortState }) => ({
      data: [
        {
          id: 'row-1',
          name: sortState ? `${sortState.columnKey}:${sortState.order}` : 'unsorted'
        }
      ],
      total: 1
    }));

    const wrapper = mount(ProSearchTable, {
      props: {
        autoQuery: false,
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name', sortable: true }],
        request
      }
    });

    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(request.mock.calls[0][0].sortState).toBeUndefined();
    expect(wrapper.text()).toContain('unsorted');

    await wrapper.get('[data-column-key="name"]').trigger('click');
    await waitFor(20);

    expect(request.mock.calls[1][0].sortState).toEqual({
      columnKey: 'name',
      order: 'ascend'
    });
    expect(wrapper.text()).toContain('name:ascend');
  });

  it('drives bulk actions from selected rows and refreshes plus clears selection by default', async () => {
    const request = vi
      .fn<ProSearchTableRequest<Record<string, unknown>>>()
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Alpha' }],
        total: 1
      })
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Beta' }],
        total: 1
      });
    const bulkAction = vi.fn(async () => {});

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request,
        rowSelection: {},
        bulkActions: [
          {
            key: 'archive',
            label: 'Archive',
            onClick: bulkAction
          }
        ]
      }
    });

    await waitFor(20);

    const actionButton = wrapper.get('[data-testid="pro-bulk-action-archive"]');
    expect(actionButton.attributes('disabled')).toBeDefined();

    await wrapper.get('[data-testid="l-table-row-select-row-1"]').setValue(true);
    expect(wrapper.get('[data-testid="pro-bulk-action-archive"]').attributes('disabled')).toBeUndefined();

    await wrapper.get('[data-testid="pro-bulk-action-archive"]').trigger('click');
    await waitFor(20);

    expect(bulkAction).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('Beta');
    expect(
      (wrapper.get('[data-testid="l-table-row-select-row-1"]').element as HTMLInputElement).checked
    ).toBe(false);
  });

  it('separates selection context from toolbar actions for dense admin workflows', async () => {
    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        request: async () => ({
          data: [{ id: 'row-1', name: 'Alpha' }],
          total: 1
        }),
        rowSelection: {},
        bulkActions: [
          {
            key: 'archive',
            label: 'Archive',
            onClick: async () => {}
          }
        ],
        toolbar: [
          {
            key: 'create',
            label: 'Create',
            type: 'primary',
            onClick: async () => {}
          }
        ]
      }
    });

    await waitFor(20);

    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('批量待命');
    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('选中后启用');
    expect(wrapper.get('[data-testid="pro-bulk-action-archive"]').classes()).toContain(
      'l-btn--dashed'
    );
    expect(wrapper.find('.l-pro-table__toolbar-actions .l-btn--primary').exists()).toBe(true);

    await wrapper.get('[data-testid="l-table-row-select-row-1"]').setValue(true);

    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('1 项已选');
  });

  it('keeps previous rows visible when a follow-up query fails and retries from the error surface', async () => {
    const request = vi
      .fn<ProSearchTableRequest<Record<string, unknown>>>()
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Alpha' }],
        total: 1
      })
      .mockRejectedValueOnce(new Error('Injected QA error'))
      .mockResolvedValueOnce({
        data: [{ id: 'row-1', name: 'Beta' }],
        total: 1
      });

    const wrapper = mount(ProSearchTable, {
      props: {
        columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
        searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
        request,
        rowSelection: {}
      }
    });

    await waitFor(20);
    expect(wrapper.text()).toContain('Alpha');
    await wrapper.get('[data-testid="l-table-row-select-row-1"]').setValue(true);

    await wrapper.get('.l-input').setValue('violet');
    await wrapper.get('[data-testid="pro-search-submit"]').trigger('click');
    await waitFor(20);

    expect(wrapper.text()).toContain('Alpha');
    expect(wrapper.text()).toContain('请求失败，请重试。');
    expect(
      (wrapper.get('[data-testid="l-table-row-select-row-1"]').element as HTMLInputElement).checked
    ).toBe(true);

    await wrapper.get('[data-testid="pro-search-retry"]').trigger('click');
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(3);
    expect(wrapper.text()).toContain('Beta');
  });
});
