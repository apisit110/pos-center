import axios from 'axios';

const ApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ApiClient;
