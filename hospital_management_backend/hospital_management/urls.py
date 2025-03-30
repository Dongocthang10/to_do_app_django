from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('hospital_api.urls')), # Link tới urls của app
    # Thêm các đường dẫn API khác nếu có nhiều app
]