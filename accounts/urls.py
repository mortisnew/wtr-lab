from django.urls import path,include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register('profile',views.ProfileViewSet,basename='user_profile'),

urlpatterns = [
    path('',include(router.urls)),
    path('register',views.RegisterView.as_view(),name='user_register'),
    path('login',views.LoginView.as_view(),name='user_login'),
    path('logout',views.LogoutView.as_view(),name='user_logout'),
]