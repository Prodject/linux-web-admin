"""
Django settings for netsecui project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '($d*tg9rv_i+mtaq4)tai(vl^6dbjr*e+22nlf@)e=$-!04m4!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True
#All refresh values are in miliseconds, 1 second = 1000 miliseconds
#Adjust accordingly as you wish
TIME_JS_REFRESH = 30000
TIME_JS_REFRESH_LONG = 120000
TIME_JS_REFRESH_NET = 2000

APPNAME = "Site-Site VPN"
VERSION = "1.0.0.1"
RELEASE = False

NETWORK_PATH = "system/etc/network/interfaces.d/"
NETWORK_PATH = os.path.join(BASE_DIR, NETWORK_PATH)

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'dashboard',
    'objects',
    'networking',
    'policies',
    'vpn'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'netsecui.urls'

WSGI_APPLICATION = 'netsecui.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
#     'default': {
#        'ENGINE': 'django.db.backends.postgresql_psycopg2',
#        'NAME': 'netsec',
#        'USER': 'root',
#        'PASSWORD': 'qwe123!@#',
#        'HOST': 'localhost',
#        'PORT': '',
#    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Tehran'

USE_I18N = True

USE_L10N = True

USE_TZ = True


STATIC_URL = '/static/'
LOGIN_REDIRECT_URL = 'dashboard'
