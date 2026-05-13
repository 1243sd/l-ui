<template>
  <div class="hello">
    <p>{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ msg: string }>();
</script>

<style scoped>
.hello {
  padding: 2rem;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: inline-block;
  background: #f9fafb;
}
</style>
