# Choice Controls

`LCheckbox`, `LRadio`, `LRadioGroup`, and `LSwitch` cover the M1 choice-control baseline and integrate with `LFormItem` through `valuePropName="checked"` where needed.

## Example
```vue
<script setup lang="ts">
import { reactive } from 'vue';

const model = reactive({
  agree: false,
  flavor: 'strawberry',
  enabled: true
});
</script>

<template>
  <LForm :model="model">
    <LFormItem
      name="agree"
      label="Agreement"
      :rules="[{ required: true, message: 'Please accept terms' }]"
      valuePropName="checked"
    >
      <LCheckbox v-model:checked="model.agree">Agree to terms</LCheckbox>
    </LFormItem>

    <LFormItem name="flavor" label="Flavor">
      <LRadioGroup
        v-model:value="model.flavor"
        :options="[
          { label: 'Strawberry', value: 'strawberry' },
          { label: 'Vanilla', value: 'vanilla' }
        ]"
      />
    </LFormItem>

    <LFormItem name="enabled" label="Feature flag" valuePropName="checked">
      <LSwitch v-model:checked="model.enabled" />
    </LFormItem>
  </LForm>
</template>
```

## Checkbox Props
| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | `undefined` |
| `defaultChecked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` |

## Radio Props
| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | `undefined` |
| `defaultChecked` | `boolean` | `false` |
| `value` | `string \| number \| boolean` | `undefined` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | `undefined` |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` |

## RadioGroup Props
| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| number \| boolean` | `undefined` |
| `defaultValue` | `string \| number \| boolean` | `undefined` |
| `options` | `{ label: string; value: string \| number \| boolean; disabled?: boolean }[]` | `[]` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | `undefined` |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` |

## Switch Props
| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | `undefined` |
| `defaultChecked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` |

## Emits
- `LCheckbox`: `update:checked`, `change`
- `LRadio`: `update:checked`, `change`
- `LRadioGroup`: `update:value`, `change`
- `LSwitch`: `update:checked`, `change`

## Form Integration
- Use `valuePropName="checked"` for `LCheckbox` and `LSwitch` inside `LFormItem`.
- `LFormItem` injects `checked` or `value` back into the first field vnode and preserves child `onUpdate:*` handlers.
- Required validation for checked controls treats `true` as the accepted value and keeps error styling aligned with the field status classes.
- Current scope is model-driven form integration; `LSwitch` does not yet contribute a native checkbox field to HTML form submission.
