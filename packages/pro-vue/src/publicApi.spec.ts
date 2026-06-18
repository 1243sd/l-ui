import { describe, expect, it } from 'vitest';
import {
  ProBatchActionBar,
  ProQueryFilter,
  ProSearchTable,
  StatusTag,
  type ValueEnum
} from './index';

describe('@lolita-ui/pro-vue public API', () => {
  it('exports the List Pack components alongside ProSearchTable', () => {
    const roleEnum: ValueEnum = {
      designer: {
        text: 'Designer',
        color: 'success'
      },
      engineer: {
        text: 'Engineer',
        color: 'primary'
      }
    };

    expect(roleEnum.designer).toBeDefined();
    expect(ProSearchTable).toBeTruthy();
    expect(ProQueryFilter).toBeTruthy();
    expect(ProBatchActionBar).toBeTruthy();
    expect(StatusTag).toBeTruthy();
  });
});
