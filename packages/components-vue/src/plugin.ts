import type { App, Plugin } from 'vue';
import { LButton } from './components/Button';
import { LTag } from './components/Tag';
import { LBadge } from './components/Badge';
import { LAvatar } from './components/Avatar';
import { LConfigProvider } from './components/ConfigProvider';
import { LCheckbox } from './components/Checkbox';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';
import { LInput } from './components/Input';
import { LDatePicker } from './components/DatePicker';
import { LDateRangePicker } from './components/DateRangePicker';
import { LUpload } from './components/Upload';
import { LTree } from './components/Tree';
import { LCascader } from './components/Cascader';
import { LTransfer } from './components/Transfer';
import { LRadio } from './components/Radio';
import { LRadioGroup } from './components/RadioGroup';
import { LSelect } from './components/Select';
import { LSpace } from './components/Space';
import { LSwitch } from './components/Switch';
import { LTabs, LTabPane } from './components/Tabs';
import { LMenu } from './components/Menu';
import { LTooltip } from './components/Tooltip';
import { LPopover } from './components/Popover';
import { LDropdown } from './components/Dropdown';
import { LModal } from './components/Modal';
import { LDrawer } from './components/Drawer';
import { LPagination } from './components/Pagination';
import { LThemeProvider } from './components/ThemeProvider';
import { LTable } from './components/Table';
import { LList } from './components/List';

const components = [
  LConfigProvider,
  LThemeProvider,
  LButton,
  LTag,
  LBadge,
  LAvatar,
  LPagination,
  LTable,
  LList,
  LCheckbox,
  LInput,
  LDatePicker,
  LDateRangePicker,
  LUpload,
  LTree,
  LCascader,
  LTransfer,
  LRadio,
  LRadioGroup,
  LSelect,
  LSpace,
  LSwitch,
  LTabs,
  LTabPane,
  LMenu,
  LTooltip,
  LPopover,
  LDropdown,
  LModal,
  LDrawer,
  LForm,
  LFormItem
] as const;

export const install = (app: App): void => {
  components.forEach((component) => {
    app.component(component.name ?? '', component);
  });
};

const LolitaUI: Plugin = { install };

export default LolitaUI;
