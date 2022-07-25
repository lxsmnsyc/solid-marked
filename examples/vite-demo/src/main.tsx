import { render } from 'solid-js/web';
import Example from './Example.md';
import './main.css';

function App() {
  return (
    <div class="bg-gradient-to-r from-indigo-400 to-blue-600 w-full flex">
      <div class="flex flex-col items-center w-full min-h-screen overflow-x-hidden">
        <Example />
      </div>
    </div>
  );
}

const root = document.getElementById('app');

if (root) {
  render(() => <App />, root);
}
