let deduction = {};
let response = {};
//get penalty from Employee penalty
function penalty(frm) {
  //get submitted docs of employee penalty
  let employee = frm.doc.employee;
  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "Employee Penalty",
      filters: { employee: ["in", employee], docstatus: 1 },
      fields: ["*"],
    },
    async: false,
    callback: function (r) {
      response = r.message;
      for (let i in response) {
        //check if the penalty in date of salary slip
        if (
          response[i].date > frm.doc.start_date &&
          response[i].date < frm.doc.end_date
        ) {
          // if (response[i].type == "Days") {
          //   response[i].amount =response[i].amount*
            
          // }

          //collecting all penalty value on similer component
          if (response[i].salary_component in deduction) {
            deduction[response[i].salary_component] =
              deduction[response[i].salary_component] + response[i].amount;
          } else {
            deduction[response[i].salary_component] = response[i].amount;
          }
        }
      }
    },
  });
}
//set penalty on deduction table
function set_row(frm) {
  for (let i in deduction) {
    let row = frm.add_child("deductions", {
      salary_component: i,
      amount: deduction[i],
    });
  }
}

frappe.ui.form.on("Salary Slip", {
  employee: function (frm) {
    deduction = {};
    penalty(frm);
    set_row(frm);
  },
  start_date: function (frm) {
    deduction = {};
    penalty(frm);
    set_row(frm);
  },
  end_date: function (frm) {
    deduction = {};
    penalty(frm);
    set_row(frm);
  },
});
