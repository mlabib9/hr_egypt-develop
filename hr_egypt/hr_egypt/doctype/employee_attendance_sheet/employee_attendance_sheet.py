# Copyright (c) 2022, Brandimic.com and contributors
# For license information, please see license.txt

from datetime import datetime
from warnings import filters

import frappe
from frappe.model.document import Document


class EmployeeAttendanceSheet(Document):
    def get_delay_rule():
        delay_rule = frappe.get_list(
            "Attendance Settings",
            filters={
                "based_on": "Whole Month",
            },
            fields=["minimum", "maximum"],
        )
        return [dict(t) for t in {tuple(d.items()) for d in delay_rule}]

    def get_checkin(employee, start_date, end_date, minimum, maximum):
        doc = frappe.get_list(
            "Employee Checkin",
            filters=[
                ["employee", "=", employee],
                ["log_type", "=", "in"],
                ["time", ">=", start_date],
                ["time", "<=", end_date],
                ["delay", ">", minimum],
                ["delay", "<", maximum],
            ],
            fields=["shift", "shift_start", "delay"],
        )

        return doc

    def get_penalty(minimum, maximum, condition_repeat):
        penalty = frappe.get_list(
            "Attendance Settings",
            filters=[
                ["minimum", "=", minimum],
                ["maximum", "=", maximum],
                ["condition_repeat", "=", condition_repeat],
            ],
            fields=["penalty", "penalty_action"],
        )
        return penalty

    def create_employee_warning(employee, date):
        employee_warning = frappe.new_doc("Employee Warning")
        employee_warning.employee = employee
        employee_warning.datetime = date
        employee_warning.description = frappe.get_doc(
            "HR Egypt Settings"
        ).default_actions_description
        employee_warning.insert()
        employee_warning.save()
        frappe.db.commit()
        employee_warning.submit()

    def create_employee_investigation(employee, date):
        employee_investigation = frappe.new_doc("Investigation")
        hr_settings = frappe.get_doc("HR Egypt Settings")
        employee_investigation.employee = employee
        employee_investigation.datetime = date
        employee_investigation.investigation_reason = hr_settings.default_actions_reason

        employee_investigation.description = hr_settings.default_actions_description
        employee_investigation.insert()
        employee_investigation.save()
        frappe.db.commit()
        employee_investigation.submit()

    def employee_attendance_sheet_before_save(self):
        get_delay_rule = EmployeeAttendanceSheet.get_delay_rule()
        sorted_delay_rule = sorted(get_delay_rule, key=lambda k: k["minimum"])
        self.check_in_sheet = []
        for rule in sorted_delay_rule:
            minimum = rule["minimum"]
            maximum = rule["maximum"]
            checkin_sheet = EmployeeAttendanceSheet.get_checkin(
                self.employee, self.start_date, self.end_date, minimum, maximum
            )
            for i in range(len(checkin_sheet)):
                repeat = i + 1
                p = EmployeeAttendanceSheet.get_penalty(
                    minimum, maximum, repeat)
                if p:
                    penalty = p[0]["penalty"]
                    penalty_action = p[0]["penalty_action"]
                self.append(
                    "check_in_sheet",
                    {
                        "shift": checkin_sheet[i]["shift"],
                        "shift_start": checkin_sheet[i]["shift_start"],
                        "delay": checkin_sheet[i]["delay"],
                        "repeat": repeat,
                        "penalty": penalty,
                        "penalty_action": penalty_action,
                    },
                )
                if penalty_action == "Warning":
                    EmployeeAttendanceSheet.create_employee_warning(
                        self.employee, checkin_sheet[i]["shift_start"]
                    )
                elif (penalty_action == "Investigation"):
                    EmployeeAttendanceSheet.create_employee_investigation(
                        self.employee, checkin_sheet[i]["shift_start"]
                    )

        self.total_penalty = sum([i.penalty for i in self.check_in_sheet])
        self.total_delay = sum([i.delay for i in self.check_in_sheet])

        if self.total_penalty > 0:

            employee_penalty = frappe.new_doc("Employee Penalty")
            employee_penalty.employee = self.employee
            employee_penalty.amount = self.total_penalty
            employee_penalty.date = self.end_date
            employee_penalty.type = "Days"
            employee_penalty.salary_component = frappe.get_doc(
                "HR Egypt Settings"
            ).default_salary_component_for_delay
            employee_penalty.reason = (
                "For Delays from " +
                str(self.start_date) + " to " + str(self.end_date)
            )
            employee_penalty.insert()
            employee_penalty.save()
            frappe.db.commit()
            employee_penalty.submit()

    def before_save(self):
        self.employee_attendance_sheet_before_save()
