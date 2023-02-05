// Copyright (c) 2022, branidmic.com and contributors
// For license information, please see license.txt
function penalty_type(frm) {
  let list = [];
  // get employee salary structure
  frappe.call({
    method: "frappe.client.get_value",
    args: {
      doctype: "Salary Structure Assignment",
      filters: { employee: frm.doc.employee },
      fieldname: ["salary_structure"],
    },
    callback: function (r) {
      // get employee salary structure  deduction component
      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Salary Structure",
          filters: { name: r.message.salary_structure },
        },
        callback: function (r) {
          for (let i in r.message.deductions) {
            //add deduction component to list
            list.push(r.message.deductions[i].salary_component);
          }
        },
      });
    },
  });
  frm.refresh();
  // filter salary component to employee salary stucture deduction component only
  frm.set_query("salary_component", function () {
    return {
      filters: {
        name: ["in", list],
      },
    };
  });
}
// 	//wait to pull to change filter with invistegation or work leave
// function reference_type(frm){
// // filter reference type to invistegation or work leave

// 	frm.set_query("reference_type", function () {
// 		return {
// 			"filters": {
// 				"name": ["in", ["Customer", "Lead"]],
// 			}
// 		}
// 	});

// }

frappe.ui.form.on("Employee Penalty", {
  employee: function (frm) {
    // on select employee
    penalty_type(frm);
  },
//   refresh: function (frm){
// 	reference_type(frm);
//   }
});
