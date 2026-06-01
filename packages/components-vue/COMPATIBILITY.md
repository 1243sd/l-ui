# @lolita-ui/components-vue Compatibility Notes

## M0 基础能力

### ConfigProvider
- 已对齐：`themeMode`（`light` / `dark`）、provider-slot 模式、`prefixCls`、`componentSize`。
- 差异：暂未提供 `locale`、`direction`、全局校验文案等配置。

### ThemeProvider
- 已对齐：主题 provider 包装、`mode / overrides / autoApply` 概念。
- 差异：当前更多是 `@lolita-ui/theme` 的透传包装，没有做子树级主题隔离。

### Button (`LButton`)
- 已对齐：`type`、`size`、`danger`、`loading`、`disabled`、`block`、点击事件。
- 差异：M0 只提供 `round`，没有完整 `shape` 枚举。

### Space (`LSpace`)
- 已对齐：`size`、`direction`、`align`、`wrap`、`split` slot。
- 差异：未覆盖 compact 模式与 item 级样式覆写。

## M1 表单核心

### Input (`LInput`)
- 已对齐：`v-model:value`、`defaultValue`、`disabled`、`allowClear`、`status`、尺寸继承。
- 已对齐：`change / focus / blur` 事件。
- 差异：当前只做文本类输入，不含 prefix / suffix、密码框、textarea 等扩展形态。
- 差异：`change` 事件签名是 `(value, event)`，便于业务直接取值。

### Form / FormItem (`LForm`, `LFormItem`)
- 已对齐：`model + rules` 校验链路、`name` 绑定、`validate()`、`resetFields()`。
- 已对齐：`FormItem` 的 `label`、必填标记、错误提示、子组件状态联动、`valuePropName="checked"`。
- 已对齐：动态 `name` 重注册，校验会跟随当前字段 key。
- 差异：暂未覆盖 `layout`、`labelCol`、`wrapperCol`、`validateTrigger` 等布局与触发策略。

### Select (`LSelect`)
- 已对齐：`v-model:value`、`defaultValue`、`options`、`disabled`、`allowClear`、`size`、`placeholder`、`status`。
- 已对齐：单选、多选、`showSearch` 本地过滤、`searchValue` / `defaultSearchValue`、`update:searchValue` / `search`、`filterOption=false` 的远程搜索口子、`loading`、`notFoundContent`。
- 已对齐：受控 / 非受控、展开 / 收起、键盘导航、远程结果更新后的高亮项重同步、与 `FormItem` 的 `status` 联动。
- 差异：`tags` 模式、虚拟滚动、复杂远程数据编排和更丰富的选择器变体仍未覆盖。

### Checkbox (`LCheckbox`)
- 已对齐：`checked` / `defaultChecked`、`disabled`、`indeterminate`、`status`、`update:checked`。
- 已对齐：通过 `valuePropName="checked"` 接入 `FormItem`。
- 差异：`CheckboxGroup`、描述型插槽和原生表单扩展语义未纳入当前范围。

### Radio / RadioGroup (`LRadio`, `LRadioGroup`)
- 已对齐：单个 Radio 的 `checked` / `defaultChecked`，以及 Group 的 `value` / `defaultValue`、`options`、`disabled`、`name`、`status`。
- 已对齐：受控 Group 会保留父级传入的 `undefined` 无选中态，不会漂移成内部值。
- 差异：`RadioButton` 视觉变体和更复杂布局未覆盖。

### Switch (`LSwitch`)
- 已对齐：`checked` / `defaultChecked`、`disabled`、`status`、`update:checked`、`role="switch"`。
- 已对齐：通过 `valuePropName="checked"` 接入 `FormItem`。
- 差异：当前未暴露原生 checkbox 提交语义，也没有 `checkedChildren`、`unCheckedChildren`、`loading`、尺寸变体。

## M2 导航与浮层

### Tabs / TabPane (`LTabs`, `LTabPane`)
- 已对齐：`activeKey` / `defaultActiveKey`、`items` 模式、`LTabPane` 模式、`destroyInactiveTabPane`、键盘切换、disabled 跳过。
- 已对齐：支持 `pane-${key}` 内容插槽，以及 `TabPane` 结构化内容承载。
- 差异：若同时传 `items` 和 `LTabPane`，当前会 warning 并优先 `LTabPane`，不做混合合并。
- 差异：未覆盖可编辑 tabs、垂直模式、卡片模式、额外操作区、动画和溢出滚动。

### Menu (`LMenu`)
- 已对齐：单层 `items`、`selectedKeys` / `defaultSelectedKeys`、`vertical` / `horizontal`、roving focus、`Enter / Space / Home / End`。
- 已对齐：disabled 项跳过和选中阻断。
- 差异：`selectedKeys` 对外是数组签名，但当前只实现单选语义。
- 差异：未覆盖 `SubMenu`、多层菜单、`multiple`、`openKeys`、折叠态。

### Tooltip (`LTooltip`)
- 已对齐：`open` / `defaultOpen`、`hover` / `focus`、四向 `placement`、`disabled`、`teleported`。
- 已对齐：`aria-describedby` 关联。
- 差异：未覆盖点击触发、自动翻转、碰撞检测、复杂 overlay 内容。

### Popover (`LPopover`)
- 已对齐：`open` / `defaultOpen`、`click` / `hover`、`title` / `content`、外部点击关闭、`teleported`。
- 已对齐：受控模式下只 emit，不擅自改父级状态。
- 差异：未覆盖复杂内容交互、延迟开关、自动定位避让。

### Dropdown (`LDropdown`)
- 已对齐：`menuItems`、`open` / `defaultOpen`、`click` / `hover`、`ArrowDown` 进入首个菜单项、选择后关闭、`teleported`。
- 已对齐：复用 `LMenu` 的 disabled 跳过与键盘游走。
- 差异：未覆盖自定义 overlay、级联菜单、右键菜单、split button。

### Modal (`LModal`)
- 已对齐：`open` / `defaultOpen`、`closable`、`maskClosable`、`keyboard`、`destroyOnClose`、`width`、`teleported`。
- 已对齐：焦点进入、关闭后回到触发器、body 滚动锁定、`ok / cancel` 事件。
- 差异：未覆盖自定义 footer、异步确认、堆叠管理、丰富尺寸系统。

### Drawer (`LDrawer`)
- 已对齐：`open` / `defaultOpen`、`title`、`placement='left|right'`、`closable`、`maskClosable`、`keyboard`、`width`、`teleported`。
- 已对齐：焦点返回与 body 滚动锁定。
- 差异：未覆盖 `top / bottom`、push 行为、footer、自定义额外操作区。

## M3 数据展示

### Tag (`LTag`)
- 已对齐：语义色、`bordered`、`round`、default slot。
- 差异：暂未覆盖 `closable`、任意自定义颜色、图标位和可编辑标签。

### Badge (`LBadge`)
- 已对齐：语义状态、`text`、`dot`、default slot 包裹内容。
- 差异：当前只做状态徽标，不支持 `count / overflowCount` 与 `Ribbon`。

### Avatar (`LAvatar`)
- 已对齐：`src`、`alt`、尺寸继承、`shape`、`fallbackText`、default slot 回退。
- 差异：暂未覆盖图片错误回退、icon 头像与 `Avatar.Group`。

### Pagination (`LPagination`)
- 已对齐：`current / defaultCurrent`、`pageSize`、`total`、`disabled`、`update:current / change`。
- 已对齐：上一页 / 下一页 / 数字页码、受控 / 非受控边界保护。
- 差异：暂未覆盖 `showQuickJumper`、`showSizeChanger`、mini / simple 变体和总数文案扩展。

### Table (`LTable`)
- 已对齐：`columns`、`dataSource`、`rowKey`（string / function）、`loading`、`emptyText`、`pagination`、`bodyCell` / `empty` slots。
- 已对齐：内建分页联动与基础空态 / 加载态。
- 差异：暂未覆盖 `rowSelection`、`sorter`、`filters`、`expandable`、固定列、虚拟滚动。
- 差异：当前 `rowKey` 的字符串模式只做顶层字段直取，不支持点号路径。

### List (`LList`)
- 已对齐：`dataSource`、`loading`、`emptyText`、`split`、`renderItem` / `empty` slots。
- 已对齐：基础纵向列表容器与空态 / 加载态。
- 差异：暂未覆盖 `grid`、`loadMore`、无限滚动、header / footer / pagination。

## M4 复杂组件

### DatePicker (`LDatePicker`)
- 已对齐：`value` / `defaultValue`、`placeholder`、`disabled`、`allowClear`、`format`、`status`、`update:value` / `change` / `openChange`。
- 已对齐：单日期面板开关、受控 / 非受控值、格式化显示、清空链路，以及与 `FormItem` 的错误态联动。
- 差异：当前明确只做单日期主链路；`RangePicker`、`showTime`、周/月选择、时区与国际化日历体系未纳入范围。

### Upload (`LUpload`)
- 已对齐：`fileList` / `defaultFileList`、`accept`、`multiple`、`disabled`、`maxCount`、`beforeUpload`、`customRequest`、`update:fileList` / `change` / `remove`。
- 已对齐：按钮触发上传、受控 / 非受控列表、`beforeUpload` 阻断、`customRequest` 钩子、移除文件和 `maxCount` 截断。
- 差异：当前不覆盖拖拽上传、分片上传、图片预览、目录上传和真实网络上传适配层。

### Tree (`LTree`)
- 已对齐：`treeData`、`selectedKeys` / `defaultSelectedKeys`、`expandedKeys` / `defaultExpandedKeys`、`disabled`、`update:selectedKeys` / `update:expandedKeys` / `select` / `expand`。
- 已对齐：单选树、展开 / 收起、受控 / 非受控同步、disabled 节点跳过，以及基础键盘导航。
- 差异：当前不覆盖 `checkable`、多选、拖拽、虚拟滚动、异步懒加载和树表复合能力。

### Cascader (`LCascader`)
- 已对齐：`value` / `defaultValue`、`options`、`placeholder`、`disabled`、`allowClear`、`status`、`update:value` / `change` / `openChange`。
- 已对齐：列式单路径级联选择、逐级展开、受控 / 非受控值、清空和 `FormItem` 状态联动。
- 差异：当前不覆盖多选、搜索、远程数据、复杂懒加载和自定义展示渲染体系。

### Transfer (`LTransfer`)
- 已对齐：`dataSource`、`targetKeys` / `defaultTargetKeys`、`selectedKeys`、`disabled`、`update:targetKeys` / `update:selectedKeys` / `change`。
- 已对齐：双栏列表映射、勾选状态、左右移动、受控 / 非受控同步，以及禁用项阻断。
- 差异：当前不覆盖搜索、分页、树穿梭、表格穿梭和自定义渲染器体系。
