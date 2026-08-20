from django.urls import path
from skills.views import SkillListCreateView, SkillDetailView
from config.endpoints import SkillEndpoints as EP

urlpatterns = [
    path(EP.LIST_CREATE, SkillListCreateView.as_view(), name='skill-list-create'),
    path(EP.DETAIL, SkillDetailView.as_view(), name='skill-detail'),
]