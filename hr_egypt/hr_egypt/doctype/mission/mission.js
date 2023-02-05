// Copyright (c) 2022, branidmic.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("Mission", {
  // filter for area field
  setup: function (frm) {
    frm.set_query("Area", function () {
      return {
        filters: {
          city: frm.doc.city,
        },
      };
    });
    //   filter for references child table
    frm.set_query("doc_type", "mission_references", function (frm, cdt, cdn) {
      let d = locals[cdt][cdn];
      return {
        filters: [["name", "in", "Supplier,Project,Lead,Customer"]],
      };
    });
    frm.set_query("employee", "mission_members", function (frm, cdt, cdn) {
      let emp = locals[cdt][cdn];
      return {
        filters: [["Employee", "status", "=", "Active"]],
      };
    });
  },

  // add custom button End
  refresh: function (frm) {
    if (frm.doc.docstatus == 1) {
      frm.add_custom_button("End", () => {
        // create frappe.dialog
        let d = new frappe.ui.Dialog({
          title: "Mission End",
          fields: [
            {
              fieldtype: "Datetime",
              fieldname: "end_time",
              label: __("The Mission End In:"),
              in_list_view: 1,
            },
          ],

          primary_action_label: "Submit",
          primary_action(values) {
            frm.set_value("actual_end_date", values.end_time);
            if (frm.doc.actual_end_date) {
              frm.doc.status = "Ended";
            }
            frm.save();
            frm.refresh();

            d.hide();
          },
        });

        d.show();
      });

      // add custom button Attendance
      frm.add_custom_button("Attendance ", () => {
        let d = new frappe.ui.Dialog({
          title: "Attendance",
          fields: [
            {
              label: "Employee Attendance",
              fieldtype: "Table",
              fieldname: "employee_attendance",

              fields: [
                {
                  fieldtype: "Link",
                  fieldname: "employee_name",
                  filters: {
                    employee: [
                      "in",
                      frm.doc.mission_members.map((d) => d.employee),
                    ],
                  },

                  in_list_view: 1,
                  options: "Employee",
                  label: "Absence ",
                },
              ],
            },
          ],

          primary_action_label: "Submit",
          primary_action(values) {
            d.hide();
          },
        });

        d.show();
      });
    }
  },
});
