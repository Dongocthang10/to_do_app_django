import React, { useState, useEffect, useCallback } from 'react';
import { Appointment } from '../types';
import { getAppointments } from '../services/apiService';
import AppointmentForm from './AppointmentForm';

const AppointmentListPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // ... (Thêm xử lý error) ...

  // Dùng useCallback để tránh tạo lại hàm fetchAppointments mỗi lần render
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    // setError(null); // Reset lỗi nếu có
    try {
         const data = await getAppointments();
         setAppointments(data);
    } catch(err) {
         // setError(...)
         console.error("Failed to load appointments", err)
    } finally {
         setLoading(false);
    }
  }, []); // Dependency rỗng vì hàm không phụ thuộc state/props bên ngoài

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Chạy khi component mount và khi fetchAppointments thay đổi (ít khi)

  if (loading) return <div>Loading appointments...</div>;
  // ... (Render lỗi nếu có) ...

  return (
    <div>
      <h1>Appointment List</h1>
       {/* Hiển thị form tạo mới */}
      <AppointmentForm onAppointmentCreated={fetchAppointments} />

      <h2 style={{marginTop: '30px'}}>Scheduled Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {appointments.map((appt) => (
            <li key={appt.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>Patient:</strong> {appt.patient_name || 'N/A'} <br />
              <strong>Doctor:</strong> {appt.doctor_name || 'N/A'} <br />
              <strong>Time:</strong> {new Date(appt.appointment_time).toLocaleString()} <br />
              <strong>Reason:</strong> {appt.reason || 'N/A'} <br />
              <strong>Status:</strong> {appt.status}
              {/* Thêm nút để cập nhật status hoặc xóa */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentListPage;