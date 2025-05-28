import { mount } from 'svelte';
import App from './App.svelte';

// const app = new App({
//   target: document.getElementById("data")
// });
const app = mount(App, { target: document.getElementById("data") });

export default app;