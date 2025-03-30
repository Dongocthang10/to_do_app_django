from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, DoctorViewSet, AppointmentViewSet # Import viewsets mới

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)       # Đăng ký doctors
router.register(r'appointments', AppointmentViewSet) # Đăng ký appointments

urlpatterns = [
    path('', include(router.urls)),
]