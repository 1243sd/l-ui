import { describe, expect, it, vi } from 'vitest';
import { buildDefaultFormValues, serializeQueryValues } from './searchSchema';
import type { SearchFieldSchema } from './types';

describe('searchSchema helpers', () => {
  it('builds raw form values for all supported field kinds', () => {
    const schema: SearchFieldSchema[] = [
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
        name: 'region',
        label: 'Region',
        type: 'cascader',
        options: [
          {
            label: 'Zhejiang',
            value: 'zhejiang',
            children: [{ label: 'Hangzhou', value: 'hangzhou' }]
          }
        ],
        defaultValue: ['zhejiang', 'hangzhou']
      }
    ];

    expect(buildDefaultFormValues(schema)).toEqual({
      keyword: 'violet',
      status: true,
      releasedAt: '2026-05-26',
      region: ['zhejiang', 'hangzhou']
    });
  });

  it('serializes queryValues in schema order and blocks duplicate keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema: SearchFieldSchema[] = [
      {
        name: 'keyword',
        label: 'Keyword',
        type: 'text',
        toQuery: (value) => ({ q: value })
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [{ label: 'Enabled', value: true }],
        defaultValue: true,
        toQuery: (value) => ({ q: value })
      }
    ];

    const result = serializeQueryValues(schema, {
      keyword: 'violet',
      status: true
    });

    expect(result).toEqual({
      blocked: true,
      queryValues: {}
    });
    expect(warn).toHaveBeenCalledWith(
      '[ProSearchTable] Duplicate query key "q" from "keyword" and "status".'
    );
  });

  it('uses the default serializer when no toQuery hook is provided', () => {
    const schema: SearchFieldSchema[] = [
      { name: 'keyword', label: 'Keyword', type: 'text' },
      {
        name: 'region',
        label: 'Region',
        type: 'cascader',
        options: [{ label: 'Zhejiang', value: 'zhejiang' }]
      }
    ];

    expect(
      serializeQueryValues(schema, {
        keyword: 'mousse',
        region: ['zhejiang']
      })
    ).toEqual({
      blocked: false,
      queryValues: {
        keyword: 'mousse',
        region: ['zhejiang']
      }
    });
  });
});
