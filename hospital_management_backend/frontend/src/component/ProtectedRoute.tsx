import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const auth = useContext(AuthContext);
    const location = useLocation(); // Lấy vị trí hiện tại để redirect về sau khi login

     if (!auth) {
        // Trường hợp này không nên xảy ra nếu đã bọc App trong Provider
         console.error("ProtectedRoute must be used within an AuthProvider");
         return <Navigate to="/login" replace />;
     }

    if (!auth.isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        // state={{ from: location }} để LoginPage biết cần redirect về đâu sau khi login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, render component con (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;