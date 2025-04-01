import axios from 'axios';
// Import các types mới
import { Patient, Doctor, Appointment, AppointmentFormData, PatientFormData, DoctorFormData } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}
interface LoginResponse {
  access: string;
  refresh: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
      // Lấy access token từ localStorage (hoặc nơi bạn lưu trữ)
      const token = localStorage.getItem('accessToken');
      // Không đính kèm token cho các request lấy token
      if (token && config.url !== '/token/' && config.url !== '/token/refresh/') {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

// Hàm lấy danh sách bệnh nhân

const handleError = (error: unknown, defaultMessage: string): string => {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      // Xử lý lỗi 401 (Unauthorized) cụ thể hơn nếu muốn làm refresh token
      if (error.response.status === 401) {
          return error.response.data?.detail || "Authentication failed or token expired.";
      }
      if (typeof errorData === 'object' && errorData !== null) {
          const messages = Object.values(errorData).flat().join(' ');
          if (messages) return messages;
      }
      if (typeof errorData === 'string') return errorData;
      return error.response.data?.detail || defaultMessage;
  } else if (error instanceof Error) {
      return error.message;
  }
  return defaultMessage;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
      // Gửi request đến endpoint /api/token/ của simplejwt
      const response = await apiClient.post<LoginResponse>('/token/', credentials);
      return response.data;
  } catch (error) {
      console.error('Login API error:', error);
      // Trả về lỗi cụ thể từ backend nếu có (vd: "No active account found with the given credentials")
      throw new Error(handleError(error, 'Login failed'));
  }
};

// export const getPatients = async (): Promise<Patient[]> => {
//   try {
//     const response = await apiClient.get<Patient[]>('/patients/');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching patients:', error);
//     // Xử lý lỗi tốt hơn trong ứng dụng thực tế (vd: throw error, trả về mảng rỗng)
//     return [];
//   }
// };

export const getPatients = async (): Promise<Patient[]> => {
  try {
     const response = await apiClient.get<Patient[]>('/patients/');
     return response.data;
 } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error(handleError(error, 'Failed to load patients. Are you logged in?')); // Cập nhật thông báo lỗi
 }
};

// export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
//     try {
//         const response = await apiClient.post<Patient>('/patients/', patientData);
//         return response.data;
//     } catch (error) {
//         console.error('Error creating patient:', error);
//         throw new Error(handleError(error, 'Failed to create patient'));
//     }
// };

export const createPatient = async (patientData: PatientFormData): Promise<Patient> => {
  try {
      const response = await apiClient.post<Patient>('/patients/', patientData);
      return response.data;
  } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error(handleError(error, 'Failed to create patient. Check permissions or data.'));
  }
};

export const deletePatient = async (patientId: string): Promise<void> => {
    try {
        await apiClient.delete(`/patients/${patientId}/`);
    } catch (error) {
        console.error('Error deleting patient:', error);
        throw new Error(handleError(error, 'Failed to delete patient'));
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

export const createDoctor = async (doctorData: DoctorFormData): Promise<Doctor> => {
    try {
        const response = await apiClient.post<Doctor>('/doctors/', doctorData);
        return response.data;
    } catch (error) {
        console.error('Error creating doctor:', error);
        throw new Error(handleError(error, 'Failed to create doctor'));
    }
};


export const deleteDoctor = async (doctorId: string): Promise<void> => {
  try {
      await apiClient.delete(`/doctors/${doctorId}/`);
  } catch (error) {
      console.error('Error deleting doctor:', error);
      throw new Error(handleError(error, 'Failed to delete doctor'));
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


export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
      await apiClient.delete(`/appointments/${appointmentId}/`);
  } catch (error) {
      console.error('Error deleting appointment:', error);
      throw new Error(handleError(error, 'Failed to delete appointment'));
  }
};

// Thêm các hàm khác ở đây (getPatientById, createPatient, updatePatient, ...)