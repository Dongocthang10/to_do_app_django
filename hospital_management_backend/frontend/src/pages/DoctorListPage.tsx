import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { getDoctors } from '../services/apiService';

const DoctorListPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // ... (Thêm xử lý error tương tự PatientListPage) ...

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  if (loading) return <div>Loading doctors...</div>;
  // ... (Render lỗi nếu có) ...

  return (
    <div>
      <h1>Doctor List</h1>
      {doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <ul>
          {doctors.map((doctor) => (
            <li key={doctor.id}>
              Dr. {doctor.name} ({doctor.specialty || 'N/A'})
              {doctor.email && ` - ${doctor.email}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorListPage;