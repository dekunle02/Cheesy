from django.contrib import admin

from .models import Transaction, Inflow, Outflow, Transfer, Record

class RecordAdmin(admin.ModelAdmin):
    date_hierarchy = 'date'
    list_display:tuple = ('user', 'transaction', 'old_amount', 'new_amount', 'date')
    list_filter:tuple = ('user',)

admin.site.register(Record, RecordAdmin)

class TransactionAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'title', 'amount', 'kind', 'is_recurring')
    list_filter:tuple = ('user', 'kind', 'is_recurring')

admin.site.register(Transaction, TransactionAdmin)

class InflowAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'title', 'amount', 'kind', 'is_recurring')
    list_filter:tuple = ('user', 'is_recurring', 'is_transfer')

admin.site.register(Inflow, InflowAdmin)

class OutflowAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'title', 'amount', 'kind', 'is_recurring')
    list_filter:tuple = ('user', 'is_recurring')

admin.site.register(Outflow, OutflowAdmin)

class TransferAdmin(admin.ModelAdmin):
    list_display:tuple = ('user', 'title', 'amount', 'from_pot', 'to_pot', 'is_recurring')
    list_filter:tuple = ('user', 'is_recurring')

admin.site.register(Transfer, TransferAdmin)