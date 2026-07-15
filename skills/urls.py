from django.urls import path
from skills.views import SkillListCreateView, SkillDetailView

urlpatterns = [
    path('', SkillListCreateView.as_view(), name='skill-list-create'),
    path('<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),
]