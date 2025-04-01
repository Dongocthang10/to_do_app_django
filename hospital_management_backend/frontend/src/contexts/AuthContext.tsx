import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    // refreshToken: string | null; // Có thể thêm nếu cần quản lý refresh token ở đây
    login: (access: string, refresh: string) => void;
    logout: () => void;
}

// Tạo Context với giá trị mặc định là null hoặc một object mặc định
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true); // State để chờ kiểm tra token ban đầu

    // Kiểm tra token trong localStorage khi component mount lần đầu
    useEffect(() => {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedAccessToken && storedRefreshToken) {
            // Tạm thời coi là đã đăng nhập nếu có token
            // Lý tưởng hơn là nên có 1 API endpoint để verify token khi load app
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setIsAuthenticated(true);
        }
         setLoading(false); // Kết thúc trạng thái loading
    }, []);

    const login = useCallback((access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    }, []);

    const logout = useCallback(() => {
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Có thể gọi API để blacklist refresh token ở backend nếu backend hỗ trợ
    }, []);

    // Chỉ render children sau khi đã kiểm tra xong token ban đầu
    if (loading) {
         return <div>Loading authentication...</div>; // Hoặc spinner
    }


    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};