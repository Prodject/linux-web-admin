from django.conf.urls import patterns, include, url
from objects import views
from networking import views as netviews
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^networking/routing/view$', netviews.routing_view, name='routing_view'),
    url(r'^networking/ethernet/get_virtual', netviews.virtual_view, name='virtual_view'),
    url(r'^networking/ethernet/get_edit$', netviews.ethernet_view, name='ethernet_view'),


    url(r'^networking/routing/delete$', netviews.routing_delete, name='routing_delete'),


    url(r'^networking/routing/update$', netviews.routing_update, name='routing_update'),
    url(r'^networking/ethernet/ethernet_update$', netviews.ethernet_update, name='ethernet_update'),


    url(r'^networking/routing/read$', netviews.routing_read, name='routing_read'),
    url(r'^networking/ethernet/read$', netviews.networking_read, name='networking_read'),


    url(r'^networking/routing/create$', netviews.routing_create, name='routing_create'),
    url(r'^networking/ethernet/add_virtual$', netviews.add_virtual, name='add_virtual'),


    url(r'^routing$', netviews.routing, name='routing'),
    url(r'^networking$', include('networking.urls')),


    url(r'^objects/zone/delete$', views.zone_delete, name='zone_delete'),
    url(r'^objects/schedule/delete$', views.schedule_delete, name='schedule_delete'),
    url(r'^objects/protocol/delete$', views.protocol_delete, name='protocol_delete'),
    url(r'^objects/address/delete$', views.address_delete, name='address_delete'),


    url(r'^objects/zone/getlist$', views.getZoneList, name='getZoneList'),
    url(r'^objects/schedule/getlist$', views.getScheduleList, name='getScheduleList'),
    url(r'^objects/protocol/getlist$', views.getProtocolList, name='getProtocolList'),
    url(r'^objects/protocol/getportlist$', views.getPortList, name='getPortList'),
    url(r'^objects/address/getlist$', views.getAddressList, name='getAddressList'),


    url(r'^objects/protocol/getgroup$', views.getProtocolGroupNames, name='getProtocolGroupNames'),
    url(r'^objects/address/getgroup$', views.getAddressGroupNames, name='getAddressGroupNames'),


    url(r'^objects/zone/view$', views.zone_view, name='zone_view'),
    url(r'^objects/schedule/view$', views.schedule_view, name='schedule_view'),
    url(r'^objects/protocol/view$', views.protocol_view, name='protocol_view'),
    url(r'^objects/address/view$', views.address_view, name='address_view'),


    url(r'^objects/zone/update$', views.zone_update, name='zone_update'),
    url(r'^objects/schedule/update$', views.schedule_update, name='schedule_update'),
    url(r'^objects/protocol/update$', views.protocol_update, name='protocol_update'),
    url(r'^objects/address/update$', views.address_update, name='address_update'),


    url(r'^objects/zone/read$', views.zone_read, name='zone_read'),
    url(r'^objects/schedule/read$', views.schedule_read, name='schedule_read'),
    url(r'^objects/protocol/read$', views.protocol_read, name='protocol_read'),
    url(r'^objects/address/read$', views.address_read, name='address_read'),


    url(r'^objects/zone/create$', views.zone_create, name='zone_create'),
    url(r'^objects/schedule/create$', views.schedule_create, name='schedule_create'),
    url(r'^objects/protocol/create$', views.protocol_create, name='protocol_create'),
    url(r'^objects/address/create$', views.address_create, name='address_create'),


    url(r'^objects/zone$', views.zone_list, name='zone_list'),
    url(r'^objects/schedule$', views.schedule_list, name='schedule_list'),
    url(r'^objects/protocol$', views.protocol_list, name='protocol_list'),
    url(r'^objects/address$', views.address_list, name='address_list'),


    url(r'^objects$', include('objects.urls')),
    url(r'^dashboard$', include('dashboard.urls')),
    url(r'^$', include('dashboard.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
