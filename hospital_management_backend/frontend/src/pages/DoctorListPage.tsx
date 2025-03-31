import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Doctor, DoctorFormData } from '../types';
import { getDoctors, createDoctor, deleteDoctor } from '../services/apiService';

const DoctorListPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form tạo mới
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [newDoctorEmail, setNewDoctorEmail] = useState('');
  const [newDoctorPhone, setNewDoctorPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await getDoctors();
        setDoctors(data);
    } catch (err) {
        setError('Failed to load doctors.');
        console.error(err);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    fetchDoctors();
}, [fetchDoctors]);

 const handleCreateDoctor = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    const doctorData: DoctorFormData = {
        name: newDoctorName,
        specialty: newDoctorSpecialty || undefined,
        email: newDoctorEmail || undefined,
        phone_number: newDoctorPhone || undefined
    };

    try {
        await createDoctor(doctorData);
        // Reset form
        setNewDoctorName('');
        setNewDoctorSpecialty('');
        setNewDoctorEmail('');
        setNewDoctorPhone('');
        fetchDoctors(); // Load lại danh sách
        alert('Doctor created successfully!');
    } catch (err: any) {
        setFormError(err.message || 'Failed to create doctor.');
    } finally {
        setIsSubmitting(false);
    }
};

const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This might also delete related appointments.`)) {
        try {
            await deleteDoctor(doctorId);
            fetchDoctors(); // Load lại danh sách
            alert('Doctor deleted successfully!');
        } catch (err: any) {
             alert(`Failed to delete doctor: ${err.message}`);
        }
    }
};


if (loading) return <div>Loading doctors...</div>;
if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

return (
  <div>
    <h1>Doctor List</h1>

     {/* Form tạo Doctor mới */}
     <form onSubmit={handleCreateDoctor} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Add New Doctor</h3>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <div>
              <label>Name: </label>
              <input type="text" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} required disabled={isSubmitting}/>
          </div>
           <div>
              <label>Specialty: </label>
              <input type="text" value={newDoctorSpecialty} onChange={(e) => setNewDoctorSpecialty(e.target.value)} disabled={isSubmitting}/>
          </div>
           <div>
              <label>Email: </label>
              <input type="email" value={newDoctorEmail} onChange={(e) => setNewDoctorEmail(e.target.value)} disabled={isSubmitting}/>
          </div>
           <div>
              <label>Phone: </label>
              <input type="text" value={newDoctorPhone} onChange={(e) => setNewDoctorPhone(e.target.value)} disabled={isSubmitting}/>
          </div>
          <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Doctor'}
          </button>
      </form>

    {/* Danh sách Doctor */}
    {doctors.length === 0 ? (
      <p>No doctors found.</p>
    ) : (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {doctors.map((doctor) => (
          <li key={doctor.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
                Dr. {doctor.name} ({doctor.specialty || 'N/A'})
                {doctor.email && ` - ${doctor.email}`}
            </span>
             <button
                  onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                  style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
              >
                  Delete
              </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
};

export default DoctorListPage;