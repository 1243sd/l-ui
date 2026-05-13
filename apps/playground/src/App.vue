<script setup lang="ts">
import { ref } from 'vue';
import { LButton, LConfigProvider } from '@lolita-ui/components-vue';
import { ProSearchTable, type ProSearchTableRequest, type ProTableColumn, type SearchFieldSchema } from '@lolita-ui/pro-vue';

type DemoRow = {
  id: number;
  name: string;
  role: string;
  city: string;
};

const darkMode = ref(false);
const rows: DemoRow[] = Array.from({ length: 58 }).map((_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  role: index % 2 === 0 ? 'Designer' : 'Engineer',
  city: ['Shanghai', 'Tokyo', 'Seoul'][index % 3]
}));

const columns: ProTableColumn<DemoRow>[] = [
  { key: 'id', title: 'ID', dataIndex: 'id' },
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'city', title: 'City', dataIndex: 'city' }
];

const searchSchema: SearchFieldSchema[] = [
  { name: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Name keyword' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'All', value: '' },
      { label: 'Designer', value: 'Designer' },
      { label: 'Engineer', value: 'Engineer' }
    ]
  }
];

const request: ProSearchTableRequest<DemoRow> = async ({ pagination, formValues, signal }) => {
  await new Promise((resolve) => setTimeout(resolve, 220));
  if (signal.aborted) {
    return { data: [], total: 0 };
  }

  const keyword = String(formValues.keyword || '').toLowerCase();
  const role = String(formValues.role || '');
  const filtered = rows.filter((item) => {
    const keywordMatch = !keyword || item.name.toLowerCase().includes(keyword);
    const roleMatch = !role || item.role === role;
    return keywordMatch && roleMatch;
  });

  const start = (pagination.current - 1) * pagination.pageSize;
  const pageData = filtered.slice(start, start + pagination.pageSize);
  return {
    data: pageData,
    total: filtered.length
  };
};

const mode = ref<'light' | 'dark'>('light');
const toggleTheme = () => {
  darkMode.value = !darkMode.value;
  mode.value = darkMode.value ? 'dark' : 'light';
};
</script>

<template>
  <LConfigProvider :theme-mode="mode">
    <div class="playground">
      <header class="hero">
        <h1>Lolita UI Playground</h1>
        <p>Token-driven, cute, and compatible-by-default.</p>
        <LButton type="primary" round @click="toggleTheme">
          Switch to {{ darkMode ? 'Light' : 'Dark' }} Mode
        </LButton>
      </header>

      <section class="table-section">
        <ProSearchTable
          :columns="columns"
          :search-schema="searchSchema"
          :request="request"
          :retries="1"
        >
          <template #toolbar>
            <LButton type="dashed">Batch Action</LButton>
          </template>
          <template #row-actions="{ row }">
            <LButton type="text">View {{ row.id }}</LButton>
          </template>
        </ProSearchTable>
      </section>
    </div>
  </LConfigProvider>
</template>

<style scoped>
.playground {
  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 10% -10%, rgba(255, 183, 197, 0.35), transparent 60%),
    radial-gradient(1000px 400px at 95% 0%, rgba(166, 224, 255, 0.35), transparent 55%),
    var(--l-color-bg-page);
  color: var(--l-color-text-primary);
  padding: 2rem;
  box-sizing: border-box;
}

.hero {
  max-width: 760px;
  margin: 0 auto 2rem auto;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.hero p {
  color: var(--l-color-text-secondary);
  margin-bottom: 1rem;
}

.table-section {
  max-width: 1080px;
  margin: 0 auto;
}
</style>
