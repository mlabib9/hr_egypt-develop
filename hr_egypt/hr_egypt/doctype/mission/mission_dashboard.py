from frappe import _


def get_data():
    return {
        "fieldname": "mission",

        "transactions": [

            {"label": _("Connections"), "items": [
                "Expense Claim",]},
        ],
    }