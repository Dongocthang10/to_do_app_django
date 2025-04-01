import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Import các thành phần router
import PatientListPage from './pages/PatientListPage';
import DoctorListPage from './pages/DoctorListPage'; // Import trang mới
import AppointmentListPage from './pages/AppointmentListPage'; // Import trang mới

function App() {
  return (
    <Router> {/* Bọc toàn bộ ứng dụng trong Router */}
      <div className="App">
        <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
          <Link to="/patients" style={{ marginRight: '15px' }}>Patients</Link>
          <Link to="/doctors" style={{ marginRight: '15px' }}>Doctors</Link>
          <Link to="/appointments">Appointments</Link>
        </nav>

        <main>
          {/* Định nghĩa các Route */}
          <Routes>
             <Route path="/patients" element={<PatientListPage />} />
             <Route path="/doctors" element={<DoctorListPage />} />
             <Route path="/appointments" element={<AppointmentListPage />} />
             {/* Route mặc định/Home */}
             <Route path="/" element={
               <div>
                 <h2>Welcome to Hospital Management</h2>
                 <p>Select a section from the navigation above.</p>
               </div>
             } />
             {/* Thêm Route cho trang chi tiết, form sửa,... nếu cần */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;