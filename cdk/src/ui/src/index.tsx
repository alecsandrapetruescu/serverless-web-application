import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';

import axios from "axios";


const api = process.env.API_URL;
console.log(process.env.API_URL)


const domNode = document.getElementById('root');
const root = createRoot(domNode, {});

export default function App () {
    const [appSettings, setAppSettings] = useState<any>(null);

    useEffect(() => {
        axios.get('./appSettings.json').then((response: any) => {
            setAppSettings(response.data);
        });
    }, [appSettings && appSettings.data]);

    return (
        <div>
            <h1>Hello, world!</h1>
            <h2>Env API_URL = {api}</h2>
            <h2>API Gateway URL = {appSettings?.API}</h2>
        </div>
    );
};

root.render(<App />);