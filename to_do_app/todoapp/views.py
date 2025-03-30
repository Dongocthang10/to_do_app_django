# todoproject/todoapp/views.py

from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt # Tạm thời để dễ dev, xem lưu ý về CSRF bên dưới
import json
from .models import Todo

@csrf_exempt # Tạm thời vô hiệu hóa CSRF cho API này trong quá trình dev
@require_http_methods(["GET", "POST"]) # Chỉ cho phép GET và POST ở endpoint gốc
def todo_api_root(request):
    if request.method == 'GET':
        # Lấy danh sách todos
        todos = Todo.objects.all().order_by('-created_at')
        data = list(todos.values('id', 'title', 'description', 'completed', 'created_at')) # Chuyển thành list dictionary
        return JsonResponse(data, safe=False) # safe=False vì data là một list

    elif request.method == 'POST':
        # Thêm todo mới
        try:
            body = json.loads(request.body)
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()

            if not title:
                return HttpResponseBadRequest(json.dumps({'error': 'Title cannot be empty'}), content_type="application/json")

            todo = Todo.objects.create(title=title, description=description)
            # Trả về todo vừa tạo
            response_data = {
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'completed': todo.completed,
                'created_at': todo.created_at.isoformat() # Dùng ISO format cho date/time
            }
            return JsonResponse(response_data, status=201) # status 201 Created
        except json.JSONDecodeError:
            return HttpResponseBadRequest(json.dumps({'error': 'Invalid JSON'}), content_type="application/json")
        except Exception as e:
             # Log lỗi ở đây nếu cần
             print(f"Error adding todo: {e}")
             return JsonResponse({'error': 'Could not add todo'}, status=500)

@csrf_exempt # Tạm thời vô hiệu hóa CSRF
@require_http_methods(["GET", "PUT", "DELETE"]) # Cho phép GET, PUT, DELETE
def todo_api_detail(request, todo_id):
    try:
        todo = get_object_or_404(Todo, id=todo_id)

        if request.method == 'GET':
            response_data = {
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'completed': todo.completed,
                'created_at': todo.created_at.isoformat()
            }
            return JsonResponse(response_data)

        elif request.method == 'PUT': # Dùng PUT để cập nhật (hoặc PATCH)
            try:
                body = json.loads(request.body)
                # Cập nhật các trường được phép
                todo.title = body.get('title', todo.title).strip()
                todo.description = body.get('description', todo.description)
                # Chỉ cập nhật completed nếu nó được gửi đến
                if 'completed' in body:
                     todo.completed = bool(body['completed'])

                if not todo.title:
                     return HttpResponseBadRequest(json.dumps({'error': 'Title cannot be empty'}), content_type="application/json")

                todo.save()
                response_data = {
                    'id': todo.id,
                    'title': todo.title,
                    'description': todo.description,
                    'completed': todo.completed,
                    'created_at': todo.created_at.isoformat()
                }
                return JsonResponse(response_data)
            except json.JSONDecodeError:
                return HttpResponseBadRequest(json.dumps({'error': 'Invalid JSON'}), content_type="application/json")
            except Exception as e:
                 print(f"Error updating todo {todo_id}: {e}")
                 return JsonResponse({'error': 'Could not update todo'}, status=500)

        elif request.method == 'DELETE':
            todo.delete()
            return JsonResponse({'message': 'Todo deleted successfully'}, status=204) # status 204 No Content

    except Todo.DoesNotExist:
         return HttpResponseNotFound(json.dumps({'error': 'Todo not found'}), content_type="application/json")
    except Exception as e:
         print(f"Error processing request for todo {todo_id}: {e}")
         return JsonResponse({'error': 'Server error'}, status=500)


# def todo_list(request):
#     todos = Todo.objects.all().order_by('-created_at')
#     context = {'todos': todos}
#     return render(request, 'todoapp/todo_list.html', context)

# def add_todo(request):
#     if request.method == 'POST':
#         title = request.POST.get('title', ' ').strip()
#         description = request.POST.get('description', ' ').strip()
#         if title: 
#             Todo.objects.create(title=title, description=description)
#     return redirect('todo_list')

# def complete_todo(request, todo_id):
#     todo = get_object_or_404(Todo, id=todo_id)
#     todo_completed = not todo.completed
#     todo.save()
#     return redirect('todo_list')

# def delete_todo(request, todo_id):
#     if request.method == "POST":
#         todo = get_object_or_404(Todo, id=todo_id)
#         todo.delete()
#     return redirect('todo_list')

