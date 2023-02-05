// Copyright (c) 2022, branidmic.com and contributors
// For license information, please see license.txt

//fetch investigation templte
function get_template(frm) {
  if (frm.doc.investigation_template) {
    frappe.call({
      method: "frappe.client.get",
      async: false,
      args: {
        doctype: "Investigation Template",
        name: frm.doc.investigation_template,
      },
      callback: function (data) {
        //set description  templte in description
        cur_frm.doc.description = data.message.description;

        cur_frm.refresh();
      },
    });
  }
}
frappe.ui.form.on("Investigation", {
  setup: function (frm) {
    frm.set_query("employee", function () {
      return {
        filters: {
          status: "Active",
        },
      };
    });
  },
  investigation_template: function (frm) {
    get_template(frm);
  },
});
