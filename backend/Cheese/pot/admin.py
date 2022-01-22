from django.contrib import admin

from .models import Pot, Currency

class PotAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'name', 'amount')
    list_filter:tuple = ('user',)

class CurrencyAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'code')

admin.site.register(Pot, PotAdmin)
admin.site.register(Currency, CurrencyAdmin)