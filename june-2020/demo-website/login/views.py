import gc
from decouple import config

from django.contrib import messages
from django.http import HttpResponse
from django.utils.http import urlsafe_base64_decode
from django.urls import reverse
from django.shortcuts import render, redirect
from django.utils.encoding import force_text

from console_main.views import login_required, send_email

from .models import DIDUser
from .forms import DIDUserCreationForm, DIDUserChangeForm
from .tokens import account_activation_token


def register(request):
    if 'redirect_success' not in request.session.keys():
        return redirect(reverse('landing'))
    if request.method == 'POST':
        form = DIDUserCreationForm(request.POST,
                                   initial={'name': request.session['name'], 'email': request.session['email'],
                                            'did': request.session['did']})
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            to_email = form.cleaned_data.get('email')
            send_email(request, to_email, user)
            request.session['name'] = user.name
            request.session['email'] = user.email
            messages.success(
                request, "Please check your email to complete your registration")
            return redirect(reverse('landing'))
    else:
        form = DIDUserCreationForm(initial={'name': request.session['name'], 'email': request.session['email'],
                                            'did': request.session['did']})
    return render(request, 'login/register.html', {'form': form})


@login_required
def edit_profile(request):
    did_user = DIDUser.objects.get(did=request.session['did'])
    if request.method == 'POST':
        form = DIDUserChangeForm(request.POST, instance=request.user)

        if form.is_valid():
            user = form.save(commit=False)
            # This means the user changed their email address
            if user.email != did_user.email:
                user.is_active = False
                user.save()
                to_email = form.cleaned_data.get('email')
                send_email(request, to_email, user)
                messages.success(
                    request, "Please check your email to finish modifying your profile info")
            else:
                user.save()
            return redirect(reverse('landing'))
    else:
        if did_user.is_active is False:
            send_email(request, did_user.email, did_user)
            messages.success(request,
                             "The email '%s' needs to be verified. Please check your email for confirmation link" % did_user.email)
            return redirect(reverse('landing'))
        form = DIDUserChangeForm(instance=request.user)
    return render(request, 'login/edit_profile.html', {'form': form})


def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = DIDUser.objects.get(did=uid)
    except(TypeError, ValueError, OverflowError, DIDUser.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, "Email has been confirmed!")
        return redirect(reverse('landing'))
    else:
        return HttpResponse('Activation link is invalid!')


@login_required
def sign_out(request):
    request.session.clear()
    gc.collect()
    did_login = config('DIDLOGIN', default=False, cast=bool)
    if not did_login:
        messages.success(request, "You have disabled DID LOGIN. Unable to log out! Please re-run the server with "
                                  "DIDLOGIN set to True")
    else:
        messages.success(request, "You have been logged out!")
    return redirect(reverse('landing'))
