import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { LUpload, type UploadFile } from './components/Upload';

const assignFiles = (input: HTMLInputElement, files: File[]): void => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files as unknown as FileList
  });
};

describe('LUpload', () => {
  it('adds files in uncontrolled mode and emits update:fileList', async () => {
    const wrapper = mount(LUpload);
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const file = new File(['hello'], 'cute.txt', { type: 'text/plain' });

    assignFiles(input, [file]);
    await wrapper.find('input[type="file"]').trigger('change');

    const payload = wrapper.emitted('update:fileList')?.at(-1)?.[0] as UploadFile[];
    expect(payload).toHaveLength(1);
    expect(payload[0]?.name).toBe('cute.txt');
    expect(wrapper.text()).toContain('cute.txt');
  });

  it('blocks files when beforeUpload returns false', async () => {
    const beforeUpload = vi.fn(() => false);
    const wrapper = mount(LUpload, {
      props: {
        beforeUpload
      }
    });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const file = new File(['hello'], 'blocked.txt', { type: 'text/plain' });

    assignFiles(input, [file]);
    await wrapper.find('input[type="file"]').trigger('change');

    expect(beforeUpload).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:fileList')).toBeUndefined();
    expect(wrapper.text()).not.toContain('blocked.txt');
  });

  it('calls customRequest and updates file status through callbacks', async () => {
    const customRequest = vi.fn((options: { onSuccess: () => void }) => {
      options.onSuccess();
    });
    const wrapper = mount(LUpload, {
      props: {
        customRequest
      }
    });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const file = new File(['hello'], 'server.txt', { type: 'text/plain' });

    assignFiles(input, [file]);
    await wrapper.find('input[type="file"]').trigger('change');
    await nextTick();

    expect(customRequest).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('done');
  });

  it('enforces maxCount when multiple files are selected', async () => {
    const wrapper = mount(LUpload, {
      props: {
        multiple: true,
        maxCount: 2
      }
    });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const files = [
      new File(['1'], 'one.txt', { type: 'text/plain' }),
      new File(['2'], 'two.txt', { type: 'text/plain' }),
      new File(['3'], 'three.txt', { type: 'text/plain' })
    ];

    assignFiles(input, files);
    await wrapper.find('input[type="file"]').trigger('change');

    const payload = wrapper.emitted('update:fileList')?.at(-1)?.[0] as UploadFile[];
    expect(payload).toHaveLength(2);
    expect(payload.map((item) => item.name)).toEqual(['one.txt', 'two.txt']);
  });

  it('keeps controlled fileList stable until parent updates props and emits remove', async () => {
    const Root = defineComponent({
      components: { LUpload },
      setup() {
        const files = ref<UploadFile[]>([
          {
            uid: 'cute-1',
            name: 'cute.txt',
            status: 'done'
          }
        ]);

        return { files };
      },
      template: `
        <LUpload :file-list="files" @remove="files = []" />
      `
    });

    const wrapper = mount(Root);
    expect(wrapper.text()).toContain('cute.txt');

    await wrapper.find('.l-upload-item__remove').trigger('click');
    await nextTick();

    expect(wrapper.text()).not.toContain('cute.txt');
  });

  it('respects disabled state', async () => {
    const wrapper = mount(LUpload, {
      props: {
        disabled: true
      }
    });

    const trigger = wrapper.find('.l-upload__trigger');
    const input = wrapper.find('input[type="file"]');

    expect(trigger.attributes('disabled')).toBeDefined();
    expect(input.attributes('disabled')).toBeDefined();
  });
});
