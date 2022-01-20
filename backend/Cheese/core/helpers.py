from datetime import date

def string_to_date(string):
    date_list = [int(d) for d in string.split('-')]
    return date(date_list[0], date_list[1], date_list[2])


def date_to_string(d):
    return f"{d.year}-{d.month}-{d.day}"
