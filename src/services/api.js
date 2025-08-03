import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // URL do seu backend
});

export default api;
