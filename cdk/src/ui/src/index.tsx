import React from 'react';
import ReactDOM from 'react-dom/client';

const api = process.env.API_URL;
console.log(process.env.API_URL)
const App: React.FC = () => {
    return <div>
               <h1>Hello, world!</h1>
               <h2>API_URL = {api}</h2>
            </div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);