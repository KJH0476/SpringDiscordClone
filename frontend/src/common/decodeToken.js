import {jwtDecode} from 'jwt-decode';

export const decodeToken = () => {
    const token = window.localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.sub; //토큰에서 정보추출
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};
