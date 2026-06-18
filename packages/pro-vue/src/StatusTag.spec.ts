import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusTag from './StatusTag.vue';
import { commonStatusValueEnum, resolveValueEnumEntry } from './valueEnum';

describe('StatusTag', () => {
  it('renders text and color from the provided value enum', () => {
    const wrapper = mount(StatusTag, {
      props: {
        value: 'active',
        valueEnum: {
          active: {
            text: 'Active',
            color: 'success'
          }
        }
      }
    });

    expect(wrapper.text()).toContain('Active');
    expect(wrapper.find('.l-tag--success').exists()).toBe(true);
  });

  it('falls back to a direct text override before raw value output', () => {
    const wrapper = mount(StatusTag, {
      props: {
        value: 'inactive',
        text: 'Paused'
      }
    });

    expect(wrapper.text()).toContain('Paused');
    expect(wrapper.text()).not.toContain('inactive');
  });

  it('renders the fallback marker when the value is empty and no enum entry exists', () => {
    const wrapper = mount(StatusTag, {
      props: {
        value: undefined,
        fallback: 'N/A'
      }
    });

    expect(wrapper.text()).toContain('N/A');
  });

  it('supports packaged admin states with boolean normalization', () => {
    expect(resolveValueEnumEntry(true, commonStatusValueEnum)).toEqual({
      text: 'Enabled',
      color: 'success',
      tone: 'success',
      icon: 'check'
    });

    const wrapper = mount(StatusTag, {
      props: {
        value: true,
        valueEnum: commonStatusValueEnum
      }
    });

    expect(wrapper.text()).toContain('Enabled');
    expect(wrapper.find('.l-tag--success').exists()).toBe(true);
  });

  it('renders an optional icon and accepts tone as a semantic alias', () => {
    const wrapper = mount(StatusTag, {
      props: {
        value: 'processing',
        valueEnum: {
          processing: {
            text: 'Processing',
            tone: 'primary',
            icon: 'clock'
          }
        }
      }
    });

    expect(wrapper.text()).toContain('Processing');
    expect(wrapper.find('.l-tag--primary').exists()).toBe(true);
    expect(wrapper.get('[data-testid="status-tag-icon"]').attributes('data-icon')).toBe('clock');
  });
});
