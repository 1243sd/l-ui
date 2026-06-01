import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { classNames } from '../utils/classNames';

export type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error';

export type UploadFile = {
  uid: string;
  name: string;
  status?: UploadFileStatus;
  size?: number;
  type?: string;
  raw?: File;
};

export type UploadRequestOptions = {
  file: File;
  onSuccess: () => void;
  onError: (error?: Error) => void;
};

const createUploadFile = (file: File, index: number, status: UploadFileStatus): UploadFile => ({
  uid: `${file.name}-${file.size}-${file.lastModified}-${index}`,
  name: file.name,
  status,
  size: file.size,
  type: file.type,
  raw: file
});

export const LUpload = defineComponent({
  name: 'LUpload',
  inheritAttrs: false,
  props: {
    fileList: {
      type: Array as PropType<UploadFile[] | undefined>,
      default: undefined
    },
    defaultFileList: {
      type: Array as PropType<UploadFile[]>,
      default: () => []
    },
    accept: {
      type: String,
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxCount: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    beforeUpload: {
      type: Function as PropType<(file: File) => boolean | Promise<boolean>>,
      default: undefined
    },
    customRequest: {
      type: Function as PropType<(options: UploadRequestOptions) => void>,
      default: undefined
    },
    buttonText: {
      type: String,
      default: 'Select file'
    }
  },
  emits: {
    'update:fileList': (fileList: UploadFile[]) => Array.isArray(fileList),
    change: (fileList: UploadFile[]) => Array.isArray(fileList),
    remove: (file: UploadFile) => file !== undefined
  },
  setup(props, { attrs, emit, slots }) {
    const isControlled = computed(() => props.fileList !== undefined);
    const internalFileList = ref<UploadFile[]>(props.defaultFileList);
    const inputRef = ref<HTMLInputElement | null>(null);

    const mergedFileList = computed<UploadFile[]>(() =>
      isControlled.value ? props.fileList ?? [] : internalFileList.value
    );

    const commitFileList = (nextFileList: UploadFile[]): void => {
      if (!isControlled.value) {
        internalFileList.value = nextFileList;
      }

      emit('update:fileList', nextFileList);
      emit('change', nextFileList);
    };

    const patchFileStatus = (uid: string, status: UploadFileStatus): void => {
      const nextFileList = mergedFileList.value.map((item) =>
        item.uid === uid ? { ...item, status } : item
      );
      commitFileList(nextFileList);
    };

    const handleRequest = (uploadFile: UploadFile): void => {
      if (!props.customRequest || !uploadFile.raw) {
        return;
      }

      props.customRequest({
        file: uploadFile.raw,
        onSuccess: () => patchFileStatus(uploadFile.uid, 'done'),
        onError: () => patchFileStatus(uploadFile.uid, 'error')
      });
    };

    const normalizeNextList = (current: UploadFile[], nextItems: UploadFile[]): UploadFile[] => {
      if (props.maxCount === undefined) {
        return [...current, ...nextItems];
      }

      return [...current, ...nextItems].slice(0, props.maxCount);
    };

    const onInputChange = async (event: Event): Promise<void> => {
      if (props.disabled) {
        return;
      }

      const target = event.target as HTMLInputElement | null;
      const files = Array.from(target?.files ?? []);
      if (files.length === 0) {
        return;
      }

      const accepted: UploadFile[] = [];
      for (const [index, file] of files.entries()) {
        if (props.beforeUpload) {
          const allowed = await props.beforeUpload(file);
          if (!allowed) {
            continue;
          }
        }

        accepted.push(createUploadFile(file, index, props.customRequest ? 'uploading' : 'done'));
      }

      if (accepted.length === 0) {
        if (target) {
          target.value = '';
        }
        return;
      }

      const nextFileList = normalizeNextList(mergedFileList.value, accepted);
      commitFileList(nextFileList);

      if (props.customRequest) {
        nextFileList
          .filter((item) => item.status === 'uploading')
          .forEach((item) => handleRequest(item));
      }

      if (target) {
        target.value = '';
      }
    };

    const onTriggerClick = (): void => {
      if (props.disabled) {
        return;
      }

      inputRef.value?.click();
    };

    const onRemove = (file: UploadFile): void => {
      if (props.disabled) {
        return;
      }

      const nextFileList = mergedFileList.value.filter((item) => item.uid !== file.uid);
      emit('remove', file);
      commitFileList(nextFileList);
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...wrapperAttrs } = attrs;

      return h(
        'div',
        {
          ...wrapperAttrs,
          class: ['l-upload', props.disabled && 'l-upload--disabled', attrsClass],
          style: attrsStyle
        },
        [
          h('input', {
            ref: inputRef,
            class: 'l-upload__input',
            type: 'file',
            accept: props.accept,
            multiple: props.multiple,
            disabled: props.disabled,
            onChange: onInputChange
          }),
          h(
            'button',
            {
              type: 'button',
              class: ['l-upload__trigger', 'l-btn', 'l-btn--dashed'],
              disabled: props.disabled,
              onClick: onTriggerClick
            },
            slots.default?.() ?? props.buttonText
          ),
          mergedFileList.value.length > 0
            ? h(
                'ul',
                {
                  class: 'l-upload__list'
                },
                mergedFileList.value.map((file) =>
                  h(
                    'li',
                    {
                      key: file.uid,
                      class: 'l-upload-item'
                    },
                    [
                      h('div', { class: 'l-upload-item__meta' }, [
                        h('span', { class: 'l-upload-item__name' }, file.name),
                        h(
                          'span',
                          {
                            class: classNames(
                              'l-upload-item__status',
                              file.status && `l-upload-item__status--${file.status}`
                            )
                          },
                          file.status ?? 'ready'
                        )
                      ]),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: ['l-upload-item__remove', 'l-field-affix-action'],
                          'aria-label': `Remove ${file.name}`,
                          disabled: props.disabled,
                          onClick: () => onRemove(file)
                        },
                        '×'
                      )
                    ]
                  )
                )
              )
            : null
        ]
      );
    };
  }
});

export const Upload = LUpload;
