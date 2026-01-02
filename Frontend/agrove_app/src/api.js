const API_URL = import.meta.env.VITE_API_URL;

export const fetchData = () => fetch(`${API_URL}/data`);