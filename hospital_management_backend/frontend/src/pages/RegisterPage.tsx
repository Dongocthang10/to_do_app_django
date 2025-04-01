import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { RegistrationFormData } from '../types'; // Import kiểu dữ liệu form
import { registerUser } from '../services/apiService'; // Import hàm API đăng ký

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState(''); // Password confirmation
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // --- Client-side validation: Password match ---
        if (password !== password2) {
            setError('Passwords do not match.');
            return;
        }
        // --- (Có thể thêm các validation khác ở đây) ---

        setLoading(true);
        const registrationData: RegistrationFormData = {
            username,
            email,
            password,
            password2,
            // firstName,
            // lastName
        };

        try {
            await registerUser(registrationData);
            setSuccessMessage('Registration successful! Please log in.');
            // Xóa form hoặc redirect sau một khoảng thời gian ngắn
            setTimeout(() => {
                 navigate('/login'); // Chuyển hướng đến trang đăng nhập
            }, 2000); // Chờ 2 giây

        } catch (err: any) {
            setError(err.message || 'Registration failed. Please check your input.');
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Register New Account</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
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
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        // Thêm gợi ý về yêu cầu mật khẩu nếu có
                    />
                </div>
                 <div>
                    <label htmlFor="password2">Confirm Password:</label>
                    <input
                        type="password"
                        id="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="firstname">First Name:</label>
                    <input
                        type="text"
                        id="firstname"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="lastname">Last Name:</label>
                    <input
                        type="text"
                        id="lastname"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p style={{marginTop: "15px"}}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;