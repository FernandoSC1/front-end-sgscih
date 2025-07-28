import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL do seu backend
});

export default api;
