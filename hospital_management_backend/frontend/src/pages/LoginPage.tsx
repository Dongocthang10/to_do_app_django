import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Để chuyển hướng sau khi login
import { loginUser } from '../services/apiService'; // Hàm gọi API login (sẽ tạo ở bước sau)
import { AuthContext } from '../contexts/AuthContext';


const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useContext(AuthContext); // Lấy context

    if (!auth) {
         throw new Error("AuthContext must be used within an AuthProvider");
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Gọi API login từ service
            const data = await loginUser({ username, password });
            // Gọi hàm login từ context để lưu token và cập nhật state
            auth.login(data.access, data.refresh);
            // Chuyển hướng đến trang chính sau khi đăng nhập thành công
            navigate('/appointments'); // Hoặc trang dashboard nào đó
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;