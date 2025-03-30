import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { getPatients } from '../services/apiService';

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        setError('Failed to load patients.'); // Lỗi này có thể đã được log trong apiService
        console.error(err); // Log lỗi chi tiết hơn nếu cần
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []); // Chạy một lần khi component mount

  if (loading) {
    return <div>Loading patients...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Patient List</h1>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {patients.map((patient) => (
            <li key={patient.id}>
              {patient.name} (Born: {patient.date_of_birth || 'N/A'})
            </li>
          ))}
        </ul>
      )}
      {/* Thêm nút hoặc form để tạo bệnh nhân mới ở đây */}
    </div>
  );
};

export default PatientListPage;