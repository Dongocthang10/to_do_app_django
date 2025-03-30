# todoproject/todoproject/urls.py

from django.contrib import admin
from django.urls import path, include # Add include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todoapp.urls')), # Include your app's URLs under 'todos/'
    # You could also use path('', include('todoapp.urls')) to make it the site root
]