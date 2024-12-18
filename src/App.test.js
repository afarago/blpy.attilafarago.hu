import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';

it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = ReactDOM.createRoot(div);
    root.render(<App />);
    root.unmount();
});
