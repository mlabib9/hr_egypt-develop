# Copyright (c) 2022, Brandimic.com and contributors
# For license information, please see license.txt

from datetime import datetime
from warnings import filters

import frappe


def on_save(doc, event):
    if doc.log_type == "IN":
        calc_delay(doc)
    elif doc.log_type == "OUT":
        calc_overtime(doc)


def calc_delay(doc):
    """get employee shift start and employee checkin in time and
    check if the shift has entry_grace_period"""

    shift = frappe.get_doc("Shift Type", doc.shift)
    grace_period = shift.late_entry_grace_period * 60
    time = datetime.strptime(doc.time, "%Y-%m-%d %H:%M:%S")
    shift_start = doc.shift_start

    if not doc.shift == None:
        if doc.log_type == "IN":
            if time > (shift_start):
                delay = time - shift_start
                delay = delay.total_seconds()
                if shift.enable_entry_grace_period == 1:
                    if delay > grace_period:
                        doc.delay = delay - grace_period
                    else:
                        doc.delay = 0
                else:
                    doc.delay = delay
            else:
                doc.delay = 0
        else:
            doc.delay = 0
    else:
        doc.delay = 0


def calc_overtime(doc):
    settings = frappe.get_doc("HR Egypt Settings")
    if settings.enable_overtime_request == 1:
        time = datetime.strptime(doc.time, "%Y-%m-%d %H:%M:%S")
        overtime = time - doc.shift_end
        overtime = overtime.total_seconds()
        if overtime > int(settings.overtime_after):
            doc.overtime = overtime
            create_overtime_request(doc.employee, doc.time, doc.overtime)
        else:
            doc.overtime = 0
    else:
        doc.overtime = 0


def create_overtime_request(employee, date, duration):
    overtime_request = frappe.new_doc("Overtime Request")
    overtime_request.employee = employee
    overtime_request.date = date
    overtime_request.duration = duration
    overtime_request.insert()
    overtime_request.save()
    frappe.db.commit()
