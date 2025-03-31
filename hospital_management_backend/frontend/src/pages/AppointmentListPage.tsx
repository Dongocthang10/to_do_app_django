import React, { useState, useEffect, useCallback } from 'react';
import { Appointment } from '../types';
import { getAppointments, deleteAppointment } from '../services/apiService';
import AppointmentForm from './AppointmentForm';

const AppointmentListPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string|null>(null); // Thêm state lỗi cho danh sách

  const fetchAppointments = useCallback(async () => {
      setLoading(true);
      setListError(null); // Reset lỗi list
      try {
          const data = await getAppointments();
          setAppointments(data);
      } catch(err) {
          setListError("Failed to load appointments");
          console.error("Failed to load appointments", err)
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchAppointments();
  }, [fetchAppointments]);

  const handleDeleteAppointment = async (appointmentId: string) => {
       if (window.confirm(`Are you sure you want to delete/cancel this appointment?`)) {
          try {
              await deleteAppointment(appointmentId);
              fetchAppointments(); // Load lại danh sách
              alert('Appointment deleted successfully!');
          } catch (err: any) {
               alert(`Failed to delete appointment: ${err.message}`);
          }
      }
  };


  if (loading) return <div>Loading appointments...</div>;

  return (
    <div>
    <h1>Appointment List</h1>

    <AppointmentForm onAppointmentCreated={fetchAppointments} />

    <h2 style={{marginTop: '30px'}}>Scheduled Appointments</h2>
    {/* Hiển thị lỗi nếu có */}
    {listError && <p style={{ color: 'red' }}>{listError}</p>}

    {appointments.length === 0 && !loading ? ( // Chỉ hiển thị "No appointments" khi không loading và không có lỗi
        <p>No appointments found.</p>
    ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map((appt) => (
            <li key={appt.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div> {/* Bọc nội dung vào div để dễ dàng căn chỉnh */}
                <strong>Patient:</strong> {appt.patient_name || 'N/A'} <br />
                <strong>Doctor:</strong> {appt.doctor_name || 'N/A'} <br />
                <strong>Time:</strong> {new Date(appt.appointment_time).toLocaleString()} <br />
                <strong>Reason:</strong> {appt.reason || 'N/A'} <br />
                <strong>Status:</strong> {appt.status}
            </div>
             <button
                onClick={() => handleDeleteAppointment(appt.id)}
                style={{ backgroundColor: 'orange', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginLeft: '10px' }} // Đổi màu cho khác nút Delete kia
            >
                Delete/Cancel
            </button>
            </li>
        ))}
        </ul>
    )}
    </div>
);
};

export default AppointmentListPage;