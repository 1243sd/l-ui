<script setup lang="ts">
import {
  LButton,
  LConfigProvider,
  LSpace
} from '@lolita-ui/components-vue';
import {
  ProSearchTable,
  type ProSearchTableRequest,
  type ProTableColumn,
  type SearchFieldSchema
} from '@lolita-ui/pro-vue';
import { createLolitaTheme } from '@lolita-ui/theme';

type ConsumerRow = {
  id: string;
  name: string;
  role: string;
  city: string;
};

const themeSnapshot = createLolitaTheme({
  mode: 'dark',
  overrides: {
    colors: {
      primary: '#ff6b81'
    }
  }
});

const consumerRows: ConsumerRow[] = [
  { id: '1', name: 'Alice', role: 'Admin', city: 'Shanghai' },
  { id: '2', name: 'Bruno', role: 'Editor', city: 'Shenzhen' },
  { id: '3', name: 'Celine', role: 'Analyst', city: 'Hangzhou' },
  { id: '4', name: 'Diego', role: 'Admin', city: 'Chengdu' }
];

const searchSchema: SearchFieldSchema[] = [
  {
    name: 'keyword',
    label: 'Keyword',
    type: 'text',
    placeholder: 'Search member'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    placeholder: 'Filter by role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Editor', value: 'Editor' },
      { label: 'Analyst', value: 'Analyst' }
    ]
  }
];

const columns: ProTableColumn<ConsumerRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'city', title: 'City', dataIndex: 'city' }
];

const request: ProSearchTableRequest<ConsumerRow> = async ({
  pagination,
  queryValues
}) => {
  const keyword =
    typeof queryValues.keyword === 'string'
      ? queryValues.keyword.trim().toLowerCase()
      : '';
  const role =
    typeof queryValues.role === 'string' ? queryValues.role : undefined;

  const filteredRows = consumerRows.filter((row) => {
    const matchesKeyword =
      keyword.length === 0 || row.name.toLowerCase().includes(keyword);
    const matchesRole = role === undefined || row.role === role;

    return matchesKeyword && matchesRole;
  });

  const start = (pagination.current - 1) * pagination.pageSize;

  return {
    data: filteredRows.slice(start, start + pagination.pageSize),
    total: filteredRows.length
  };
};
</script>

<template>
  <LConfigProvider
    theme-mode="dark"
    :theme-overrides="{ colors: { primary: '#ff6b81' } }"
  >
    <main class="consumer-shell" data-testid="consumer-smoke-root">
      <section class="consumer-hero">
        <div class="consumer-copy">
          <p class="consumer-eyebrow">Consumer smoke surface</p>
          <h1>Lolita UI tarball install check</h1>
          <p class="consumer-summary">
            This page proves the published package entries, styles, theme layer,
            and Pro surface can all be consumed from packed artifacts.
          </p>
          <p class="consumer-theme-token" data-testid="consumer-theme-token">
            Primary token: {{ themeSnapshot.cssVars['--l-color-primary'] }}
          </p>
        </div>
        <LSpace>
          <LButton data-testid="consumer-primary-action" type="primary">
            Primary action
          </LButton>
          <LButton type="dashed">Secondary action</LButton>
        </LSpace>
      </section>

      <section class="consumer-table-card" data-testid="consumer-pro-table">
        <ProSearchTable
          :columns="columns"
          :search-schema="searchSchema"
          :request="request"
          :initial-pagination="{ current: 1, pageSize: 2 }"
        />
      </section>
    </main>
  </LConfigProvider>
</template>

<style scoped>
.consumer-shell {
  min-height: 100vh;
  padding: 48px 24px 64px;
  background:
    radial-gradient(circle at top left, rgba(255, 107, 129, 0.22), transparent 28%),
    linear-gradient(180deg, #10131c 0%, #171b27 100%);
  color: #f4f6fb;
}

.consumer-hero {
  display: grid;
  gap: 24px;
  align-items: end;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(15, 18, 27, 0.78);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}

.consumer-copy {
  display: grid;
  gap: 12px;
}

.consumer-eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #ff9bad;
}

.consumer-copy h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.04;
}

.consumer-summary {
  max-width: 60ch;
  margin: 0;
  color: rgba(244, 246, 251, 0.78);
}

.consumer-theme-token {
  margin: 0;
  font-family: "Courier New", monospace;
  color: #ffd4db;
}

.consumer-table-card {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(12, 15, 23, 0.88);
}
</style>
