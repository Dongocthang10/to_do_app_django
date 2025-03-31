export interface Patient {
    // ... (giữ nguyên Patient interface) ...
    id: string;
    name: string;
    date_of_birth: string | null;
    created_at: string;
  }
  
  // --- Thêm Doctor interface ---
  export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    phone_number?: string; // Dùng ? nếu trường có thể null/blank
    email?: string;
  }
  
  // --- Thêm Appointment interface ---
  export interface Appointment {
    id: string;
    patient: string; // ID của bệnh nhân khi gửi đi
    patient_name?: string; // Tên bệnh nhân khi đọc về
    doctor: string; // ID của bác sĩ khi gửi đi
    doctor_name?: string; // Tên bác sĩ khi đọc về
    appointment_time: string; // ISO string format (vd: "2025-03-30T10:00:00Z")
    reason?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    created_at?: string;
  }
  
  // Kiểu dữ liệu cho form tạo Appointment
  export interface AppointmentFormData {
      patient: string; // ID
      doctor: string; // ID
      appointment_time: string; // Có thể cần xử lý định dạng ngày giờ
      reason?: string;
      status?: 'Scheduled' | 'Completed' | 'Cancelled'; // Có thể mặc định là 'Scheduled'
      notes?: string;
  }

  export interface PatientFormData{
      name: string;
      date_of_birth?: string | null;
  }

  export interface DoctorFormData {
    name: string;
    specialty?: string;
    phone_number?: string;
    email?: string;
}