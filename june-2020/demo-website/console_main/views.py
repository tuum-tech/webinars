import json
import logging
import secrets
import time
from datetime import timedelta

import jwt
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.sites.shortcuts import get_current_site
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.urls import reverse

from decouple import config
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import EmailMessage
from django.views.decorators.csrf import csrf_exempt

from login.tokens import account_activation_token
from login.models import DIDUser, DIDRequest
from .settings import SECRET_KEY


def login_required(function):
    def wrapper(request, *args, **kw):
        if not request.session.get('logged_in'):
            return redirect(reverse('landing'))
        return function(request, *args, **kw)

    wrapper.__doc__ = function.__doc__
    wrapper.__name__ = function.__name__
    return wrapper


@csrf_exempt
def did_callback_elastos(request):
    if request.method == 'POST':
        try:
            response = request.body.decode()
            data = json.loads(response)
            # data = jwt.decode(data["jwt"], 'secret', algorithms=['HS256'])
            data = jwt.decode(data["jwt"], verify=False)
        except Exception as e:
            logging.debug(f"Method: did_callback_elastos Error: {e}")
            return JsonResponse({'error': str(e)}, status=404)

        did = data['presentation']['proof']['verificationMethod'].split("#", 1)[0]

        data['DID'] = did
        credentials = data['presentation']['verifiableCredential']
        for cred in credentials:
            if did + "#name" == cred['id']:
                data['Nickname'] = cred['credentialSubject']['name']
            elif did + "#email" == cred['id']:
                data['Email'] = cred['credentialSubject']['email']
            data["exp_time"] = cred['expirationDate']

        req = data["req"].replace("elastos://credaccess/", "")
        appid = jwt.decode(req, verify=False)["appid"]
        data['RandomNumber'] = appid

        try:
            recently_created_time = timezone.now() - timedelta(minutes=1)
            did_request_query_result = DIDRequest.objects.get(state=data["RandomNumber"],
                                                              created_at__gte=recently_created_time)
            if not did_request_query_result:
                return JsonResponse({'message': 'Unauthorized'}, status=401)
            data["auth"] = True
            DIDRequest.objects.filter(state=data["RandomNumber"]).update(data=json.dumps(data))
        except Exception as e:
            logging.debug(f"Method: did_callback_elastos Error: {e}")
            return JsonResponse({'error': str(e)}, status=404)

    return JsonResponse({'result': True}, status=200)


def check_ela_auth(request):
    if 'elaState' not in request.session.keys():
        return JsonResponse({'authenticated': False}, status=403)
    state = request.session['elaState']
    try:
        recently_created_time = timezone.now() - timedelta(minutes=1)
        did_request_query_result = DIDRequest.objects.get(state=state, created_at__gte=recently_created_time)
        data = json.loads(did_request_query_result.data)
        if not data["auth"]:
            return JsonResponse({'authenticated': False}, status=403)

        # Workaround to handle the same DID because elephant wallet doesn't conform to w3c DID yet
        did_to_use = data["DID"]
        if not did_to_use.startswith("did:elastos:"):
            did_to_use = f"did:elastos:{did_to_use}"

        request.session['name'] = data['Nickname']
        request.session['email'] = data['Email']
        request.session['did'] = did_to_use
        if DIDUser.objects.filter(did=did_to_use).exists() is False:
            redirect_url = "/login/register"
            request.session['redirect_success'] = True
        else:
            user = DIDUser.objects.get(did=did_to_use)
            request.session['name'] = user.name
            request.session['email'] = user.email
            request.session['did'] = user.did
            if user.is_active is False:
                redirect_url = "/"
                send_email(request, user.email, user)
                messages.success(request,
                                 "The email '%s' needs to be verified. Please check your email for confirmation link" % user.email)
            else:
                redirect_url = ""
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                request.session['logged_in'] = True
                messages.success(request, "Logged in successfully!")
        del request.session['elaState']
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'redirect': redirect_url}, status=200)


def send_email(request, to_email, user):
    current_site = get_current_site(request)
    mail_subject = 'Activate your Demo Website account'
    message = render_to_string('login/account_activation_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.did)),
        'token': account_activation_token.make_token(user),
    })
    email = EmailMessage(
        mail_subject, message, from_email='"Nucleus Console Support Team" <support@nucleusconsole.com>', to=[to_email]
    )
    email.content_subtype = 'html'

    try:
        email.send()
        return HttpResponse("Success")
    except Exception as e:
        logging.debug(f"Method: send_email Error: {e}")
        return HttpResponse("Failure")


def landing(request):
    did_login = config('DIDLOGIN', default=False, cast=bool)
    context = {}
    if not did_login:
        email = config('SUPERUSER_USER')
        try:
            user = DIDUser.objects.get(email=email)
        except(TypeError, ValueError, OverflowError, DIDUser.DoesNotExist):
            user = DIDUser()
            user.email = email
        user.name = "Test User"
        user.set_password(config('SUPERUSER_PASSWORD'))
        user.did = "test"
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        request.session['name'] = user.name
        request.session['email'] = user.email
        request.session['did'] = user.did
        request.session['logged_in'] = True
    else:
        if 'elaState' in request.session.keys():
            random = request.session['elaState']
        else:
            random = secrets.randbelow(999999999999)
            request.session['elaState'] = random

        # Purge old requests for housekeeping. If the time denoted by 'created_by'
        # is more than 2 minutes old, delete the row
        stale_time = timezone.now() - timedelta(minutes=2)
        DIDRequest.objects.filter(created_at__lte=stale_time).delete()

        # Save token to the database didauth_requests
        token = {'state': random, 'data': {'auth': False}}
        DIDRequest.objects.create(state=token['state'], data=json.dumps(token['data']))

        # Remove duplicate rows(this is a workaround for chrome browser since it sends multiple requests)
        for row in DIDRequest.objects.all().reverse():
            if DIDRequest.objects.filter(state=token['state']).count() > 1:
                row.delete()

        context['elastos_url'] = get_elastos_sign_in_url(request, random)
    return render(request, 'landing.html', context)


def get_elastos_sign_in_url(request, random):
    jwt_claims = {
        'appid': random,
        'iss': config('DIDLOGIN_ELASTOS_REQUESTER'),
        'iat': int(round(time.time())),
        'exp': int(round(time.time() + 300)),
        'callbackurl': config('DIDLOGIN_APP_URL') + '/did_callback_elastos',
        'claims': {
            'name': True,
            'email': True
        }
    }
    jwt_token = jwt.encode(jwt_claims, SECRET_KEY, algorithm='HS256')

    url = 'elastos://credaccess/' + jwt_token.decode()

    return url


