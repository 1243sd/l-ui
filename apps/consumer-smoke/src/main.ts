import { createApp } from 'vue';
import App from './App.vue';
import LolitaUI from '@lolita-ui/components-vue';
import '@lolita-ui/components-vue/style.css';
import '@lolita-ui/pro-vue/style.css';

const app = createApp(App);

app.use(LolitaUI);
app.mount('#app');
