import React, { useState } from 'react';
import axios from 'axios';

const UploadCertificate = () => {
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const[name,setname]=useState('')
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('document', file);
        formData.append('aadhaarNumber', aadhaarNumber);
        formData.append('dateOfBirth', dateOfBirth);
        formData.append('name',name)

        try {
            const response = await axios.post('http://localhost:3000/uploadcertificate', formData);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error uploading certificate:', error);
            setMessage('Failed to upload certificate');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Aadhaar Number:</label>

                <div>
                <label>Document:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                />
            </div>
            
                <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    required
                     maxLength="12" 
                    pattern="\d*" 
                />
            </div>
            <div>
                <label>Date of Birth:</label>
                <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Name as per Aadhaar:</label>
                <input
                    type="name"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    required
                    placeholder='eg : Vigneshwaran S'
                />
            </div>
           
            <button type="submit">Upload</button>
            <p>{message}</p>
            
        </form>
    );
};

export default UploadCertificate;
