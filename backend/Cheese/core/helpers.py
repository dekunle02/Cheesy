from datetime import date

"""
@desc Function that converts a string of a date in ISO format to a date object
@param {String} The string to process
@returns {Date} The date created from the process
@example '2021-5-1' -> Date(2021,5,1)
"""
def string_to_date(string: str) -> date:
    date_list: list = [int(d) for d in string.split('-')]
    return date(date_list[0], date_list[1], date_list[2])



def date_to_string(d: date) -> str:
    return f"{d.year}-{d.month}-{d.day}"
