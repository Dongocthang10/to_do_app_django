import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Patient, PatientFormData } from '../types';
import { getPatients, createPatient, deletePatient } from '../services/apiService';

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState(''); // Date of Birth
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await getPatients();
        setPatients(data);
    } catch (err) {
        setError('Failed to load patients.');
        console.error(err);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    fetchPatients();
}, [fetchPatients]);

const handleCreatePatient = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    const patientData: PatientFormData = {
        name: newPatientName,
        date_of_birth: newPatientDob || null // Gửi null nếu rỗng
    };

    try {
        await createPatient(patientData);
        setNewPatientName(''); // Reset form
        setNewPatientDob('');
        fetchPatients(); // Load lại danh sách
        alert('Patient created successfully!');
    } catch (err: any) {
        setFormError(err.message || 'Failed to create patient.');
    } finally {
        setIsSubmitting(false);
    }
};

const handleDeletePatient = async (patientId: string, patientName: string) => {
    // Hỏi xác nhận trước khi xóa
    if (window.confirm(`Are you sure you want to delete patient "${patientName}"? This might also delete related appointments.`)) {
        try {
            await deletePatient(patientId);
            fetchPatients(); // Load lại danh sách
            alert('Patient deleted successfully!');
        } catch (err: any) {
            alert(`Failed to delete patient: ${err.message}`);
        }
    }
};

if (loading) return <div>Loading patients...</div>;
if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;


return (
  <div>
      <h1>Patient List</h1>

      {/* Form tạo Patient mới */}
      <form onSubmit={handleCreatePatient} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Add New Patient</h3>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <div>
              <label>Name: </label>
              <input
                  type="text"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  required
                  disabled={isSubmitting}
              />
          </div>
          <div>
              <label>Date of Birth: </label>
              <input
                  type="date"
                  value={newPatientDob}
                  onChange={(e) => setNewPatientDob(e.target.value)}
                  disabled={isSubmitting}
              />
          </div>
          <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Patient'}
          </button>
      </form>

      {/* Danh sách Patient */}
      {patients.length === 0 ? (
          <p>No patients found.</p>
      ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
              {patients.map((patient) => (
                  <li key={patient.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                          {patient.name} (Born: {patient.date_of_birth || 'N/A'})
                      </span>
                      <button
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
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

export default PatientListPage;