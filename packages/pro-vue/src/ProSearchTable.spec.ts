import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProSearchTable from './ProSearchTable.vue';
import type { ProSearchTableRequest } from './types';

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
      data: [{ name: String(formValues.keyword || '') }],
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
    await wrapper.find('button').trigger('click');
    await waitFor(20);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0].formValues.keyword).toBe('cute');
    expect(wrapper.text()).toContain('cute');
  });

  it('retries request when configured', async () => {
    let count = 0;
    const request = vi.fn(async () => {
      count += 1;
      if (count === 1) {
        throw new Error('temporary');
      }
      return { data: [{ name: 'ok' }], total: 1 };
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
});
