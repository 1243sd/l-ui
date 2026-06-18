import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProBatchActionBar from './ProBatchActionBar.vue';
import type { ProBulkActionContext } from './types';

const waitFor = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
type BatchRow = { id: string; name?: string };

describe('ProBatchActionBar', () => {
  it('shows the empty batch state and disables actions before any rows are selected', () => {
    const wrapper = mount(ProBatchActionBar, {
      props: {
        actions: [
          {
            key: 'archive',
            label: 'Archive',
            onClick: async () => {}
          }
        ]
      }
    });

    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('批量待命');
    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('选中后启用');
    expect(wrapper.html()).not.toContain('data-testid="pro-batch-action-clear"');
    expect(wrapper.get('[data-testid="pro-bulk-action-archive"]').attributes('disabled')).toBeDefined();
  });

  it('renders selected count, supports description override, and clears selection on demand', async () => {
    const clearSelection = vi.fn();
    const wrapper = mount(ProBatchActionBar, {
      props: {
        selectedRowKeys: ['row-1', 'row-2'],
        selectedRows: [{ id: 'row-1' }, { id: 'row-2' }],
        description: 'Ready for archive',
        clearSelection
      }
    });

    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('2 项已选');
    expect(wrapper.get('[data-testid="pro-selection-hint"]').text()).toContain('Ready for archive');
    expect(wrapper.html()).toContain('data-testid="pro-batch-action-clear"');

    await wrapper.get('[data-testid="pro-batch-action-clear"]').trigger('click');

    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it('keeps actions disabled until rows are selected and reflects loading callbacks', async () => {
    const wrapper = mount(ProBatchActionBar, {
      props: {
        loading: true,
        actions: [
          {
            key: 'archive',
            label: 'Archive',
            onClick: async () => {}
          }
        ]
      }
    });

    expect(wrapper.get('[data-testid="pro-bulk-action-archive"]').attributes('disabled')).toBeDefined();

    await wrapper.setProps({
      loading: false,
      selectedRowKeys: ['row-1'],
      selectedRows: [{ id: 'row-1', name: 'Alpha' }],
      actions: [
        {
          key: 'archive',
          label: 'Archive',
          disabled: (context: ProBulkActionContext<BatchRow>) =>
            context.selectedRows[0]?.name === 'Alpha',
          onClick: async () => {}
        },
        {
          key: 'export',
          label: 'Export',
          loading: (context: ProBulkActionContext<BatchRow>) =>
            context.selectedRowKeys.length === 1,
          onClick: async () => {}
        }
      ]
    });

    expect(wrapper.get('[data-testid="pro-bulk-action-archive"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-testid="pro-bulk-action-export"]').classes()).toContain('is-loading');
  });

  it('runs a bulk action with selection context and refreshes plus clears selection by default', async () => {
    const onClick = vi.fn(async (_context: ProBulkActionContext<BatchRow>) => {});
    const refresh = vi.fn(async () => {});
    const clearSelection = vi.fn();

    const wrapper = mount(ProBatchActionBar, {
      props: {
        selectedRowKeys: ['row-1'],
        selectedRows: [{ id: 'row-1', name: 'Alice' }],
        sortState: { columnKey: 'name', order: 'ascend' },
        clearSelection,
        refresh,
        actions: [
          {
            key: 'archive',
            label: 'Archive',
            onClick
          }
        ]
      }
    });

    await wrapper.get('[data-testid="pro-bulk-action-archive"]').trigger('click');
    await waitFor(0);

    const [firstCall] = onClick.mock.calls as [ProBulkActionContext<BatchRow>][];
    const context = firstCall?.[0];

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(context).toBeDefined();
    expect(context).toMatchObject({
      selectedRowKeys: ['row-1'],
      selectedRows: [{ id: 'row-1', name: 'Alice' }],
      sortState: { columnKey: 'name', order: 'ascend' }
    });
    expect(typeof context?.refresh).toBe('function');
    expect(typeof context?.clearSelection).toBe('function');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it('honors action-level refresh and clear-selection opt outs', async () => {
    const onClick = vi.fn(async (_context: ProBulkActionContext<BatchRow>) => {});
    const refresh = vi.fn(async () => {});
    const clearSelection = vi.fn();

    const wrapper = mount(ProBatchActionBar, {
      props: {
        selectedRowKeys: ['row-1'],
        selectedRows: [{ id: 'row-1' }],
        clearSelection,
        refresh,
        actions: [
          {
            key: 'keep',
            label: 'Keep state',
            refreshOnSuccess: false,
            clearSelectionOnSuccess: false,
            onClick
          }
        ]
      }
    });

    await wrapper.get('[data-testid="pro-bulk-action-keep"]').trigger('click');
    await waitFor(0);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
    expect(clearSelection).not.toHaveBeenCalled();
  });
});
