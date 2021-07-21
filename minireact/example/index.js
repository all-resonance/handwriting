// import MiniReact from '../lib/miniReact';
import MiniReact from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <MiniReact.StrictMode>
    <App />
  </MiniReact.StrictMode>,
  document.getElementById('root')
);

