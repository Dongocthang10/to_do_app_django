import axios from 'axios';
// Import các types mới
import { Patient, Doctor, Appointment, AppointmentFormData } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm lấy danh sách bệnh nhân
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await apiClient.get<Patient[]>('/patients/');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Xử lý lỗi tốt hơn trong ứng dụng thực tế (vd: throw error, trả về mảng rỗng)
    return [];
  }
};

export const getDoctors = async (): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<Doctor[]>('/doctors/');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  };


  export const getAppointments = async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<Appointment[]>('/appointments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

  export const createAppointment = async (appointmentData: AppointmentFormData): Promise<Appointment> => {
    try {
        const response = await apiClient.post<Appointment>('/appointments/', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        // Nên throw lỗi để component có thể xử lý
        if (axios.isAxiosError(error) && error.response) {
             // Log lỗi chi tiết hơn từ backend nếu có
            console.error('Backend Error:', error.response.data);
            throw new Error(error.response.data?.detail || 'Failed to create appointment');
        }
        throw new Error('Failed to create appointment');
    }
};

// Thêm các hàm khác ở đây (getPatientById, createPatient, updatePatient, ...)