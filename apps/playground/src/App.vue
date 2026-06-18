<script setup lang="ts">
import {
  LCascader,
  LAvatar,
  LBadge,
  LButton,
  LCheckbox,
  LConfigProvider,
  LDatePicker,
  LDateRangePicker,
  LDrawer,
  LDropdown,
  LForm,
  LFormItem,
  LInput,
  LList,
  LMenu,
  LModal,
  LPopover,
  LPagination,
  LRadio,
  LRadioGroup,
  LSelect,
  LSpace,
  LSwitch,
  LTable,
  LTag,
  LTabPane,
  LTabs,
  LTransfer,
  LTree,
  LTooltip,
  LThemeProvider,
  LUpload
} from '@lolita-ui/components-vue';
import type {
  CascaderOption,
  ComponentSize,
  InputStatus,
  SelectOption,
  TableColumn,
  TableSortState,
  TransferItem,
  TreeNode,
  UploadFile
} from '@lolita-ui/components-vue';
import {
  ProSearchTable,
  StatusTag,
  defineValueEnum,
  resolveValueEnumText,
  type ProBulkAction,
  type ProRowAction,
  type ProSearchTableRequest,
  type ProTableColumn,
  type SearchFieldSchema
} from '@lolita-ui/pro-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

type ShowcaseSection = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
};

type DemoRow = {
  id: number;
  name: string;
  role: string;
  city: string;
};

type ShowcaseTableRow = {
  id: string;
  name: string;
  role: string;
  status: string;
  city: string;
  releasedAt: string;
  region: string[];
};

const sections: ShowcaseSection[] = [
  {
    id: 'providers',
    label: '提供器',
    eyebrow: 'M0 基础',
    title: '配置提供器与主题提供器',
    summary: '通过根级配置驱动整页，再用局部主题岛演示局部覆盖能力。'
  },
  {
    id: 'button-space',
    label: '按钮 / 间距',
    eyebrow: 'M0 基础',
    title: '操作按钮与间距节奏',
    summary: '在同一条演示带里展示主按钮、次按钮、危险态、加载态和布局节奏。'
  },
  {
    id: 'input',
    label: '输入框',
    eyebrow: 'M1 表单核心',
    title: '文本输入与状态反馈',
    summary: '集中展示受控值、清空能力、禁用态，以及警告和错误样式。'
  },
  {
    id: 'form',
    label: '表单',
    eyebrow: 'M1 表单核心',
    title: '校验与字段联动',
    summary: '用一组紧凑表单演示提交、重置、勾选字段绑定和实时反馈。'
  },
  {
    id: 'select',
    label: '选择器',
    eyebrow: 'M1 表单核心',
    title: '单选、多选、搜索与远程搜索口子',
    summary: '把基础下拉、多选标签、本地搜索和远程搜索接入方式放在同一块区域里观察。'
  },
  {
    id: 'choice-controls',
    label: '选择控件',
    eyebrow: 'M1 表单核心',
    title: '多选框、单选框、单选组与开关',
    summary: '把单独使用和分组使用的选择控件放在同一套语言里对照展示。'
  },
  {
    id: 'tabs-menu',
    label: '标签页 / 菜单',
    eyebrow: 'M2 导航与浮层',
    title: '导航选中态与键盘模型',
    summary: '把 items 模式、TabPane 模式和菜单方向切换放在同一组里，集中观察导航语义。'
  },
  {
    id: 'floating-overlays',
    label: '轻浮层',
    eyebrow: 'M2 导航与浮层',
    title: '提示、气泡卡片与下拉菜单',
    summary: '聚焦 teleported、外部点击关闭、触发模式与菜单复用。'
  },
  {
    id: 'blocking-overlays',
    label: '阻断浮层',
    eyebrow: 'M2 导航与浮层',
    title: '弹窗与抽屉',
    summary: '集中验证焦点归还、滚动锁定、Esc 与遮罩关闭等阻断式浮层基础能力。'
  },
  {
    id: 'data-display-foundation',
    label: '数据展示基础',
    eyebrow: 'M3 数据展示',
    title: '标签、徽标、头像与分页',
    summary: '先把状态原子和分页契约放进展台，为后面的 Table / List 打底。'
  },
  {
    id: 'data-display-shells',
    label: '表格 / 列表',
    eyebrow: 'M3 数据展示',
    title: '表格与列表',
    summary: '把数据容器层和前面的状态原子合在一起，验证列表型界面是否已经能复用同一套语言。'
  },
  {
    id: 'date-picker',
    label: '日期选择器',
    eyebrow: 'M4 复杂组件',
    title: '单日期选择与表单联动',
    summary: '先把单日期选择、清空、状态反馈和表单联动做稳，再决定是否往 showTime 或 RangePicker 扩。'
  },
  {
    id: 'upload',
    label: '文件上传',
    eyebrow: 'M4 复杂组件',
    title: '按钮触发上传与文件列表状态',
    summary: '聚焦 beforeUpload、customRequest、移除和 maxCount，把 file-list 状态先打稳。'
  },
  {
    id: 'tree-cascader-transfer',
    label: '结构化选择',
    eyebrow: 'M4 复杂组件',
    title: '树选择、级联选择与穿梭框',
    summary: '这一组重点不是把功能做满，而是把层级路径、双栏搬运和受控状态边界先做清楚。'
  },
  {
    id: 'pro-search-table',
    label: '高级查询表格',
    eyebrow: 'M0 增强层',
    title: '配置驱动的查询表格',
    summary: '在增强层里展示搜索、分页、工具栏操作和行操作。'
  }
];

const qaSearchParams =
  typeof window === 'undefined'
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
const qaScenario = qaSearchParams.get('scenario') ?? '';
const qaTheme = qaSearchParams.get('theme') === 'dark' ? 'dark' : 'light';
const qaMotion = qaSearchParams.get('motion') === 'off' ? 'off' : 'on';
const qaSection = qaSearchParams.get('section') ?? '';
const qaScenarioSectionMap: Record<string, string> = {
  shell: sections[0]?.id ?? 'providers',
  'overlay-modal': 'blocking-overlays',
  'pro-basic': 'pro-search-table',
  'pro-error': 'pro-search-table',
  'tree-cascader-transfer': 'tree-cascader-transfer'
};
const initialSectionId = qaSection || qaScenarioSectionMap[qaScenario] || sections[0]?.id || 'providers';

const activeSection = ref(initialSectionId);
let sectionObserver: IntersectionObserver | undefined;

const componentSize = ref<ComponentSize>('middle');
const mode = ref<'light' | 'dark'>(qaTheme);
const inputValue = ref('棉花糖小径');
const inputStatus = ref<InputStatus>('default');
const inputDisabled = ref(false);
const selectValue = ref<string | undefined>('香草云朵');
const selectStatus = ref<InputStatus>('default');
const multipleSelectValues = ref<string[]>(['草莓奶霜', '海盐焦糖']);
const datePickerValue = ref<string | undefined>('2026-05-14');
const dateRangePickerValue = ref<[string, string] | undefined>(['2026-05-14', '2026-05-20']);
const datePickerStatus = ref<InputStatus>('default');
const uploadFileList = ref<UploadFile[]>([]);
const remoteSelectValue = ref<string | undefined>();
const remoteSearchValue = ref('');
const remoteLoading = ref(false);
const standaloneChecked = ref(true);
const standaloneRadioChecked = ref(false);
const radioValue = ref<string | undefined>('草莓');
const switchChecked = ref(true);
const itemsTabsActiveKey = ref('overview');
const paneTabsActiveKey = ref<string | undefined>('delivery');
const menuMode = ref<'vertical' | 'horizontal'>('vertical');
const menuSelectedKeys = ref<string[]>(['overview']);
const floatingTeleported = ref(true);
const popoverOpen = ref(false);
const dropdownSelection = ref('尚未选择');
const modalOpen = ref(qaScenario === 'overlay-modal');
const drawerOpen = ref(false);
const drawerPlacement = ref<'left' | 'right'>('right');
const blockingTeleported = ref(true);
const showcasePage = ref(2);
const providerIslandMode = ref<'light' | 'dark'>('light');
const providerIslandPulse = ref<'rose' | 'mint'>('rose');
const treeSelectedKeys = ref<string[]>(['design']);
const treeExpandedKeys = ref<string[]>(['team']);
const cascaderValue = ref<string[] | undefined>(['zhejiang', 'hangzhou', 'xihu']);
const transferTargetKeys = ref<string[]>(['beta']);
const transferSelectedKeys = ref<string[]>([]);
const proSelectedRowKeys = ref<string[]>([]);
const rootFormRef = ref<{ resetFields: () => void } | null>(null);
const proTableRef = ref<{ refresh: () => Promise<void> } | null>(null);
const formFeedback = ref('提交表单后，可以在这里看到完成和失败的反馈。');
let remoteSearchTimer: ReturnType<typeof setTimeout> | undefined;

const avatarIllustration =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="lolita-avatar-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff9fbc" />
          <stop offset="100%" stop-color="#7ed9ff" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="22" fill="url(#lolita-avatar-gradient)" />
      <circle cx="40" cy="30" r="14" fill="#fff7fb" />
      <path d="M18 68c4-12 16-18 22-18s18 6 22 18" fill="#fff7fb" />
    </svg>
  `);

const rootFormModel = reactive({
  displayName: '',
  role: '设计师',
  agree: false,
  launchReady: true
});

const roleOptions = [
  { label: '设计师', value: '设计师' },
  { label: '工程师', value: '工程师' },
  { label: '研究员', value: '研究员' }
];

const selectOptions: SelectOption[] = [
  { label: '草莓奶霜', value: '草莓奶霜' },
  { label: '香草云朵', value: '香草云朵' },
  { label: '海盐焦糖', value: '海盐焦糖' },
  { label: '抹茶泡芙', value: '抹茶泡芙' },
  { label: '蜜桃雪顶', value: '蜜桃雪顶' },
  { label: '蓝莓气泡', value: '蓝莓气泡' }
];

const treeOptions: TreeNode[] = [
  {
    key: 'team',
    title: '设计团队',
    children: [
      { key: 'design', title: '视觉设计' },
      { key: 'engineering', title: '前端工程', disabled: true }
    ]
  },
  {
    key: 'ops',
    title: '发布协作'
  }
];

const cascaderOptions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [{ value: 'xihu', label: '西湖区' }]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [{ value: 'qinhuai', label: '秦淮区' }]
      }
    ]
  }
];

const transferItems: TransferItem[] = [
  { key: 'alpha', title: '设计系统 Token' },
  { key: 'beta', title: '交互验收清单' },
  { key: 'gamma', title: '历史草稿（禁用）', disabled: true }
];

const remoteSelectCatalog: SelectOption[] = [
  { label: '上海工作室', value: '上海工作室' },
  { label: '北京创意组', value: '北京创意组' },
  { label: '杭州体验实验室', value: '杭州体验实验室' },
  { label: '成都插画小队', value: '成都插画小队' },
  { label: '苏州研发站', value: '苏州研发站' },
  { label: '深圳发布团队', value: '深圳发布团队' }
];

const initialRemoteOptions = remoteSelectCatalog.slice(0, 4);
const remoteOptions = ref<SelectOption[]>(initialRemoteOptions);

const radioOptions = [
  { label: '草莓', value: '草莓' },
  { label: '香草', value: '香草' },
  { label: '蓝莓', value: '蓝莓', disabled: true }
];

const tabsItems = [
  { key: 'overview', label: '概览' },
  { key: 'tokens', label: '设计令牌' },
  { key: 'archive', label: '归档版本', disabled: true }
];

const menuItems = [
  { key: 'overview', label: '总览' },
  { key: 'layers', label: '图层面板' },
  { key: 'archive', label: '历史归档', disabled: true },
  { key: 'releases', label: '发布记录' }
];

const inputStatuses: InputStatus[] = ['default', 'warning', 'error'];
const themeSizeChoices: ComponentSize[] = ['small', 'middle', 'large'];
const fieldLabels: Record<string, string> = {
  displayName: '展示名称',
  role: '角色',
  agree: '检查清单',
  launchReady: '上线开关'
};

const rootFormRules = {
  displayName: [{ required: true, message: '请输入展示名称。' }],
  agree: [{ required: true, message: '请确认这份温柔上线清单。' }]
};

const themeIslandOverrides = computed(() => {
  if (providerIslandPulse.value === 'mint') {
    return {
      colors: {
        primary: '#50c7a7',
        primaryHover: '#41bd9c',
        accent: '#8ed6ff',
        surfaceRaised: providerIslandMode.value === 'dark' ? '#23343a' : '#ecfff9'
      }
    };
  }

  return {
    colors: {
      primary: '#ff7ca8',
      primaryHover: '#ff679d',
      accent: '#ffd78d',
      surfaceRaised: providerIslandMode.value === 'dark' ? '#39263b' : '#fff2f8'
    }
  };
});

const rows: DemoRow[] = Array.from({ length: 36 }).map((_, index) => ({
  id: index + 1,
  name: `成员 ${index + 1}`,
  role: index % 2 === 0 ? '设计师' : '工程师',
  city: ['上海', '东京', '首尔'][index % 3]
}));

const showcaseTableColumns: TableColumn[] = [
  { key: 'name', title: '成员', dataIndex: 'name' },
  { key: 'role', title: '角色', dataIndex: 'role', align: 'center' },
  { key: 'city', title: '城市', dataIndex: 'city', align: 'right' }
];

const showcaseListRows = rows.slice(0, 4);

const memberStatusValueEnum = defineValueEnum({
  active: {
    text: '正常协作',
    tone: 'success',
    icon: 'check'
  },
  processing: {
    text: '待审批',
    tone: 'primary',
    icon: 'clock'
  },
  archived: {
    text: '已归档',
    tone: 'default',
    icon: 'pause'
  }
});

const memberStatusOptions = Object.keys(memberStatusValueEnum).map((value) => ({
  label: resolveValueEnumText(value, memberStatusValueEnum),
  value
}));

const proRows: ShowcaseTableRow[] = [
  {
    id: 'user-1',
    name: 'Alice',
    role: '设计师',
    status: 'active',
    city: '杭州',
    releasedAt: '2026-05-14',
    region: ['zhejiang', 'hangzhou', 'xihu']
  },
  {
    id: 'user-2',
    name: 'Bianca',
    role: '工程师',
    status: 'processing',
    city: '南京',
    releasedAt: '2026-05-16',
    region: ['jiangsu', 'nanjing', 'qinhuai']
  },
  {
    id: 'user-3',
    name: 'Celine',
    role: '设计师',
    status: 'active',
    city: '杭州',
    releasedAt: '2026-05-18',
    region: ['zhejiang', 'hangzhou', 'xihu']
  },
  {
    id: 'user-4',
    name: 'Derek',
    role: '工程师',
    status: 'archived',
    city: '南京',
    releasedAt: '2026-05-20',
    region: ['jiangsu', 'nanjing', 'qinhuai']
  },
  {
    id: 'user-5',
    name: 'Elena',
    role: '设计师',
    status: 'processing',
    city: '杭州',
    releasedAt: '2026-05-22',
    region: ['zhejiang', 'hangzhou', 'xihu']
  },
  {
    id: 'user-6',
    name: 'Felix',
    role: '工程师',
    status: 'active',
    city: '南京',
    releasedAt: '2026-05-24',
    region: ['jiangsu', 'nanjing', 'qinhuai']
  },
  {
    id: 'user-7',
    name: 'Gina',
    role: '设计师',
    status: 'archived',
    city: '杭州',
    releasedAt: '2026-05-26',
    region: ['zhejiang', 'hangzhou', 'xihu']
  },
  {
    id: 'user-8',
    name: 'Hugo',
    role: '工程师',
    status: 'active',
    city: '南京',
    releasedAt: '2026-05-28',
    region: ['jiangsu', 'nanjing', 'qinhuai']
  }
];

const columns: ProTableColumn<ShowcaseTableRow>[] = [
  { key: 'id', title: '编号', dataIndex: 'id' },
  { key: 'name', title: '成员', dataIndex: 'name', sortable: true },
  { key: 'role', title: '角色', dataIndex: 'role' },
  { key: 'status', title: '状态', dataIndex: 'status' },
  { key: 'city', title: '城市', dataIndex: 'city' },
  { key: 'releasedAt', title: '发布日期', dataIndex: 'releasedAt', sortable: true }
];

const searchSchema: SearchFieldSchema[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'text',
    placeholder: '按成员名称筛选',
    inputProps: { allowClear: true }
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    options: [
      { label: '设计师', value: '设计师' },
      { label: '工程师', value: '工程师' }
    ],
    selectProps: { allowClear: true }
  },
  {
    name: 'releasedAt',
    label: '发布日期',
    type: 'date',
    datePickerProps: { allowClear: true }
  },
  {
    name: 'window',
    label: '发布日期范围',
    type: 'dateRange',
    dateRangePickerProps: { allowClear: true }
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    options: memberStatusOptions,
    selectProps: { allowClear: true }
  },
  {
    name: 'region',
    label: '地区',
    type: 'cascader',
    options: cascaderOptions,
    cascaderProps: { allowClear: true }
  }
];

const proErrorArmed = ref(qaScenario === 'pro-error');
const proFeedback = ref('点击查询、翻页、重试或行操作后，这里会记录当前演示状态。');
const proRowSelection = computed(() => ({
  selectedRowKeys: proSelectedRowKeys.value,
  getDisabled: (row: ShowcaseTableRow) => row.id === 'user-2'
}));

const isDateRangeQueryValue = (value: unknown): value is [string, string] =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((item) => typeof item === 'string');

const buildDeterministicResult = (
  queryValues: Record<string, unknown>,
  pagination: { current: number; pageSize: number },
  sortState: TableSortState | undefined
) => {
  const keyword = String(queryValues.keyword ?? '').trim().toLowerCase();
  const role = String(queryValues.role ?? '').trim();
  const status = String(queryValues.status ?? '').trim();
  const releasedAt = String(queryValues.releasedAt ?? '').trim();
  const window = isDateRangeQueryValue(queryValues.window) ? queryValues.window : undefined;
  const region = Array.isArray(queryValues.region)
    ? queryValues.region.filter((item): item is string => typeof item === 'string')
    : [];

  const filtered = proRows.filter((item) => {
    const matchesKeyword = keyword.length === 0 || item.name.toLowerCase().includes(keyword);
    const matchesRole = role.length === 0 || item.role === role;
    const matchesStatus = status.length === 0 || item.status === status;
    const matchesReleasedAt = releasedAt.length === 0 || item.releasedAt === releasedAt;
    const matchesWindow =
      !window ||
      (item.releasedAt >= window[0] && item.releasedAt <= window[1]);
    const matchesRegion =
      region.length === 0 ||
      region.every((segment, index) => item.region[index] === segment);

    return (
      matchesKeyword &&
      matchesRole &&
      matchesStatus &&
      matchesReleasedAt &&
      matchesWindow &&
      matchesRegion
    );
  });

  const sorted = [...filtered];
  if (sortState) {
    sorted.sort((left, right) => {
      const leftValue = String(left[sortState.columnKey as keyof ShowcaseTableRow] ?? '');
      const rightValue = String(right[sortState.columnKey as keyof ShowcaseTableRow] ?? '');
      return leftValue.localeCompare(rightValue, 'zh-CN', { numeric: true });
    });

    if (sortState.order === 'descend') {
      sorted.reverse();
    }
  }

  const start = (pagination.current - 1) * pagination.pageSize;
  return {
    data: sorted.slice(start, start + pagination.pageSize),
    total: sorted.length
  };
};

const request: ProSearchTableRequest<ShowcaseTableRow> = async ({
  pagination,
  queryValues,
  sortState,
  signal
}) => {
  await new Promise((resolve) => setTimeout(resolve, 180));

  if (signal.aborted) {
    return { data: [], total: 0 };
  }

  if (qaScenario === 'pro-error' && proErrorArmed.value) {
    proErrorArmed.value = false;
    proFeedback.value = '已注入一次 QA 错误，请使用重试或再次查询恢复。';
    throw new Error('Injected QA error');
  }

  const result = buildDeterministicResult(queryValues, pagination, sortState);
  const sortSummary = sortState ? `，按 ${sortState.columnKey} ${sortState.order}` : '';
  proFeedback.value = `当前返回 ${result.total} 条结果，第 ${pagination.current} 页${sortSummary}。`;
  return result;
};

const proRowActions: ProRowAction<ShowcaseTableRow>[] = [
  {
    key: 'inspect',
    label: '查看',
    refreshOnSuccess: false,
    onClick: async (row: ShowcaseTableRow) => {
      proFeedback.value = `查看 ${row.name}（${row.id}）的详情，不触发自动刷新。`;
    }
  },
  {
    key: 'requery',
    label: '重新查询',
    onClick: async (row: ShowcaseTableRow) => {
      proFeedback.value = `已请求刷新 ${row.name} 所在结果页。`;
    }
  }
];

const proBulkActions: ProBulkAction<ShowcaseTableRow>[] = [
  {
    key: 'archive',
    label: '批量归档',
    onClick: async ({ selectedRows }) => {
      proFeedback.value = `已批量归档 ${selectedRows.map((row) => row.name).join('、')}。`;
    }
  }
];

const proToolbarActions = computed(() => [
  {
    key: 'create',
    label: '新增成员',
    type: 'primary' as const,
    onClick: async () => {
      proFeedback.value = '已触发新增成员流程（演示态）。';
    }
  },
  {
    key: 'refresh',
    label: '刷新结果',
    onClick: async () => {
      await proTableRef.value?.refresh();
    }
  }
]);

const onProSelectedRowKeysChange = (nextKeys: Array<string | number>) => {
  proSelectedRowKeys.value = nextKeys.filter((key): key is string => typeof key === 'string');
};

const currentThemeLabel = computed(() => (mode.value === 'dark' ? '月夜' : '棉花糖'));
const currentModeText = computed(() => (mode.value === 'dark' ? '深色' : '浅色'));
const currentIslandModeText = computed(() =>
  providerIslandMode.value === 'dark' ? '深色' : '浅色'
);
const currentPulseText = computed(() =>
  providerIslandPulse.value === 'rose' ? '玫粉' : '薄荷'
);
const currentSizeText = computed(() => {
  if (componentSize.value === 'small') {
    return '小';
  }
  if (componentSize.value === 'large') {
    return '大';
  }
  return '中';
});
const currentInputStatusText = computed(() => {
  if (inputStatus.value === 'warning') {
    return '警告';
  }
  if (inputStatus.value === 'error') {
    return '错误';
  }
  return '默认';
});
const currentSelectStatusText = computed(() => {
  if (selectStatus.value === 'warning') {
    return '警告';
  }
  if (selectStatus.value === 'error') {
    return '错误';
  }
  return '默认';
});
const currentMenuModeText = computed(() =>
  menuMode.value === 'vertical' ? '纵向' : '横向'
);
const currentFloatingTeleportedText = computed(() =>
  floatingTeleported.value ? '挂到 body' : '原地渲染'
);
const currentBlockingTeleportedText = computed(() =>
  blockingTeleported.value ? '挂到 body' : '原地渲染'
);

const resolveRoleTagColor = (role: string) => {
  if (role === '工程师') {
    return 'primary' as const;
  }
  if (role === '研究员') {
    return 'warning' as const;
  }
  return 'success' as const;
};

const resolvePresenceStatus = (id: number) => {
  if (id % 3 === 0) {
    return 'warning' as const;
  }
  if (id % 2 === 0) {
    return 'processing' as const;
  }
  return 'success' as const;
};

const formatFormSnapshot = (values: Record<string, unknown>) =>
  JSON.stringify({
    展示名称: String(values.displayName ?? ''),
    角色: String(values.role ?? ''),
    检查清单: Boolean(values.agree),
    上线开关: Boolean(values.launchReady)
  });

const formatErrorSnapshot = (errors: Record<string, string[]>) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [fieldLabels[field] ?? field, messages])
    )
  );

const jumpTo = async (sectionId: string) => {
  activeSection.value = sectionId;
  await nextTick();
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const toggleTheme = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light';
};

const cycleInputStatus = () => {
  const currentIndex = inputStatuses.indexOf(inputStatus.value);
  inputStatus.value = inputStatuses[(currentIndex + 1) % inputStatuses.length] ?? 'default';
};

const cycleSelectStatus = () => {
  const currentIndex = inputStatuses.indexOf(selectStatus.value);
  selectStatus.value = inputStatuses[(currentIndex + 1) % inputStatuses.length] ?? 'default';
};

const handleRemoteSearch = (keyword: string) => {
  if (remoteSearchTimer) {
    clearTimeout(remoteSearchTimer);
  }

  remoteLoading.value = true;
  remoteSearchTimer = setTimeout(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const matches = remoteSelectCatalog.filter((option) =>
      normalizedKeyword.length === 0 || option.label.toLowerCase().includes(normalizedKeyword)
    );

    remoteOptions.value = normalizedKeyword.length === 0 ? initialRemoteOptions : matches;
    remoteLoading.value = false;
    remoteSearchTimer = undefined;
  }, 240);
};

const resetRemoteSelectDemo = () => {
  if (remoteSearchTimer) {
    clearTimeout(remoteSearchTimer);
    remoteSearchTimer = undefined;
  }

  remoteLoading.value = false;
  remoteSearchValue.value = '';
  remoteSelectValue.value = undefined;
  remoteOptions.value = initialRemoteOptions;
};

const handleDropdownSelect = (key: string) => {
  dropdownSelection.value = key;
};

const openDrawer = (placement: 'left' | 'right') => {
  drawerPlacement.value = placement;
  drawerOpen.value = true;
};

const setShowcaseObserver = () => {
  const targets = sections
    .map((section) => document.getElementById(section.id))
    .filter((node): node is HTMLElement => Boolean(node));

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visible?.target.id) {
        activeSection.value = visible.target.id;
      }
    },
    {
      rootMargin: '-18% 0px -60% 0px',
      threshold: [0.2, 0.45, 0.7]
    }
  );

  targets.forEach((target) => sectionObserver?.observe(target));
};

const onFinish = (values: Record<string, unknown>) => {
  formFeedback.value = `提交成功：${formatFormSnapshot(values)}`;
};

const onFinishFailed = (payload: { errors: Record<string, string[]> }) => {
  formFeedback.value = `提交失败：${formatErrorSnapshot(payload.errors)}`;
};

const resetFormDemo = () => {
  rootFormRef.value?.resetFields();
  formFeedback.value = '已通过暴露出来的表单实例重置表单。';
};

onMounted(() => {
  if (qaSection || qaScenario) {
    document.getElementById(initialSectionId)?.scrollIntoView({
      behavior: 'auto',
      block: 'start'
    });
  }
  setShowcaseObserver();
});

onBeforeUnmount(() => {
  if (remoteSearchTimer) {
    clearTimeout(remoteSearchTimer);
  }
  sectionObserver?.disconnect();
});
</script>

<template>
  <LConfigProvider :theme-mode="mode" :component-size="componentSize">
    <div
      class="showcase-shell"
      :data-motion="qaMotion"
      :data-qa-scenario="qaScenario || 'default'"
      :data-theme="mode"
      data-testid="qa-shell"
    >
      <aside class="showcase-sidebar">
        <div class="showcase-brand">
          <span class="showcase-kicker">Lolita 组件库</span>
          <h1>组件总览</h1>
          <p>
            把目前已完成的组件集中放在一个本地展台里，统一查看实时状态、主题上下文和表单联动。
          </p>
        </div>

        <nav class="showcase-nav" aria-label="组件总览导航">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="showcase-nav__item"
            :class="{ 'showcase-nav__item--active': activeSection === section.id }"
            @click="jumpTo(section.id)"
          >
            <span class="showcase-nav__eyebrow">{{ section.eyebrow }}</span>
            <span class="showcase-nav__label">{{ section.label }}</span>
          </button>
        </nav>

        <div class="showcase-sidebar__meta">
          <div class="meta-chip">
            <span class="meta-chip__label">主题</span>
            <strong>{{ currentThemeLabel }}</strong>
          </div>
          <div class="meta-chip">
            <span class="meta-chip__label">尺寸</span>
            <strong>{{ currentSizeText }}</strong>
          </div>
        </div>
      </aside>

      <main class="showcase-main">
        <section class="showcase-hero">
          <div class="showcase-hero__copy">
            <span class="showcase-kicker">当前本地演示</span>
            <h2>把已完成组件放进同一个可滚动实验场</h2>
            <p>
              这个本地展台现在就是唯一的组件示例入口。新组件一旦测试通过，就应该尽快落到这里，避免视觉偏差躲在绿色测试门禁后面。
            </p>
          </div>

          <div class="showcase-hero__controls">
            <div class="control-cluster">
              <span class="control-cluster__label">主题模式</span>
              <LSpace>
                <LButton type="primary" round @click="toggleTheme">
                  切换到{{ mode === 'light' ? '深色' : '浅色' }}
                </LButton>
                <LButton
                  type="dashed"
                  @click="providerIslandMode = providerIslandMode === 'light' ? 'dark' : 'light'"
                >
                  局部切到{{ providerIslandMode === 'light' ? '深色' : '浅色' }}
                </LButton>
              </LSpace>
            </div>

            <div class="control-cluster">
              <span class="control-cluster__label">全局尺寸</span>
              <LSpace>
                <LButton
                  v-for="size in themeSizeChoices"
                  :key="size"
                  :type="componentSize === size ? 'primary' : 'default'"
                  @click="componentSize = size"
                >
                  {{ size === 'small' ? '小' : size === 'middle' ? '中' : '大' }}
                </LButton>
              </LSpace>
            </div>
          </div>
        </section>

        <section id="providers" class="showcase-section" aria-labelledby="providers-title">
          <div class="section-heading">
            <span class="showcase-kicker">M0 基础</span>
            <h3 id="providers-title">配置与主题控制</h3>
            <p>
              根级配置会影响整个展台的主题模式和组件尺寸，局部主题岛则证明主题覆盖可以只停留在一个局部区域。
            </p>
          </div>

          <div class="provider-grid">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>根级提供器状态</h4>
                <p>这些开关会统一驱动整张页面。</p>
              </div>
              <LSpace direction="vertical" :size="12">
                <div class="provider-stat">
                  <span>主题模式</span>
                  <strong>{{ currentModeText }}</strong>
                </div>
                <div class="provider-stat">
                  <span>组件尺寸</span>
                  <strong>{{ currentSizeText }}</strong>
                </div>
                <div class="provider-stat">
                  <span>局部主色</span>
                  <strong>{{ currentPulseText }}</strong>
                </div>
              </LSpace>
            </article>

            <LThemeProvider :mode="providerIslandMode" :overrides="themeIslandOverrides">
              <article class="demo-panel theme-island">
                <div class="demo-panel__head">
                  <h4>局部主题岛</h4>
                  <p>嵌套 Provider 只覆盖这张卡片以及它的子内容。</p>
                </div>
                <LSpace direction="vertical" :size="12">
                  <LSpace>
                    <LButton type="primary">主色预览</LButton>
                    <LButton
                      type="dashed"
                      @click="providerIslandPulse = providerIslandPulse === 'rose' ? 'mint' : 'rose'"
                    >
                      切换色盘
                    </LButton>
                  </LSpace>
                  <LInput v-model:value="inputValue" placeholder="局部主题输入框" />
                </LSpace>
              </article>
            </LThemeProvider>
          </div>
        </section>

        <section
          id="button-space"
          class="showcase-section"
          aria-labelledby="button-space-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M0 基础</span>
            <h3 id="button-space-title">按钮与间距</h3>
            <p>
              用一条操作带同时展示视觉层级、加载反馈、危险样式，以及通过间距编排组织出来的紧凑节奏。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-panel__head">
              <h4>操作语言</h4>
            </div>
            <LSpace wrap :size="[12, 12]">
              <LButton type="primary" round>主按钮</LButton>
              <LButton type="dashed">虚线按钮</LButton>
              <LButton type="text">文字按钮</LButton>
              <LButton type="link">链接按钮</LButton>
              <LButton danger>危险按钮</LButton>
              <LButton loading>加载中</LButton>
            </LSpace>
            <div class="inline-note">
              这个间距编排会让留白保持清晰，不会把整页堆成一层又一层的通用卡片。
            </div>
          </article>
        </section>

        <section id="input" class="showcase-section" aria-labelledby="input-title">
          <div class="section-heading">
            <span class="showcase-kicker">M1 表单核心</span>
            <h3 id="input-title">输入框</h3>
            <p>
              受控输入、状态切换和禁用态都集中在这个小型演示区里。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-panel__head">
              <h4>带状态的文本框</h4>
            </div>
            <div class="demo-grid demo-grid--two">
              <div class="demo-stack">
                <LInput
                  v-model:value="inputValue"
                  :status="inputStatus"
                  :disabled="inputDisabled"
                  allow-clear
                  placeholder="输入一个带点可爱气质的街道名"
                />
                <div class="demo-readout">
                  <span>当前值</span>
                  <strong>{{ inputValue || '空' }}</strong>
                </div>
              </div>

              <div class="demo-stack">
                <LSpace wrap :size="[10, 10]">
                  <LButton type="primary" @click="cycleInputStatus">
                    切换状态：{{ currentInputStatusText }}
                  </LButton>
                  <LButton type="dashed" @click="inputDisabled = !inputDisabled">
                    {{ inputDisabled ? '启用输入框' : '禁用输入框' }}
                  </LButton>
                </LSpace>
                <p class="inline-note">
                  这个字段会继承全局尺寸变量，并且在可用状态下保留清空入口。
                </p>
              </div>
            </div>
          </article>
        </section>

        <section id="form" class="showcase-section" aria-labelledby="form-title">
          <div class="section-heading">
            <span class="showcase-kicker">M1 表单核心</span>
            <h3 id="form-title">表单与表单项</h3>
            <p>
              这组表单在同一个区域里覆盖文本框、下拉框、勾选控件、校验、实例重置，以及提交后的成功与失败反馈。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-grid demo-grid--two">
              <LForm
                ref="rootFormRef"
                class="demo-form"
                :model="rootFormModel"
                :rules="rootFormRules"
                @finish="onFinish"
                @finishFailed="onFinishFailed"
              >
                <LFormItem name="displayName" label="展示名称">
                  <LInput v-model:value="rootFormModel.displayName" placeholder="麻糬队长" />
                </LFormItem>

                <LFormItem name="role" label="角色">
                  <LSelect v-model:value="rootFormModel.role" :options="roleOptions" />
                </LFormItem>

                <LFormItem name="agree" label="检查清单" valuePropName="checked">
                  <LCheckbox v-model:checked="rootFormModel.agree">
                    我已经确认过发布检查清单。
                  </LCheckbox>
                </LFormItem>

                <LFormItem name="launchReady" label="上线开关" valuePropName="checked">
                  <LSwitch v-model:checked="rootFormModel.launchReady" />
                </LFormItem>

                <LSpace>
                  <LButton type="primary" htmlType="submit">提交</LButton>
                  <LButton type="dashed" @click="resetFormDemo">通过表单实例重置</LButton>
                </LSpace>
              </LForm>

              <div class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>事件反馈</h4>
                  <p>不用离开示例页，就能直接观察提交成功和提交失败的反馈。</p>
                </div>
                <pre class="feedback-console">{{ formFeedback }}</pre>
                <div class="demo-readout">
                  <span>当前模型</span>
                  <strong>{{ formatFormSnapshot(rootFormModel) }}</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section id="select" class="showcase-section" aria-labelledby="select-title">
          <div class="section-heading">
            <span class="showcase-kicker">M1 表单核心</span>
            <h3 id="select-title">选择器</h3>
            <p>
              这里把单选、多选、本地搜索和远程搜索接入方式放在一起，方便直接看清交互边界。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-panel__head">
              <h4>从基础下拉一路走到异步搜索接入</h4>
              <p>先看单选与状态，再看多选搜索，最后看预留给远程接口的受控搜索链路。</p>
            </div>
            <div class="demo-grid demo-grid--three">
              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>单选与状态</h4>
                </div>
                <LSelect
                  v-model:value="selectValue"
                  :options="selectOptions"
                  :status="selectStatus"
                  allow-clear
                  placeholder="选择一个口味"
                />
                <div class="demo-readout">
                  <span>当前选择</span>
                  <strong>{{ selectValue ?? '无' }}</strong>
                </div>
                <LSpace wrap :size="[10, 10]">
                  <LButton type="primary" @click="cycleSelectStatus">
                    切换状态：{{ currentSelectStatusText }}
                  </LButton>
                  <LButton type="dashed" @click="selectValue = undefined">由父级清空</LButton>
                </LSpace>
                <p class="inline-note">
                  当值由父级控制时，这个字段会一直保持受控状态，即使父级把模型清空也是如此。
                </p>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>多选与本地搜索</h4>
                </div>
                <LSelect
                  v-model:value="multipleSelectValues"
                  :options="selectOptions"
                  mode="multiple"
                  show-search
                  allow-clear
                  placeholder="输入关键字后选择多个口味"
                />
                <div class="demo-readout">
                  <span>已选口味</span>
                  <strong>{{ multipleSelectValues.length > 0 ? multipleSelectValues.join(' / ') : '无' }}</strong>
                </div>
                <p class="inline-note">
                  这块先聚焦最常用的多选能力：标签展示、本地搜索和一次性清空，避免把高级模式一起堆进来。
                </p>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>远程搜索口子</h4>
                </div>
                <LSelect
                  v-model:value="remoteSelectValue"
                  :options="remoteOptions"
                  :search-value="remoteSearchValue"
                  :loading="remoteLoading"
                  :filter-option="false"
                  not-found-content="没有匹配结果"
                  show-search
                  allow-clear
                  placeholder="输入城市名称触发远程搜索"
                  @update:searchValue="remoteSearchValue = $event"
                  @search="handleRemoteSearch"
                />
                <div class="demo-readout">
                  <span>搜索关键字</span>
                  <strong>{{ remoteSearchValue || '空' }}</strong>
                </div>
                <div class="demo-readout">
                  <span>当前选中</span>
                  <strong>{{ remoteSelectValue ?? '无' }}</strong>
                </div>
                <div class="demo-readout">
                  <span>选项状态</span>
                  <strong>{{ remoteLoading ? '加载中…' : `${remoteOptions.length} 项结果` }}</strong>
                </div>
                <LSpace wrap :size="[10, 10]">
                  <LButton type="dashed" @click="resetRemoteSelectDemo">重置远程搜索</LButton>
                </LSpace>
                <p class="inline-note">
                  这里保留了 `searchValue`、`update:searchValue`、`search` 和 `filterOption=false`
                  这条异步接入链路，后面接真实接口时不用重做选择器。
                </p>
              </article>
            </div>
          </article>
        </section>

        <section
          id="choice-controls"
          class="showcase-section"
          aria-labelledby="choice-controls-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M1 表单核心</span>
            <h3 id="choice-controls-title">多选框、单选框、单选组与开关</h3>
            <p>
              这里集中展示完整的 M1 选择控件集合，包括独立单选、分组单选、勾选字段，以及和表单联动的开关。
            </p>
          </div>

          <div class="demo-grid demo-grid--two">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>独立控件</h4>
              </div>
              <LSpace direction="vertical" :size="14">
                <LCheckbox v-model:checked="standaloneChecked">
                  温柔发布清单
                </LCheckbox>
                <LRadio v-model:checked="standaloneRadioChecked" :value="'solo'">
                  独立单选框
                </LRadio>
                <LSwitch v-model:checked="switchChecked" />
              </LSpace>
              <div class="demo-readout">
                <span>当前状态</span>
                <strong>
                  多选框={{ standaloneChecked }}，单选框={{ standaloneRadioChecked }}，开关={{ switchChecked }}
                </strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>单选组</h4>
              </div>
              <LSpace direction="vertical" :size="14">
                <LRadioGroup v-model:value="radioValue" :options="radioOptions" />
                <LSpace>
                  <LButton type="primary" @click="radioValue = '香草'">选中香草</LButton>
                  <LButton type="dashed" @click="radioValue = undefined">清空选择</LButton>
                </LSpace>
              </LSpace>
              <div class="demo-readout">
                <span>当前口味</span>
                <strong>{{ radioValue ?? '无' }}</strong>
              </div>
            </article>
          </div>
        </section>

        <section id="tabs-menu" class="showcase-section" aria-labelledby="tabs-menu-title">
          <div class="section-heading">
            <span class="showcase-kicker">M2 导航与浮层</span>
            <h3 id="tabs-menu-title">标签页与菜单</h3>
            <p>
              这块先把 M2 的导航基础打透：items 模式、TabPane 模式，以及菜单在纵向和横向两种方向里的键盘行为。
            </p>
          </div>

          <div class="demo-grid demo-grid--three">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>items + 命名面板 slot</h4>
                <p>适合由 schema 或配置驱动的导航内容。</p>
              </div>
              <LTabs v-model:activeKey="itemsTabsActiveKey" :items="tabsItems">
                <template #pane-overview>
                  <div class="demo-stack">
                    <strong>概览面板</strong>
                    <span>这里适合放版本摘要、关键路径和设计总览。</span>
                  </div>
                </template>
                <template #pane-tokens>
                  <div class="demo-stack">
                    <strong>设计令牌</strong>
                    <span>当前主题令牌、尺寸节奏和语义颜色会在这里统一回看。</span>
                  </div>
                </template>
              </LTabs>
              <div class="demo-readout">
                <span>当前激活</span>
                <strong>{{ itemsTabsActiveKey }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>TabPane 子组件模式</h4>
                <p>适合在页面里直接写结构化内容，并保留 `destroyInactiveTabPane`。</p>
              </div>
              <LTabs v-model:activeKey="paneTabsActiveKey" destroy-inactive-tab-pane>
                <LTabPane key="delivery" tab="交付节奏">
                  <div class="demo-stack">
                    <strong>交付节奏</strong>
                    <span>先把计划写细，再让子代理各自只做自己负责的区域。</span>
                  </div>
                </LTabPane>
                <LTabPane key="guardrail" tab="工程护栏">
                  <div class="demo-stack">
                    <strong>工程护栏</strong>
                    <span>测试、memory、playground 同步，是这个库长期可维护的底线。</span>
                  </div>
                </LTabPane>
              </LTabs>
              <div class="demo-readout">
                <span>当前激活</span>
                <strong>{{ paneTabsActiveKey ?? '无' }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>Menu 方向切换</h4>
                <p>同一组菜单项在纵向 / 横向模式下共享选中态与箭头键规则。</p>
              </div>
              <LSpace wrap :size="[10, 10]">
                <LButton
                  :type="menuMode === 'vertical' ? 'primary' : 'default'"
                  @click="menuMode = 'vertical'"
                >
                  纵向模式
                </LButton>
                <LButton
                  :type="menuMode === 'horizontal' ? 'primary' : 'default'"
                  @click="menuMode = 'horizontal'"
                >
                  横向模式
                </LButton>
              </LSpace>
              <LMenu v-model:selectedKeys="menuSelectedKeys" :items="menuItems" :mode="menuMode" />
              <div class="demo-readout">
                <span>当前模式</span>
                <strong>{{ currentMenuModeText }}</strong>
              </div>
              <div class="demo-readout">
                <span>当前选中</span>
                <strong>{{ menuSelectedKeys[0] ?? '无' }}</strong>
              </div>
            </article>
          </div>
        </section>

        <section
          id="floating-overlays"
          class="showcase-section"
          aria-labelledby="floating-overlays-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M2 导航与浮层</span>
            <h3 id="floating-overlays-title">Tooltip / Popover / Dropdown</h3>
            <p>
              这一组重点不是视觉，而是统一的浮层开关契约、teleported 控制，以及点击外部关闭的闭环。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-panel__head">
              <h4>轻浮层统一开关</h4>
              <p>先切换挂载策略，再分别体验提示、卡片和下拉菜单。</p>
            </div>
            <LSpace wrap :size="[10, 10]">
              <LButton
                :type="floatingTeleported ? 'primary' : 'default'"
                @click="floatingTeleported = true"
              >
                挂到 body
              </LButton>
              <LButton
                :type="!floatingTeleported ? 'primary' : 'default'"
                @click="floatingTeleported = false"
              >
                原地渲染
              </LButton>
            </LSpace>
            <div class="demo-grid demo-grid--three">
              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Tooltip</h4>
                </div>
                <LTooltip title="这里是轻提示，适合放最短的补充说明。" :teleported="floatingTeleported">
                  <LButton type="dashed">悬停查看提示</LButton>
                </LTooltip>
                <p class="inline-note">
                  这里重点看 `teleported` 切换后，提示层是否还保持稳定定位。
                </p>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Popover</h4>
                </div>
                <LPopover
                  v-model:open="popoverOpen"
                  title="操作说明"
                  content="点击外部区域应当关闭；如果父级受控，状态应该等父级回传。"
                  :teleported="floatingTeleported"
                >
                  <LButton type="primary">打开气泡卡片</LButton>
                </LPopover>
                <div class="demo-readout">
                  <span>当前状态</span>
                  <strong>{{ popoverOpen ? '展开中' : '已关闭' }}</strong>
                </div>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Dropdown</h4>
                </div>
                <LDropdown
                  :menu-items="menuItems"
                  :teleported="floatingTeleported"
                  @select="handleDropdownSelect"
                >
                  <LButton>更多操作</LButton>
                </LDropdown>
                <div class="demo-readout">
                  <span>最近选择</span>
                  <strong>{{ dropdownSelection }}</strong>
                </div>
                <p class="inline-note">
                  按下触发器上的 `ArrowDown`，应该直接把焦点送进第一项可用菜单项。
                </p>
              </article>
            </div>
            <div class="demo-readout">
              <span>当前挂载策略</span>
              <strong>{{ currentFloatingTeleportedText }}</strong>
            </div>
          </article>
        </section>

        <section
          id="blocking-overlays"
          class="showcase-section"
          aria-labelledby="blocking-overlays-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M2 导航与浮层</span>
            <h3 id="blocking-overlays-title">Modal / Drawer</h3>
            <p>
              阻断式浮层这组重点看焦点是否能回来、body 是否会锁住滚动，以及遮罩与 Esc 的关闭链路。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-panel__head">
              <h4>阻断式浮层的基础行为</h4>
              <p>先切挂载策略，再分别打开 Modal 和 Drawer 观察关闭路径。</p>
            </div>
            <LSpace wrap :size="[10, 10]">
              <LButton
                :type="blockingTeleported ? 'primary' : 'default'"
                @click="blockingTeleported = true"
              >
                挂到 body
              </LButton>
              <LButton
                :type="!blockingTeleported ? 'primary' : 'default'"
                @click="blockingTeleported = false"
              >
                原地渲染
              </LButton>
              <LButton type="primary" @click="modalOpen = true">打开弹窗</LButton>
              <LButton type="dashed" @click="openDrawer('left')">打开左侧抽屉</LButton>
              <LButton type="dashed" @click="openDrawer('right')">打开右侧抽屉</LButton>
            </LSpace>
            <div class="demo-grid demo-grid--two">
              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Modal 行为摘要</h4>
                </div>
                <div class="demo-readout">
                  <span>当前状态</span>
                  <strong>{{ modalOpen ? '打开' : '关闭' }}</strong>
                </div>
                <div class="demo-readout">
                  <span>挂载策略</span>
                  <strong>{{ currentBlockingTeleportedText }}</strong>
                </div>
                <p class="inline-note">
                  打开后会锁住页面滚动，关闭后要把焦点还给刚才的触发器。
                </p>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Drawer 行为摘要</h4>
                </div>
                <div class="demo-readout">
                  <span>当前状态</span>
                  <strong>{{ drawerOpen ? `已打开（${drawerPlacement === 'left' ? '左侧' : '右侧'}）` : '关闭' }}</strong>
                </div>
                <div class="demo-readout">
                  <span>挂载策略</span>
                  <strong>{{ currentBlockingTeleportedText }}</strong>
                </div>
                <p class="inline-note">
                  抽屉和弹窗共享 Esc、遮罩、焦点归还与滚动锁定规则，只是呈现方式不同。
                </p>
              </article>
            </div>

            <LModal
              v-model:open="modalOpen"
              title="发布前确认"
              :teleported="blockingTeleported"
            >
              <div class="demo-stack" data-testid="qa-overlay-modal">
                <span>请确认这次发布的版本说明、验收结果和回滚预案都已经准备好。</span>
                <span>关闭弹窗后，焦点应该回到刚刚的“打开弹窗”按钮。</span>
              </div>
            </LModal>

            <LDrawer
              v-model:open="drawerOpen"
              title="发布侧栏"
              :placement="drawerPlacement"
              :teleported="blockingTeleported"
            >
              <div class="demo-stack">
                <span>这里可以承载更长的辅助信息，比如检查清单、版本摘要和补充说明。</span>
                <span>切到左侧或右侧时，只应该影响面板停靠方向，不应该破坏关闭链路。</span>
              </div>
            </LDrawer>
          </article>
        </section>

        <section
          id="data-display-foundation"
          class="showcase-section"
          aria-labelledby="data-display-foundation-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M3 数据展示</span>
            <h3 id="data-display-foundation-title">Tag / Badge / Avatar / Pagination</h3>
            <p>
              先把轻量状态原子和分页状态机做稳，后面的 Table 与 List 才不会各自长出一套展示逻辑。
            </p>
          </div>

          <article class="demo-panel">
            <div class="demo-grid demo-grid--three">
              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Tag</h4>
                  <p>用语义色、圆角和描边控制轻量状态标签。</p>
                </div>
                <LSpace wrap :size="[10, 10]">
                  <LTag>默认</LTag>
                  <LTag color="primary">进行中</LTag>
                  <LTag color="success">已通过</LTag>
                  <LTag color="warning">待确认</LTag>
                  <LTag color="danger">已阻塞</LTag>
                  <LTag color="primary" :bordered="false" round>轻可爱</LTag>
                </LSpace>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Badge</h4>
                  <p>先聚焦状态点和文本，不把数字计数提前混进来。</p>
                </div>
                <LSpace direction="vertical" align="start" :size="10">
                  <LBadge status="processing" text="部署中" />
                  <LBadge status="success" text="校验通过" />
                  <LBadge status="warning" text="等待确认" />
                  <LBadge status="error" text="回滚中" />
                  <LBadge status="processing" dot>
                    <LButton type="text">待处理消息</LButton>
                  </LBadge>
                </LSpace>
              </article>

              <article class="demo-stack demo-stack--surface">
                <div class="demo-panel__head">
                  <h4>Avatar</h4>
                  <p>图片、回退文本和尺寸语义先统一起来，后续列表与表格都复用它。</p>
                </div>
                <LSpace wrap :size="[12, 12]">
                  <LAvatar :src="avatarIllustration" alt="演示头像" />
                  <LAvatar size="small" fallback-text="露" />
                  <LAvatar fallback-text="莉塔" />
                  <LAvatar size="large" shape="square" fallback-text="UI" />
                </LSpace>
              </article>
            </div>

            <article class="demo-stack demo-stack--surface">
              <div class="demo-panel__head">
                <h4>Pagination</h4>
                <p>当前只做上一页、下一页和数字页码，先把受控 / 非受控主链路做稳。</p>
              </div>
              <LPagination v-model:current="showcasePage" :page-size="6" :total="36" />
              <div class="demo-readout">
                <span>当前页码</span>
                <strong>第 {{ showcasePage }} 页 / 共 6 页</strong>
              </div>
            </article>
          </article>
        </section>

        <section
          id="data-display-shells"
          class="showcase-section"
          aria-labelledby="data-display-shells-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M3 数据展示</span>
            <h3 id="data-display-shells-title">Table / List</h3>
            <p>
              这里用同一份成员数据同时喂给表格和列表，观察头像、标签、徽标、分页和空状态是否已经能复用同一套语言。
            </p>
          </div>

          <div class="demo-grid demo-grid--two">
            <article class="demo-panel demo-panel--table">
              <div class="demo-panel__head">
                <h4>Table</h4>
                <p>当前只做基础展示表格，把 columns、bodyCell、empty 和内建分页打稳。</p>
              </div>

              <LTable
                :columns="showcaseTableColumns"
                :data-source="rows"
                row-key="id"
                :pagination="{ defaultCurrent: 1, pageSize: 5, total: rows.length }"
              >
                <template #bodyCell="{ column, value, record }">
                  <div v-if="column.key === 'name'" class="table-name-cell">
                    <LAvatar size="small" :fallback-text="String(record.name).slice(-1)" />
                    <span>{{ value }}</span>
                  </div>
                  <LTag
                    v-else-if="column.key === 'role'"
                    :color="resolveRoleTagColor(String(value))"
                  >
                    {{ value }}
                  </LTag>
                  <span v-else>{{ value }}</span>
                </template>
              </LTable>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>List</h4>
                <p>列表把 `Avatar / Tag / Badge` 串起来，验证数据容器层是否足够轻量和可复用。</p>
              </div>

              <LList :data-source="showcaseListRows" split>
                <template #renderItem="{ item }">
                  <div class="list-showcase-row">
                    <div class="list-showcase-row__main">
                      <LAvatar size="small" :fallback-text="String(item.name).slice(-1)" />
                      <div class="list-showcase-row__copy">
                        <strong>{{ item.name }}</strong>
                        <span>{{ item.city }}</span>
                      </div>
                    </div>
                    <div class="list-showcase-row__meta">
                      <LTag :color="resolveRoleTagColor(String(item.role))">
                        {{ item.role }}
                      </LTag>
                      <LBadge
                        :status="resolvePresenceStatus(Number(item.id))"
                        :text="Number(item.id) % 2 === 0 ? '协作中' : '已同步'"
                      />
                    </div>
                  </div>
                </template>
              </LList>
            </article>
          </div>
        </section>

        <section id="date-picker" class="showcase-section" aria-labelledby="date-picker-title">
          <div class="section-heading">
            <span class="showcase-kicker">M4 复杂组件</span>
            <h3 id="date-picker-title">DatePicker / DateRangePicker</h3>
            <p>
              M4 先把单日期和基础日期范围主链路打稳，当前不提前混入 showTime、快捷范围
              和复杂日历体系。
            </p>
          </div>

          <div class="demo-grid demo-grid--two">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>单日期选择</h4>
                <p>这里重点看清空、禁用、状态切换和受控值回显。</p>
              </div>
              <LSpace wrap :size="[10, 10]">
                <LButton
                  :type="datePickerStatus === 'default' ? 'primary' : 'default'"
                  @click="datePickerStatus = 'default'"
                >
                  默认
                </LButton>
                <LButton
                  :type="datePickerStatus === 'warning' ? 'primary' : 'default'"
                  @click="datePickerStatus = 'warning'"
                >
                  警告
                </LButton>
                <LButton
                  :type="datePickerStatus === 'error' ? 'primary' : 'default'"
                  @click="datePickerStatus = 'error'"
                >
                  错误
                </LButton>
                <LButton type="dashed" @click="datePickerValue = undefined">清空日期</LButton>
              </LSpace>
              <LDatePicker
                v-model:value="datePickerValue"
                allow-clear
                placeholder="请选择发布日期"
                :status="datePickerStatus"
              />
              <div class="demo-readout">
                <span>当前日期</span>
                <strong>{{ datePickerValue ?? '未选择' }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>日期范围与表单联动</h4>
                <p>范围选择只做基础开始/结束语义，但继续沿用同一套 FormItem 反馈语言。</p>
              </div>
              <LSpace wrap :size="[10, 10]">
                <LButton type="dashed" @click="dateRangePickerValue = undefined">
                  清空范围
                </LButton>
                <LButton
                  type="default"
                  @click="dateRangePickerValue = ['2026-05-14', '2026-05-20']"
                >
                  恢复示例范围
                </LButton>
              </LSpace>
              <LForm :model="{ releaseWindow: dateRangePickerValue }">
                <LFormItem
                  label="发布日期范围"
                  help="当前示例只展示范围值联动，不提前扩到快捷范围与时间维度。"
                >
                  <LDateRangePicker
                    v-model:value="dateRangePickerValue"
                    format="YYYY/MM/DD"
                    allow-clear
                  />
                </LFormItem>
              </LForm>
              <div class="demo-readout">
                <span>当前范围</span>
                <strong>{{ dateRangePickerValue?.join(' ~ ') ?? '未选择' }}</strong>
              </div>
            </article>
          </div>
        </section>

        <section id="upload" class="showcase-section" aria-labelledby="upload-title">
          <div class="section-heading">
            <span class="showcase-kicker">M4 复杂组件</span>
            <h3 id="upload-title">Upload</h3>
            <p>
              当前只做按钮触发上传列表，把 `beforeUpload`、`customRequest`、`maxCount`
              和移除链路先打稳。
            </p>
          </div>

          <div class="demo-grid demo-grid--two">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>受控文件列表</h4>
                <p>这里直接把 file-list 暴露在展台里，方便验证状态同步是不是稳定。</p>
              </div>
              <LUpload
                v-model:fileList="uploadFileList"
                :max-count="3"
                button-text="选择演示文件"
              />
              <div class="demo-readout">
                <span>当前文件数</span>
                <strong>{{ uploadFileList.length }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>当前 fileList 快照</h4>
                <p>后续补拖拽或预览时，也要继续复用这条已稳定的 file-list 主链路。</p>
              </div>
              <pre class="feedback-console">{{ JSON.stringify(uploadFileList, null, 2) }}</pre>
            </article>
          </div>
        </section>

        <section
          id="tree-cascader-transfer"
          class="showcase-section"
          aria-labelledby="tree-cascader-transfer-title"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M4 复杂组件</span>
            <h3 id="tree-cascader-transfer-title">Tree / Cascader / Transfer</h3>
            <p>
              这组三个组件共享“结构化选择”主题，但每个都先只做最小可维护主链路，不把高级能力混进来。
            </p>
          </div>

          <div class="demo-grid demo-grid--three">
            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>Tree</h4>
                <p>单选树、展开收起和禁用节点跳过已经接通。</p>
              </div>
              <LTree
                v-model:selectedKeys="treeSelectedKeys"
                v-model:expandedKeys="treeExpandedKeys"
                :tree-data="treeOptions"
              />
              <div class="demo-readout">
                <span>当前选中</span>
                <strong>{{ treeSelectedKeys[0] ?? '未选择' }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>Cascader</h4>
                <p>当前只做单路径选择，先把列式路径状态和清空链路打稳。</p>
              </div>
              <LCascader
                v-model:value="cascaderValue"
                :options="cascaderOptions"
                allow-clear
                placeholder="请选择城市路径"
              />
              <div class="demo-readout">
                <span>当前路径</span>
                <strong>{{ cascaderValue?.join(' / ') ?? '未选择' }}</strong>
              </div>
            </article>

            <article class="demo-panel">
              <div class="demo-panel__head">
                <h4>Transfer</h4>
                <p>双栏搬运先只保留勾选、移动和禁用项处理。</p>
              </div>
              <LTransfer
                v-model:targetKeys="transferTargetKeys"
                v-model:selectedKeys="transferSelectedKeys"
                :data-source="transferItems"
              />
              <div class="demo-readout">
                <span>目标列 key</span>
                <strong>{{ transferTargetKeys.join(', ') || '空' }}</strong>
              </div>
            </article>
          </div>
        </section>

        <section
          id="pro-search-table"
          class="showcase-section"
          aria-labelledby="pro-search-table-title"
          :data-testid="qaScenario === 'pro-error' ? 'qa-pro-error' : 'qa-pro-basic'"
        >
          <div class="section-heading">
            <span class="showcase-kicker">M0 增强层</span>
            <h3 id="pro-search-table-title">高级查询表格</h3>
            <p>
              更高阶的组合组件也应该放在同一个展台里，这样能力边界和使用方式都能在一个地方看清楚。
            </p>
          </div>

          <article class="demo-panel demo-panel--table">
            <div v-if="qaScenario === 'pro-error'" class="inline-note">
              <LTag color="warning">已注入一次错误，重试后恢复</LTag>
            </div>
            <ProSearchTable
              ref="proTableRef"
              :columns="columns"
              :search-schema="searchSchema"
              :request="request"
              :row-selection="proRowSelection"
              :bulk-actions="proBulkActions"
              :toolbar="proToolbarActions"
              :row-actions="proRowActions"
              :retries="qaScenario === 'pro-error' ? 0 : 1"
              :initial-pagination="{ current: 1, pageSize: 6, total: 0 }"
              @update:selected-row-keys="onProSelectedRowKeysChange"
            >
              <template #cell-status="{ row }">
                <StatusTag :value="row.status" :value-enum="memberStatusValueEnum" />
              </template>
            </ProSearchTable>
            <div class="demo-readout">
              <span>场景反馈</span>
              <strong>{{ proFeedback }}</strong>
            </div>
          </article>
        </section>
      </main>
    </div>
  </LConfigProvider>
</template>

<style scoped>
.showcase-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  background:
    radial-gradient(1100px 520px at -8% -10%, rgba(255, 167, 201, 0.34), transparent 60%),
    radial-gradient(900px 420px at 108% 2%, rgba(122, 211, 255, 0.28), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 18%),
    var(--l-color-bg-page);
  color: var(--l-color-textPrimary);
}

.showcase-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 22px;
  box-sizing: border-box;
  border-right: 1px solid color-mix(in srgb, var(--l-color-border) 82%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--l-color-surface) 90%, transparent), transparent 86%),
    color-mix(in srgb, var(--l-color-surface) 74%, transparent);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.showcase-shell[data-qa-scenario='shell'] .showcase-section {
  display: none;
}

.showcase-shell[data-qa-scenario='overlay-modal'] .showcase-section:not(#blocking-overlays),
.showcase-shell[data-qa-scenario='pro-basic'] .showcase-section:not(#pro-search-table),
.showcase-shell[data-qa-scenario='pro-error'] .showcase-section:not(#pro-search-table),
.showcase-shell[data-qa-scenario='tree-cascader-transfer'] .showcase-section:not(#tree-cascader-transfer) {
  display: none;
}

.showcase-brand h1 {
  margin: 8px 0 10px;
  font-family: var(--l-typo-fontFamilyHeading);
  font-size: 2rem;
  line-height: 1;
}

.showcase-brand p,
.section-heading p,
.demo-panel__head p,
.inline-note,
.showcase-hero__copy p {
  margin: 0;
  color: var(--l-color-textSecondary);
  line-height: 1.6;
  max-width: 65ch;
}

.showcase-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--l-color-textSecondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
}

.showcase-kicker::before {
  content: '';
  width: 26px;
  height: 1px;
  background: color-mix(in srgb, var(--l-color-primary) 55%, transparent);
}

.showcase-nav {
  display: grid;
  gap: 10px;
}

.showcase-nav__item {
  border: 1px solid color-mix(in srgb, var(--l-color-border) 86%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--l-color-surface) 80%, transparent);
  color: inherit;
  padding: 14px 14px 13px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--l-motion-fast) ease,
    background-color var(--l-motion-fast) ease,
    transform var(--l-motion-fast) ease,
    box-shadow var(--l-motion-fast) ease;
}

.showcase-nav__item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--l-color-primary) 32%, var(--l-color-border) 68%);
  box-shadow: var(--l-shadow-sm);
}

.showcase-nav__item--active {
  border-color: color-mix(in srgb, var(--l-color-primary) 52%, var(--l-color-border) 48%);
  background: color-mix(in srgb, var(--l-color-primary) 10%, var(--l-color-surface) 90%);
  box-shadow: var(--l-shadow-sm);
}

.showcase-nav__eyebrow,
.showcase-nav__label {
  display: block;
}

.showcase-nav__eyebrow {
  color: var(--l-color-textSecondary);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.showcase-nav__label {
  font-weight: 700;
}

.showcase-sidebar__meta {
  margin-top: auto;
  display: grid;
  gap: 10px;
}

.meta-chip {
  border-radius: 18px;
  padding: 14px;
  background: color-mix(in srgb, var(--l-color-surfaceRaised) 84%, transparent);
  border: 1px solid color-mix(in srgb, var(--l-color-border) 86%, transparent);
}

.meta-chip__label {
  display: block;
  color: var(--l-color-textSecondary);
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.showcase-main {
  padding: 28px;
  box-sizing: border-box;
}

.showcase-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 22px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.6), transparent 34%),
    linear-gradient(135deg, color-mix(in srgb, var(--l-color-surface) 80%, transparent), color-mix(in srgb, var(--l-color-surfaceRaised) 94%, transparent));
  border: 1px solid color-mix(in srgb, var(--l-color-border) 86%, transparent);
  box-shadow: var(--l-shadow-md);
}

.showcase-hero__copy h2 {
  margin: 10px 0 12px;
  font-family: var(--l-typo-fontFamilyHeading);
  font-size: 2.25rem;
  line-height: 1.05;
}

.showcase-hero__controls,
.control-cluster,
.demo-stack {
  display: grid;
  gap: 12px;
}

.control-cluster {
  padding: 18px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--l-color-surface) 84%, transparent);
  border: 1px solid color-mix(in srgb, var(--l-color-border) 84%, transparent);
}

.control-cluster__label {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--l-color-textSecondary);
  font-weight: 700;
}

.showcase-section {
  scroll-margin-top: 18px;
  padding-top: 34px;
}

.section-heading {
  margin-bottom: 18px;
}

.section-heading h3,
.demo-panel__head h4 {
  margin: 8px 0 8px;
  font-family: var(--l-typo-fontFamilyHeading);
  line-height: 1.08;
}

.section-heading h3 {
  font-size: 1.75rem;
}

.demo-panel__head h4 {
  font-size: 1.2rem;
}

.demo-panel {
  padding: 22px;
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--l-color-border) 82%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--l-color-surface) 94%, transparent), color-mix(in srgb, var(--l-color-surfaceRaised) 96%, transparent));
  box-shadow: var(--l-shadow-sm);
}

.demo-panel--table {
  overflow: hidden;
}

.demo-grid {
  display: grid;
  gap: 18px;
}

.demo-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.demo-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.provider-stat,
.demo-readout {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--l-color-surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--l-color-border) 86%, transparent);
}

.provider-stat span,
.demo-readout span {
  color: var(--l-color-textSecondary);
}

.demo-stack--surface {
  padding: 18px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--l-color-surface) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--l-color-border) 86%, transparent);
}

.table-name-cell,
.list-showcase-row,
.list-showcase-row__main,
.list-showcase-row__meta {
  display: flex;
  align-items: center;
}

.table-name-cell,
.list-showcase-row__main {
  gap: 10px;
}

.list-showcase-row {
  justify-content: space-between;
  gap: 16px;
}

.list-showcase-row__copy {
  display: grid;
  gap: 2px;
}

.list-showcase-row__copy strong {
  font-size: 0.95rem;
}

.list-showcase-row__copy span {
  color: var(--l-color-textSecondary);
  font-size: 0.82rem;
}

.list-showcase-row__meta {
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.theme-island {
  position: relative;
  overflow: hidden;
}

.theme-island::after {
  content: '';
  position: absolute;
  inset: auto -8% -40% 36%;
  height: 160px;
  background: radial-gradient(circle, color-mix(in srgb, var(--l-color-primary) 30%, transparent), transparent 68%);
  pointer-events: none;
}

.demo-form {
  display: grid;
}

.feedback-console {
  margin: 0;
  min-height: 132px;
  padding: 16px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--l-color-textPrimary) 6%, var(--l-color-surface) 94%);
  border: 1px solid color-mix(in srgb, var(--l-color-border) 88%, transparent);
  color: var(--l-color-textPrimary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .showcase-shell {
    grid-template-columns: 1fr;
  }

  .showcase-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--l-color-border) 82%, transparent);
  }

  .showcase-sidebar__meta {
    margin-top: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .showcase-hero,
  .provider-grid,
  .demo-grid--two,
  .demo-grid--three {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .showcase-main,
  .showcase-sidebar {
    padding: 18px;
  }

  .showcase-hero,
  .demo-panel {
    padding: 18px;
    border-radius: 22px;
  }

  .showcase-hero__copy h2 {
    font-size: 1.9rem;
  }

  .showcase-sidebar__meta {
    grid-template-columns: 1fr;
  }
}
</style>
