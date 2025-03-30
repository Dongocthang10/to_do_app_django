# todoproject/todoapp/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # path('', views.todo_list, name='todo_list'), # The main list page
    # path('add/', views.add_todo, name='add_todo'), # URL to handle adding todos
    # path('complete/<int:todo_id>/', views.complete_todo, name='complete_todo'), # URL to mark complete
    # path('delete/<int:todo_id>/', views.delete_todo, name='delete_todo'), # URL to delete
    path('api/todos/', views.todo_api_root, name='todo_api_root'),
    path('api/todos/<int:todo_id>/', views.todo_api_detail, name='todo_api_detail'),
]