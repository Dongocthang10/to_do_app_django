from rest_framework import serializers
from .models import Patient, Doctor, Appointment

class PatientSerializer(serializers.ModelSerializer):
    # ... (giữ nguyên PatientSerializer) ...
    class Meta:
        model = Patient
        fields = ['id', 'name', 'date_of_birth', 'created_at']

# --- Thêm DoctorSerializer ---
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialty', 'phone_number', 'email']

# --- Thêm AppointmentSerializer ---
class AppointmentSerializer(serializers.ModelSerializer):
    # Hiển thị tên thay vì ID (chỉ đọc)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)

    # Cho phép gửi ID khi tạo/cập nhật
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient', # ID để ghi
            'patient_name', # Tên để đọc
            'doctor', # ID để ghi
            'doctor_name', # Tên để đọc
            'appointment_time',
            'reason',
            'status',
            'notes',
            'created_at'
        ]
        read_only_fields = ['patient_name', 'doctor_name', 'created_at'] # Các trường chỉ đọc

    # Ghi đè để chỉ cần patient_id và doctor_id khi tạo/update
    # Serializer sẽ tự động xử lý việc lấy object từ ID nhờ PrimaryKeyRelatedField
    # def create(self, validated_data):
    #     return Appointment.objects.create(**validated_data)

    # def update(self, instance, validated_data):
    #     instance.patient = validated_data.get('patient', instance.patient)
    #     instance.doctor = validated_data.get('doctor', instance.doctor)
    #     instance.appointment_time = validated_data.get('appointment_time', instance.appointment_time)
    #     instance.reason = validated_data.get('reason', instance.reason)
    #     instance.status = validated_data.get('status', instance.status)
    #     instance.notes = validated_data.get('notes', instance.notes)
    #     instance.save()
    #     return instance