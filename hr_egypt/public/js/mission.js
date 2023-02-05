frappe.ui.form.on('Mission', {
    	// call for get employee 
	employee: function(frm) {
		
		frappe.call({
        	method: 'frappe.client.get_value',
        	args: {
        		doctype: 'Employee',
        		'filters': {'name': frm.doc.employee},
        		'fieldname': [
        			'department','employee_name'
      		]
      	},
      	callback: function(r) {
      		if (!r.exc) {
      		
				 
				let row=frm.add_child('employee_table',{
					department : r.message.department,
					employeename:r.message.employee_name,

			
					
					
				})	

				frm.refresh();
				
				
      		}
      	}
      });
	 
	  
	
	  
	},
    // filter for area field
setup: function(frm) {
    frm.set_query("area", function() {

        return{
            "filters": {
                city:frm.doc.city
            }
        }
    });
//    filter for references child table
    frm.set_query("doc_type", "references", function(frm, cdt, cdn){
        let d = locals[cdt][cdn];
        return {
        filters: [
        ["name",  "in", 'Supplier,Project,Lead,Customer'],
        
        ]
        }
        });
    
},


// add custome button End
refresh: function(frm) {
    
frm.add_custom_button("End ", () => {
    // create frappe.dialog  
    let d = new frappe.ui.Dialog({
        title: 'Mission End',
        fields: [{
            fieldtype: 'Datetime',
            fieldname: 'end_time',
            label: __('the mission End In:'),
            in_list_view: 1,
           
           }],
					
           
        primary_action_label: 'Submit',
        primary_action(values) {
        
      console.log(values)
      frm.doc.actual_end_date = values.end_time;
      frm.refresh();
            d.hide();
        }
     
    });

    d.show();
},);
// add custome button Attendance
frm.add_custom_button("Attendance ", () => {
    // create frappe.dialog  
    let d = new frappe.ui.Dialog({
        title: 'Mission End',
        fields: [{
          
            label: 'Employee Attendance',
            fieldtype: 'Table',
            fieldname: 'employee_attendance',
            
            fields: [ {
                fieldtype: 'Link',
                fieldname: 'employee_name',
                in_list_view: 1, options: "Employee",
                label:('Absence غياب'),
               
            }],
        
     
        }],
					
           
        primary_action_label: 'Submit',
        primary_action(values) {
         
         

            d.hide();
        }
    });

    d.show();
},);


}

});



