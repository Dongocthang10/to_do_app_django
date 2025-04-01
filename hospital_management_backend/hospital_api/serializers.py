from rest_framework import serializers
from .models import Patient, Doctor, Appointment
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

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
        
class RegisterSerializer(serializers.ModelSerializer):
    # Thêm trường password2 để xác nhận mật khẩu
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    # Đảm bảo email là bắt buộc khi đăng ký
    email = serializers.EmailField(required=True)
    # Có thể thêm first_name, last_name nếu muốn
    # first_name = serializers.CharField(required=False)
    # last_name = serializers.CharField(required=False)


    class Meta:
        model = User
        # Các trường cần thiết để tạo User mới
        fields = ['username', 'email', 'password', 'password2'] #, 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True, # Mật khẩu không bao giờ được trả về trong response
                         'style': {'input_type': 'password'},
                         # Bỏ qua các validators mặc định của DRF để dùng validate_password của Django
                         'validators': []}
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        email = attrs.get('email')
        username = attrs.get('username')

        # 1. Kiểm tra mật khẩu khớp nhau
        if password != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # 2. Kiểm tra username và email đã tồn tại chưa
        if User.objects.filter(username=username).exists():
             raise serializers.ValidationError({"username": "Username already exists."})
        if User.objects.filter(email=email).exists():
             raise serializers.ValidationError({"email": "Email already exists."})


        # 3. Sử dụng trình xác thực mật khẩu của Django (độ dài, ký tự, phổ biến...)
        # Cần cấu hình AUTH_PASSWORD_VALIDATORS trong settings.py (thường đã có sẵn)
        try:
            validate_password(password)
        except serializers.ValidationError as e:
            # Nâng cao lỗi validation của Django thành lỗi của DRF
            raise serializers.ValidationError({'password': list(e.messages)})

        return attrs

    def create(self, validated_data):
        # Tạo User mới với mật khẩu đã được hash
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            # first_name=validated_data.get('first_name', ''),
            # last_name=validated_data.get('last_name', '')
        )

        # Sử dụng set_password để hash mật khẩu
        user.set_password(validated_data['password'])
        user.save()

        return user
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