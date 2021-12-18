import axios from 'axios';
import { AuthResponse } from '../models/response/AuthResponse';

export const API_URL = `http://localhost:5000/api`;

const $api = axios.create({
    withCredentials: true, // Автоматическое закрепление cookie
    baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
    // На каждый запрос будет закреплён токен доступа
    config.headers!.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});

$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    // Для повтора исходного запроса
    const originalRequest = error.config;

    // Обновление токена
    if((error.response.status == 401)
        && (error.config)
        && (!error.config._isRetry)){
        originalRequest._isRetry = true;
        try{
            const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
                withCredentials: true,
              });
            
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        }catch(e){
            console.log(e);
        }
    }

    throw error;
});

export default $api;
