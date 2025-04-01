from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,   
    # TokenVerifyView,   # View để kiểm tra token (tùy chọn)
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints của ứng dụng hospital_api
    path('api/', include('hospital_api.urls')),

    # API endpoints cho việc xác thực token JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'), # Nếu cần verify

    # Nếu bạn muốn dùng login/logout của DRF (thường cho SessionAuth) thì thêm:
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]