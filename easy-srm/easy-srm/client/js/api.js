const API_URL = 'http://localhost:3000/api';

const fetchAPI = async (endpoint, options = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    return res.json();
};