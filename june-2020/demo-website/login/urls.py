from django.urls import path
from django.conf.urls import url

from . import views

app_name = "login"

urlpatterns = [
    path('register', views.register, name="register"),
    path('edit_profile', views.edit_profile, name="edit_profile"),
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.activate, name="activate"),
    path('sign_out', views.sign_out, name="sign_out"),
]
