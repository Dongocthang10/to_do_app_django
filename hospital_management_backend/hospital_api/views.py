from rest_framework import viewsets, permissions # Thêm permissions nếu cần
from .models import Patient, Doctor, Appointment
from .serializers import PatientSerializer, DoctorSerializer, AppointmentSerializer

class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    # ... (giữ nguyên PatientViewSet) ...
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer

# --- Thêm DoctorViewSet ---
class DoctorViewSet(viewsets.ReadOnlyModelViewSet): # Chỉ cho xem danh sách bác sĩ
    """
    API endpoint allows doctors to be viewed.
    """
    queryset = Doctor.objects.all().order_by('name')
    serializer_class = DoctorSerializer
    # permission_classes = [permissions.IsAuthenticated]

# --- Thêm AppointmentViewSet ---
class AppointmentViewSet(viewsets.ModelViewSet): # Cho phép CRUD
    """
    API endpoint allows appointments to be viewed or edited.
    """
    queryset = Appointment.objects.all().order_by('-appointment_time')
    serializer_class = AppointmentSerializer
    # permission_classes = [permissions.IsAuthenticated] # Nên có quyền cụ thể hơn ở đây

    # Có thể thêm filter backend nếu cần, ví dụ:
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['status', 'doctor', 'patient', 'appointment_time__date']