import React, { useState, useEffect } from 'react';
import { Patient, Doctor, AppointmentFormData } from '../types';
import { getPatients, getDoctors, createAppointment } from '../services/apiService';

interface AppointmentFormProps {
    onAppointmentCreated: () => void; // Callback để load lại danh sách appointments
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onAppointmentCreated }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [appointmentTime, setAppointmentTime] = useState<string>(''); // Format YYYY-MM-DDTHH:mm
    const [reason, setReason] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        // Load danh sách patients và doctors cho dropdown
        const loadData = async () => {
            const [patientData, doctorData] = await Promise.all([
                getPatients(),
                getDoctors()
            ]);
            setPatients(patientData);
            setDoctors(doctorData);
            // Set giá trị mặc định nếu có
            if(patientData.length > 0) setSelectedPatient(patientData[0].id);
            if(doctorData.length > 0) setSelectedDoctor(doctorData[0].id);
        };
        loadData();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!selectedPatient || !selectedDoctor || !appointmentTime) {
            setError("Please select patient, doctor, and appointment time.");
            return;
        }

        const appointmentData: AppointmentFormData = {
            patient: selectedPatient,
            doctor: selectedDoctor,
            appointment_time: new Date(appointmentTime).toISOString(), // Chuyển sang ISO string UTC
            reason: reason,
            status: 'Scheduled' // Mặc định
        };

        setSubmitting(true);
        try {
            await createAppointment(appointmentData);
            // Reset form
            // setSelectedPatient(patients[0]?.id || '');
            // setSelectedDoctor(doctors[0]?.id || '');
            setAppointmentTime('');
            setReason('');
            onAppointmentCreated(); // Gọi callback để load lại danh sách
            alert('Appointment created successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to create appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
            <h3>Create New Appointment</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Patient: </label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                    <option value="" disabled>Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label>Doctor: </label>
                <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required>
                     <option value="" disabled>Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                </select>
            </div>
            <div>
                <label>Appointment Time: </label>
                <input
                    type="datetime-local"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                />
            </div>
             <div>
                <label>Reason: </label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Appointment'}
            </button>
        </form>
    );
};

export default AppointmentForm;