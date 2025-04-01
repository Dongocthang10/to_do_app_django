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
    <div className="max-w-2xl mx-auto p-6 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Appointment List</h1>

      <AppointmentForm onAppointmentCreated={fetchAppointments} />

      <h2 className="text-xl font-semibold text-gray-700 mt-6">Scheduled Appointments</h2>

      {listError && <p className="text-red-500 mt-2">{listError}</p>}

      {appointments.length === 0 && !loading ? (
        <p className="text-gray-500 mt-4">No appointments found.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200">
          {appointments.map((appt) => (
            <li key={appt.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  <strong>Patient:</strong> {appt.patient_name || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong>Doctor:</strong> {appt.doctor_name || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong>Time:</strong> {new Date(appt.appointment_time).toLocaleString()}
                </p>
                <p className="text-gray-700">
                  <strong>Reason:</strong> {appt.reason || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> {appt.status}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAppointment(appt.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
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