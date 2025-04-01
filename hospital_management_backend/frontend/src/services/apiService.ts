import axios, { AxiosError } from 'axios';
// Import các types mới
import { Patient, Doctor, Appointment, AppointmentFormData, PatientFormData, DoctorFormData, RegistrationFormData, UserRegistrationResponse } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}
interface LoginResponse {
  access: string;
  refresh: string;
}

interface RefreshResponse {
  access: string;
  // Một số cấu hình simplejwt có thể trả về cả refresh token mới nếu ROTATE_REFRESH_TOKENS=True
  refresh?: string;
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

let isRefreshing = false;

let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

// Hàm lấy danh sách bệnh nhân

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
      if (error) {
          prom.reject(error);
      } else {
          prom.resolve(token); // Truyền token mới để request được thử lại (không cần thiết nếu interceptor request hoạt động đúng)
      }
  });
  failedQueue = [];
};


apiClient.interceptors.response.use(
  // Response thành công thì trả về luôn
  (response) => {
      return response;
  },
  // Xử lý khi có lỗi response
  async (error: AxiosError) => {
      const originalRequest = error.config;

      // Chỉ xử lý lỗi 401 Unauthorized và không phải là request đến endpoint refresh token
      // Thêm điều kiện !originalRequest._retry để tránh lặp vô hạn nếu refresh cũng lỗi 401
      if (error.response?.status === 401 && originalRequest && originalRequest.url !== '/token/refresh/' && !(originalRequest as any)._retry) {

          if (isRefreshing) {
              // Nếu đang refresh rồi, đưa request này vào hàng đợi
               return new Promise((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
               }).then(() => {
                   // Sau khi refresh xong, thử lại request này
                   (originalRequest as any)._retry = true; // Đánh dấu đã thử lại (dù thành công hay không)
                   // Token mới đã được lưu, interceptor request sẽ tự lấy
                   return apiClient(originalRequest);
               }).catch(err => {
                   return Promise.reject(err); // Nếu refresh thất bại
               });
          }

          (originalRequest as any)._retry = true; // Đánh dấu để chỉ thử lại 1 lần
          isRefreshing = true; // Bắt đầu quá trình refresh

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
              console.log('Refresh token not found, logging out.');
              isRefreshing = false;
               // Xử lý logout ở đây (ví dụ: gọi hàm từ context hoặc dispatch action)
               // window.location.href = '/login'; // Cách đơn giản nhất là redirect cứng
               // TODO: Gọi hàm logout từ AuthContext một cách an toàn
              return Promise.reject(error); // Từ chối request gốc
          }

          try {
              console.log('Access token expired, attempting to refresh...');
              const response = await axios.post<RefreshResponse>(`${API_BASE_URL}/token/refresh/`, {
                  refresh: refreshToken
              });

              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              console.log('Token refreshed successfully.');

              // Cập nhật header cho request gốc (không thực sự cần nếu interceptor request hoạt động)
              // apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              // if(originalRequest.headers) {
              //    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              // }

               isRefreshing = false;
               processQueue(null, newAccessToken); // Xử lý các request chờ

              // Thử lại request gốc với token mới (interceptor request sẽ tự thêm token mới)
              return apiClient(originalRequest);

          } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              isRefreshing = false;
              processQueue(refreshError as AxiosError, null); // Báo lỗi cho các request chờ

              // Xử lý logout khi refresh thất bại
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              // TODO: Gọi hàm logout từ AuthContext một cách an toàn
              // window.location.href = '/login';
              alert('Your session has expired. Please log in again.'); // Thông báo cho người dùng

              return Promise.reject(refreshError); // Từ chối request gốc
          }
      }

      // Trả về lỗi cho các trường hợp khác (không phải 401 hoặc đã retry)
      return Promise.reject(error);
  }
);


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

export const registerUser = async (userData: RegistrationFormData): Promise<UserRegistrationResponse> => {
  try {
      // Gửi request đến endpoint /api/register/
      const response = await apiClient.post<UserRegistrationResponse>('/register/', userData);
      return response.data;
  } catch (error) {
      console.error('Registration API error:', error);
      // Trả về lỗi cụ thể từ backend (vd: username exists, password mismatch - được validate ở serializer)
      throw new Error(handleError(error, 'Registration failed'));
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