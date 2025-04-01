import React, { useContext } from 'react'; // Import useContext
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import PatientListPage from './pages/PatientListPage';
import DoctorListPage from './pages/DoctorListPage';
import AppointmentListPage from './pages/AppointmentListPage';
import LoginPage from './pages/LoginPage'; // Import trang Login
import ProtectedRoute from './component/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import { AuthContext } from './contexts/AuthContext'; // Import AuthContext
import './index.css';


function App() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate(); // Dùng navigate trong component con của Router

     // Component Logout Button riêng để dùng useNavigate
    const LogoutButton = () => {
         const authContext = useContext(AuthContext);
         const navigate = useNavigate();

         const handleLogout = () => {
             if (authContext) {
                authContext.logout();
                navigate('/login'); // Chuyển về trang login sau khi logout
             }
         };

         return <button onClick={handleLogout}>Logout</button>;
    }


    return (
        // Router nên được đặt ở file index.tsx hoặc main.tsx để bao ngoài App
        // Nếu đặt ở đây, các hook như useNavigate phải dùng trong component con
        // <Router> <-- Bỏ Router ở đây nếu đã bọc ở index.tsx
            <div className="App">
                <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
                        {auth?.isAuthenticated && ( // Chỉ hiện link khi đã đăng nhập
                            <>
                                <Link to="/patients" style={{ marginRight: '15px' }}>Patients</Link>
                                <Link to="/doctors" style={{ marginRight: '15px' }}>Doctors</Link>
                                <Link to="/appointments" style={{ marginRight: '15px' }}>Appointments</Link>
                            </>
                        )}
                    </div>
                     <div>
                        {auth?.isAuthenticated ? (
                            <LogoutButton /> // Nút logout
                        ) : (
                            <>
                            <Link to="/login">Login</Link> 
                            <Link to="/register">Register</Link>
                            </>
                        )}
                    </div>
                </nav>

                <main>
                    <Routes>
                        {/* Route công khai */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Routes cần bảo vệ */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/patients" element={<PatientListPage />} />
                            <Route path="/doctors" element={<DoctorListPage />} />
                            <Route path="/appointments" element={<AppointmentListPage />} />
                            {/* Trang chủ sau khi đăng nhập */}
                            <Route path="/" element={
                                <div>
                                    <h2>Welcome back!</h2>
                                    <p>Select a section from the navigation.</p>
                                </div>
                            } />
                        </Route>

                         {/* Route mặc định nếu không khớp và chưa đăng nhập */}
                         {/* Có thể thêm trang 404 Not Found */}
                         <Route path="*" element={ auth?.isAuthenticated ? <div>Page Not Found</div> : <Navigate to="/login" /> } />
                    </Routes>
                </main>
            </div>
        // </Router> <-- Bỏ Router ở đây nếu đã bọc ở index.tsx
    );
}

 // Bọc App bằng Router nếu chưa làm ở index.tsx
 const RootApp = () => (
     <Router>
         <App />
     </Router>
 );


export default RootApp; 