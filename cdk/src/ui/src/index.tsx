import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const api = process.env.API_URL;
const domNode = document.getElementById('root');
const root = createRoot(domNode, {});

export default function App () {
    const [appSettings, setAppSettings] = useState<any>(null);

    useEffect(() => {
        axios.get('./appSettings.json').then((response: any) => {
            setAppSettings(response.data);
        });
    }, [appSettings && appSettings.data]);

    const [contact, setContact] = useState({
        name: '',
        emailTo: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = appSettings.API + "contact";
        axios({
            method: "POST",
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(contact)
        }).then((response)=>{
            if (response.status === 201) {
                alert("Submission was successful! Thank you for contacting us!");
                resetForm()
            } else {
                alert("Submission failed to send.")
            }
        }).catch(error => {
            if (error.response && error.response.status === 404) {
                console.error('Error 404: Resource not found');
            } else {
                console.error('An unexpected error occurred:', error.message);
            }
            alert("Submission failed to send.");
        });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact({ ...contact, [name]: value });
    };

    const resetForm = () => {
        setContact({
            name: '',
            emailTo: '',
            subject: '',
            message: ''
        });
    }

    return (
        <div className="container">
            <h1 className="text-center">Hello, world!</h1>
            <div className="row p-5">
                <div className="col-6">
                </div>
            </div>

            <div className="row p-2">
                <div className="col-6">
                    <h4>App settings</h4>
                    <label></label>
                    <ol className="list-group list-group-numbered">
                        <li className="list-group-item">Env API_URL = {api}</li>
                        <li className="list-group-item">API Gateway URL = {appSettings?.API}</li>
                    </ol>
                </div>
                <div className="col-6">
                    <h4 className="text-left">Contact form</h4>
                    <form id="contact-form" onSubmit={handleSubmit.bind(this)} method="POST">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" className="form-control" name="name"
                                   value={contact.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email address</label>
                            <input type="email" className="form-control" name="emailTo" aria-describedby="emailHelp"
                                   value={contact.emailTo} onChange={handleChange} required/>
                            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Subject</label>
                            <input type="text" className="form-control" name="subject"
                                   value={contact.subject} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea className="form-control" rows="5" name="message"
                                      value={contact.message} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary mt-1">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

root.render(<App />);