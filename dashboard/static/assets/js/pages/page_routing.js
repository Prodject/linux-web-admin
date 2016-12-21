var routingIpv4AddressSelect, $routingIpv4AddressSelect, address_xhr;
var routingGatewaySelect, $routingGatewaySelect, gateway_xhr;
var $routingInterfaceSelect, routingInterfaceSelect, interface_xhr;
var routingModalWindow;

$(function() {
    routing.loadTable();
    routing.init();
    routing.save();
    routing.char_words_counter();
    routing.form_validator();
});

routing = {
	init: function() {
    	$(document).ready(function () {
        	routingModalWindow = UIkit.modal("#window_routing");
    	});
    },
    add: function(){
    	if ( routingModalWindow.isActive() ) {
			routingModalWindow.hide();
		} else {
			routingModalWindow.show();
		}
		routing.clearValidationErrors();
		routing.loadAllSelects();

		$("#window_routing_title").text(" Add new route ");
		$('#window_routing_status').iCheck('check');
		$("#window_routing_id").val("0");
		$("#window_routing_row").val(parseInt($("#records_number").val())+1);
		$("#window_routing_name").val("");
		$("#window_routing_desc").val("");
        routingIpv4AddressSelect.setValue("");
        routingGatewaySelect.setValue("");
		routingInterfaceSelect.setValue([0]);
		$("#window_routing_metric").val("0");
		
		$("#window_routing_name").focus();
    },
    edit: function(obj){
		var $eventTargetId = obj.id.split("-");
		if ( routingModalWindow.isActive() ) {
			routingModalWindow.hide();
		} else {
			routingModalWindow.show();
		}
		routing.clearValidationErrors();
		routing.loadAllSelects();

		$.getJSON( "/networking/routing/view", {
    		routingId: $eventTargetId[2]
    	}, function(record) {
			$("#window_routing_title").text(" Edit route ( "+record[0].Name+" ) ");
			if(record[0].Status === true)
				$('#window_routing_status').iCheck('check');
			else
				$('#window_routing_status').iCheck('uncheck');
    		$("#window_routing_id").val(record[0].routingId);
			$("#window_routing_row").val($eventTargetId[1]);
			$("#window_routing_name").val(record[0].Name);
			$("#window_routing_desc").val(record[0].Description);

            var addresses = record[0].IPv4Address.split(",");
			for (var i = 0; i < addresses.length; i++) {
				routingIpv4AddressSelect.addOption({
					name: addresses[i],
					value: addresses[i]
				});
			}
			routingIpv4AddressSelect.setValue(addresses);

            routingGatewaySelect.setValue([record[0].Gateway]);
			routingInterfaceSelect.setValue([record[0].Interface]);
			$("#window_routing_metric").val(record[0].Metric);
		});
		$("#window_routing_name").focus();
    },
    remove: function(obj){
    	var $eventTarget = obj;
    	var $eventTargetId = obj.id.split("-");
    	UIkit.modal.confirm('Are you sure you want to delete this item?', function(){ 
        	$.ajax({
        		type: 'POST',
        		url: "/networking/routing/delete",
        		data: { 
        			routingId: $eventTargetId[2],
            		},
        		dataType: 'json',
        		success: function(json) {
        			setTimeout(UIkit.notify({
                        message : json.Message,
                        status  : json.Status,
                        timeout : 2000,
                        pos     : 'top-center'
                    }), 5000);
                	if ( json.Result === "OK" ){
	    				$eventTarget.closest("li").remove();
	    				$("#records_number").val(parseInt($("#records_number").val())-1);
            			routing.refreshTable();
                	}
        		}
        	});
        });    	
    },
    isNotValid: function($FieldName){
    	var FieldInstance = $FieldName.parsley();
    	return !FieldInstance.isValid();
    },
    save: function(){
        $("#window_routing_save").click( function() {
        	var routing_status = "off";
        	if($("#window_routing_status").is(':checked'))
        		routing_status = "on";

        	var row_number = $('#window_routing_row').val();
        	var routing_id = $('#window_routing_id').val();

            $FieldName = $('#window_routing_name');
			if (routing.isNotValid($FieldName)) return;
        	var routing_name = $FieldName.val();
        	
        	$FieldName = $('#window_routing_desc');
			if (routing.isNotValid($FieldName)) return;
			var routing_desc = $FieldName.val();

            $FieldName = $('#window_routing_ipv4addr');
            if (routing.isNotValid($FieldName)) return;
            var routing_ipv4addr = routingIpv4AddressSelect.getValue().join(",");

            $FieldName = $('#window_routing_gateway');
            if (routing.isNotValid($FieldName)) return;
            var routing_gateway = routingGatewaySelect.getValue();

        	$FieldName = $('#window_routing_interface');
        	if (routing.isNotValid($FieldName)) return;
        	var routing_interface = routingInterfaceSelect.getValue();

        	var routing_metric = $('#window_routing_metric').val();

            $('#window_routing_save').addClass("disabled");
        	
        	var target_url = '';
        	if ( routing_id === "0" ) {
        		target_url = '/networking/routing/create';
        	} else {
        		target_url = '/networking/routing/update';
        	}
        	
        	$.ajax({
        		type: 'POST',
        		url: target_url,
        		data: { 
        			routingId: routing_id,
        			Status: routing_status,
            		Name: routing_name,
            		Description: routing_desc,
            		IPv4Address: routing_ipv4addr,
            		Gateway: routing_gateway,
            		Interface: routing_interface,
            		Metric: routing_metric
            		},
        		dataType: 'json',
        		success: function(json) {
    				$('#window_routing_save').removeClass("disabled");
        			if (json.Result == "OK") {
        				routingModalWindow.hide();
            			if ( routing_id === "0" ) {
            				routing.perform(json.Record,"addRow");
            			} else {
            				routing.perform(json.Record,"editRow");        				
            			}        				
            			setTimeout(UIkit.notify({
                            message : json.Message,
                            status  : json.Status,
                            timeout : 2000,
                            pos     : 'top-center'
                        }), 5000);        			
        			} else {
        				if (json.Result == "DUP"){
        					$("#invalid-form-error-message").text(json.Message);
        					$("#window_routing_name").select();
        					routing.fadeInvalidFormErrorMessage();
        				}
        			}
        		}
    		});
        });
    },
    refreshTable: function() {
		$("#record_table li:first:contains('No data')").remove();
    	if($("#records_number").val() == "0") {
    		$("ul#record_table").append($('<li>')
    			    .append($('<div>')
    		    		.attr('class', 'md-card')
    			        .append($('<div>')
    		        		.attr('class', 'md-card-content')
    		        		.append($('<div>')
    			        		.attr({'class':'uk-grid uk-grid-medium','data-uk-grid-margin':'','data-uk-grid-match':"{target:'.md-card'}"})
    			        		.append($('<div>')
			        				.attr('class','uk-width-1-1 uk-text-center')
	    			        		.append($('<span>')
    			        				.attr('class','uk-text-large uk-text-bold uk-text-danger')
    			        				.text("No data available!")
			        				)
		        				)
	        				)
        				)
    				)
				);
    		$("ul#pagination").empty();
    	}
    },
	clearTable: function () {
		$("ul#record_table").empty();
		$("ul#pagination").empty();
	},
    loadPagination: function (current_page, page_size, total_records) {
		if (total_records === 0) return false;
    	total_pages = Math.ceil(total_records/page_size);
    	var first_page = ( current_page <= 1 );
		var last_page = ( current_page >= total_pages );
		var previous_page = current_page - 1;
		var next_page = current_page + 1;

		if (first_page) {
			$("ul#pagination")
				.append($('<li>')
					.attr('class','uk-disabled')
					.append($('<span>')
						.append($('<i>')
							.attr('class', 'uk-icon-angle-double-left')
						)
					)
				)
				.append($('<li>')
					.attr('class','uk-disabled')
					.append($('<span>')
						.append($('<i>')
							.attr('class', 'uk-icon-angle-left')
						)
					)
				);
		} else {
			$("ul#pagination")
				.append($('<li>')
					.append($('<a>')
						.attr({'href':'#','onclick':'routing.reloadTable( 1,' + page_size + ')'})
						.append($('<i>')
							.attr('class', 'uk-icon-angle-double-left')
						)
					)
				)
				.append($('<li>')
					.append($('<a>')
						.attr({'href':'#','onclick':'routing.reloadTable('+ previous_page + ',' + page_size + ')'})
						.append($('<i>')
							.attr('class', 'uk-icon-angle-left')
						)
					)
				);
		}

		for (index_page = 1 ; index_page < total_pages + 1; index_page++) {
			if (current_page == index_page) {
				$("ul#pagination")
					.append($('<li>')
						.attr('class','uk-active')
						.append($('<span>')
							.text(index_page)
						)
					)
			} else {
				$("ul#pagination")
					.append($('<li>')
						.append($('<a>')
							.attr({'href':'#','onclick':'routing.reloadTable('+index_page+','+page_size+')'})
							.text(index_page)
						)
					)
			}
		}

		if (last_page) {
			$("ul#pagination")
				.append($('<li>')
					.attr('class','uk-disabled')
					.append($('<span>')
						.append($('<i>')
							.attr('class', 'uk-icon-angle-right')
						)
					)
				)
				.append($('<li>')
					.attr('class','uk-disabled')
					.append($('<span>')
						.append($('<i>')
							.attr('class', 'uk-icon-angle-double-right')
						)
					)
				);
		} else {
			$("ul#pagination")
				.append($('<li>')
					.append($('<a>')
						.attr({'href':'#','onclick':'routing.reloadTable('+ next_page + ',' + page_size + ')'})
						.append($('<i>')
							.attr('class', 'uk-icon-angle-right')
						)
					)
				)
				.append($('<li>')
					.append($('<a>')
						.attr({'href':'#','onclick':'routing.reloadTable( '+ total_pages +',' + page_size + ')'})
						.append($('<i>')
							.attr('class', 'uk-icon-angle-double-right')
						)
					)
				);
		}
		CurrentPage = current_page;
    },
	reloadTable: function (page_number,page_size) {
    	routing.clearTable();
		routing.loadTable(page_number,page_size);
    },
    loadTable: function (page_number,page_size) {
    	if ($( "#page_size" ).length) {
			$('#page_size').selectize({
				plugins: {
					'remove_button': {
						label: ''
					}
				},
				options: [
					{id: 5, title: '5'},
					{id: 10, title: '10'},
					{id: 25, title: '25'},
					{id: 50, title: '50'},
					{id: 100, title: '100'},
					{id: 250, title: '250'},
					{id: 500, title: '500'}
				],
				maxItems: 1,
				valueField: 'id',
				labelField: 'title',
				searchField: 'title',
				create: false,
				onDropdownOpen: function ($dropdown) {
					$dropdown
						.hide()
						.velocity('slideDown', {
							begin: function () {
								$dropdown.css({'margin-top': '0'})
							},
							duration: 200,
							easing: easing_swiftOut
						})
				},
				onDropdownClose: function ($dropdown) {
					$dropdown
						.show()
						.velocity('slideUp', {
							complete: function () {
								$dropdown.css({'margin-top': ''})
							},
							duration: 200,
							easing: easing_swiftOut
						})
				},
				onChange: function () {
					routing.reloadTable();
				}
			});
			$('#page_size option:selected').each(function () {
				page_size = $(this).text();
			});
		}
    	page_number = typeof page_number !== 'undefined' ? page_number : 1;
  		page_size = typeof page_size !== 'undefined' ? page_size : 5;

        var start_index = ((page_number - 1) * page_size);
        var total_record_count = 0;
        var TheCurrentPageDoesNotHaveAnyRecordAndMustLoadThePreviousPageRecords = false;
    	$.ajax({
    		type: 'GET',
    		url: "/networking/routing/read",
    		data: {
    			StartIndex: start_index,
    			PageSize: page_size
        		},
    		dataType: 'json',
    		success: function(json) {
    			total_record_count = json.TotalRecordCount;
    			TheCurrentPageDoesNotHaveAnyRecordAndMustLoadThePreviousPageRecords =
                    (json.Records.length != total_record_count) &&
                    (json.Records.length === 0 && total_record_count !== 0);

    			if (TheCurrentPageDoesNotHaveAnyRecordAndMustLoadThePreviousPageRecords) {
    			    routing.loadTable(--page_number,page_size);
                } else {
                    routing.perform(json.Records,"drawTable");
                    routing.loadPagination(page_number,page_size,total_record_count);
                }
    		}
		});
    },
    perform: function (recordList,what) {
    	var row_number = $('#window_routing_row').val(); // for addRow and editRow
		if (what === "drawTable")
			row_number = 0;
		$.each(recordList, function(eachRecordIndex, eachRecord) {
			if (what === "drawTable")
				row_number = eachRecordIndex + 1;
			// else addRow and editRow
			
			if (what === "editRow") {
    			$("#name-"+row_number).text(eachRecord.Name);
    			$("#description-"+row_number).text(eachRecord.Description);
                var IPv4AddressValue = 'None';
				var NetmaskValue = 'None';
				if (eachRecord.IPv4Address){
                    IPv4AddressSegments = eachRecord.IPv4Address.split("/");
                    IPv4AddressValue = IPv4AddressSegments[0];
                    NetmaskValue = IPv4AddressSegments[1];
                }
				var GatewayValue = 'None';
				if (eachRecord.Gateway){
				    GatewayValue = eachRecord.Gateway;
                }
    			$("#ipv4address-"+row_number).text(IPv4AddressValue);
    			$("#netmask-"+row_number).text(NetmaskValue);
    			$("#gateway-"+row_number).text(GatewayValue);
    			$("#interface-"+row_number).text("Interface: "+eachRecord.Interface);
    			$("#metric-"+row_number).text("Metric: "+eachRecord.Metric);
    			
    			if(eachRecord.Status === true){
    				$("#status_anchor-"+row_number).attr("title","Enabled");
    				$("#status_image-"+row_number).attr({"alt":"Enabled", "src":"/static/assets/img/md-images/toggle-switch.png"});
    			} else{
    				$("#status_anchor-"+row_number).attr("title","Disabled");
    				$("#status_image-"+row_number).attr({"alt":"Disabled", "src":"/static/assets/img/md-images/toggle-switch-off.png"});
    			}

    			if(eachRecord.Link === true){
    				$("#link_anchor-"+row_number).attr("title","Gateway is alive");
    				$("#link_image-"+row_number).attr({"alt":"Gateway is alive", "src":"/static/assets/img/md-images/gateway-on.png"});
    			} else{
    				$("#link_anchor-"+row_number).attr("title","Gateway is dead");
    				$("#link_image-"+row_number).attr({"alt":"Gateway is dead", "src":"/static/assets/img/md-images/gateway-off.png"});
    			}				
			} else { // for addRow and drawTable
				
				var interface_title = "any";
				if(eachRecord.Interface)
					interface_title = eachRecord.Interface;
				
				var status_tooltip = "Disabled";
				var status_icon = "/static/assets/img/md-images/toggle-switch-off.png";
				if(eachRecord.Status === true){
					status_tooltip = "Enabled";
					status_icon = "/static/assets/img/md-images/toggle-switch.png";
				}
	
				var link_tooltip = "Gateway is dead";
				var link_icon = "/static/assets/img/md-images/gateway-off.png";
				if(eachRecord.Status === true){
					link_tooltip = "Gateway is alive";
					link_icon = "/static/assets/img/md-images/gateway-on.png";
				}

                var IPv4AddressValue = 'None';
				var NetmaskValue = 'None';
				if (eachRecord.IPv4Address){
                    IPv4AddressSegments = eachRecord.IPv4Address.split("/");
                    IPv4AddressValue = IPv4AddressSegments[0];
                    NetmaskValue = IPv4AddressSegments[1];
                }
				var GatewayValue = 'None';
				if (eachRecord.Gateway){
				    GatewayValue = eachRecord.Gateway;
                }

				$("ul#record_table").append($('<li>')
			    .append($('<div>')
		    		.attr('class', 'md-card')
			        .append($('<div>')
		        		.attr('class', 'md-card-content')
		        		.append($('<div>')
			        		.attr({'class':'uk-grid uk-grid-medium','data-uk-grid-margin':'','data-uk-grid-match':"{target:'.md-card'}"})
			        		.append($('<div>')
				        		.attr('class','uk-width-medium-2-10 uk-width-small-1-1')
				        		.append($('<div>')
	    			        		.attr('class','uk-grid')
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-large','id':'name-'+row_number})
	    			        				.text(eachRecord.Name)
				        				)
			        				)
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-muted uk-text-small uk-text-truncate','id':'description-'+row_number})
	    			        				.text(eachRecord.Description)
				        				)
			        				)
		        				)
	        				)
	        				.append($('<div>')
				        		.attr('class','uk-width-medium-2-10 uk-width-small-1-1')
				        		.append($('<div>')
	    			        		.attr('class','uk-grid')
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-middle','id':'ipv4address-'+row_number})
	    			        				.text(IPv4AddressValue)
				        				)
			        				)
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'netmask-'+row_number})
	    			        				.text(NetmaskValue)
				        				)
			        				)
		        				)
	        				)
	        				.append($('<div>')
				        		.attr('class','uk-width-medium-2-10 uk-width-small-1-1')
				        		.append($('<div>')
	    			        		.attr('class','uk-grid')
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-middle','id':'gateway-'+row_number})
	    			        				.text(GatewayValue)
				        				)
			        				)
		        				)
	        				)
	        				.append($('<div>')
				        		.attr('class','uk-width-medium-2-10 uk-width-small-1-1')
				        		.append($('<div>')
	    			        		.attr('class','uk-grid')
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'interface-'+row_number})
	    			        				.text("Interface: "+interface_title)
				        				)
			        				)
	    			        		.append($('<div>')
				        				.attr('class','uk-width-1-1')
		    			        		.append($('<span>')
	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'metric-'+row_number})
	    			        				.text("Metric: "+eachRecord.Metric)
				        				)
			        				)
		        				)
	        				)
	        				.append($('<div>')
				        		.attr('class','uk-width-medium-2-10 uk-width-small-1-1')
				        		.append($('<div>')
			        				.attr({'class':'uk-grid uk-grid-medium','data-uk-grid-margin':'','data-uk-grid-match':"{target:'.md-card'}"})
	    			        		.append($('<div>')
				        				.attr('class','uk-width-large-1-5 uk-width-medium-1-2 uk-width-small-1-5')
		    			        		.append($('<a>')
	    			        				.attr({
	    			        					'data-uk-tooltip':"{cls:'uk-tooltip-small',pos:'top-left',animation:'true'}",
				        						'title': status_tooltip,
				        						'style':'cursor:default;',
				        						'href': '#',
				        						'id':'status_anchor-'+row_number+'-'+eachRecord.RouteID
				        						})
			        						.append($('<img>')
		        								.attr({
		        									'src': status_icon,
		        									'alt': status_tooltip,
		        									'id': 'status_image-'+row_number+'-'+eachRecord.RouteID
		        									})
	    									)
										)
			        				)
			        				.append($('<div>')
				        				.attr('class','uk-width-large-1-5 uk-width-medium-1-2 uk-width-small-1-5')
		    			        		.append($('<a>')
	    			        				.attr({
	    			        					'data-uk-tooltip':"{cls:'uk-tooltip-small',pos:'top-left',animation:'true'}",
				        						'title': link_tooltip,
				        						'style':'cursor:default;',
				        						'href': '#',
				        						'id':'link_anchor-'+row_number+'-'+eachRecord.RouteID
				        						})
			        						.append($('<img>')
		        								.attr({
		        									'src': link_icon,
		        									'alt': link_tooltip,
		        									'id': 'link_image-'+row_number+'-'+eachRecord.RouteID
		        									})
	    									)
										)
			        				)
			        				.append($('<div>')
				        				.attr('class','uk-width-large-1-5 uk-width-medium-1-2 uk-width-small-1-5')
		    			        		.append($('<a>')
	    			        				.attr({
	    			        					'data-uk-tooltip':"{cls:'uk-tooltip-small',pos:'top-left',animation:'true'}",
				        						'title': 'Delete',
				        						'onclick':'routing.remove(this)',
				        						'href': '#',
				        						'id':'delete_routing-'+row_number+'-'+eachRecord.RouteID
				        						})
			        						.append($('<img>')
		        								.attr({
		        									'src': '/static/assets/img/md-images/delete.png',
		        									'alt': 'Delete'
		        									})
	    									)
										)
			        				)
			        				.append($('<div>')
				        				.attr('class','uk-width-large-1-5 uk-width-medium-1-2 uk-width-small-1-5')
		    			        		.append($('<a>')
	    			        				.attr({
	    			        					'data-uk-tooltip':"{cls:'uk-tooltip-small',pos:'top-left',animation:'true'}",
				        						'title': 'Edit',
				        						'onclick':'routing.edit(this)',
				        						'href': '#',
				        						'id':'edit_routing-'+row_number+'-'+eachRecord.RouteID
				        						})
			        						.append($('<img>')
		        								.attr({
		        									'src': '/static/assets/img/md-images/pencil.png',
		        									'alt': 'Edit'
		        								})
	    									)
										)
			        				)
		        				)
	        				)
						)
					)
	    		)
			    );
				$("#records_number").val(row_number);
			}
		});
		routing.refreshTable();
    },
    initIpv4AddressSelect: function () {
    	var REGEX_IPV4 = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)+(\/([0-9]|[1-2][0-9]|3[0-2])){0,1}';
    	$routingIpv4AddressSelect = $('#window_routing_ipv4addr').selectize({
    		plugins: {
                'remove_button': {
                    label     : ''
                }
            },
			maxItems: 15,
            valueField: 'value',
            labelField: 'name',
            searchField: ['name', 'value'],
			options: [],
			render: {
                item: function(item, escape) {
                    return '<div>' +
                        (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                        (item.value ? '<span class="email">' + escape(item.value) + '</span>' : '') +
                        '</div>';
                },
                option: function(item, escape) {
                    var label = item.name || item.value;
                    var caption = item.name ? item.value : null;
                    return '<div>' +
                        '<span class="label">' + escape(label) + '</span>' +
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                }
            },
            createFilter: function(input) {
                var match, regex;

                regex = new RegExp('^' + REGEX_IPV4 + '$', 'i');
                match = input.match(regex);
                if (match) return !this.options.hasOwnProperty(match[0]);

                regex = new RegExp('^([^<]*)\<' + REGEX_IPV4 + '\>$', 'i');
                match = input.match(regex);
                if (match) return !this.options.hasOwnProperty(match[2]);

                return false;
            },
            create: function(input) {
                if ((new RegExp('^' + REGEX_IPV4 + '$', 'i')).test(input)) {
                    return {value: input};
                }
                var match = input.match(new RegExp('^([^<]*)\<' + REGEX_IPV4 + '\>$', 'i'));
                if (match) {
                    return {
                        value : match[2],
                        name  : $.trim(match[1])
                    };
                }
                alert('Invalid value address.');
                return false;
            },
            onDropdownOpen: function($dropdown) {
                $dropdown
                    .hide()
                    .velocity('slideDown', {
                        begin: function() {
                            $dropdown.css({'margin-top':'0'})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            },
            onDropdownClose: function($dropdown) {
                $dropdown
                    .show()
                    .velocity('slideUp', {
                        complete: function() {
                            $dropdown.css({'margin-top':''})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            }
        });
        routingIpv4AddressSelect = $routingIpv4AddressSelect[0].selectize;
        routingIpv4AddressSelect.load(function(callback) {
            address_xhr && address_xhr.abort();
            address_xhr = $.ajax({
                url: '/objects/address/getlist',
				type: 'GET',
				dataType: 'json',
                success: function(results) {
                    callback(results);
                },
                error: function() {
                	console.log("error has occured!!!");
                    callback();
                }
            })
        });
    },
    initGatewaySelect: function () {
    	var REGEX_GATEWAY = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
    	$routingGatewaySelect = $('#window_routing_gateway').selectize({
    		plugins: {
                'remove_button': {
                    label     : ''
                }
            },
			maxItems: 1,
            valueField: 'value',
            labelField: 'name',
            searchField: ['name', 'value'],
			options: [],
			render: {
                item: function(item, escape) {
                    return '<div>' +
                        (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                        (item.value ? '<span class="email">' + escape(item.value) + '</span>' : '') +
                        '</div>';
                },
                option: function(item, escape) {
                    var label = item.name || item.value;
                    var caption = item.name ? item.value : null;
                    return '<div>' +
                        '<span class="label">' + escape(label) + '</span>' +
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                }
            },
            createFilter: function(input) {
                var match, regex;

                regex = new RegExp('^' + REGEX_GATEWAY + '$', 'i');
                match = input.match(regex);
                if (match) return !this.options.hasOwnProperty(match[0]);

                regex = new RegExp('^([^<]*)\<' + REGEX_GATEWAY + '\>$', 'i');
                match = input.match(regex);
                if (match) return !this.options.hasOwnProperty(match[2]);

                return false;
            },
            create: function(input) {
                if ((new RegExp('^' + REGEX_GATEWAY + '$', 'i')).test(input)) {
                    return {value: input};
                }
                var match = input.match(new RegExp('^([^<]*)\<' + REGEX_GATEWAY + '\>$', 'i'));
                if (match) {
                    return {
                        value : match[2],
                        name  : $.trim(match[1])
                    };
                }
                alert('Invalid value address.');
                return false;
            },
            onDropdownOpen: function($dropdown) {
                $dropdown
                    .hide()
                    .velocity('slideDown', {
                        begin: function() {
                            $dropdown.css({'margin-top':'0'})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            },
            onDropdownClose: function($dropdown) {
                $dropdown
                    .show()
                    .velocity('slideUp', {
                        complete: function() {
                            $dropdown.css({'margin-top':''})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            }
        });
        routingGatewaySelect = $routingGatewaySelect[0].selectize;
        routingGatewaySelect.load(function(callback) {
            gateway_xhr && gateway_xhr.abort();
            gateway_xhr = $.ajax({
                url: '/objects/address/gethostlist',
				type: 'GET',
				dataType: 'json',
                success: function(results) {
                    callback(results);
                },
                error: function() {
                	console.log("error has occured!!!");
                    callback();
                }
            })
        });
    },
    initInterfaceSelect: function() {
    	$routingInterfaceSelect = $('#window_routing_interface').selectize({
    		plugins: {
                'remove_button': {
                    label     : ''
                }
            },
			maxItems: 1,
            valueField: 'value',
            labelField: 'name',
            searchField: ['name', 'value'],
			options: [],
			render: {
                item: function(item, escape) {
                    return '<div>' +
                        (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                        (item.value ? '<span class="email">' + escape(item.value) + '</span>' : '') +
                        '</div>';
                },
                option: function(item, escape) {
                    var label = item.name || item.value;
                    var caption = item.name ? item.value : null;
                    return '<div>' +
                        '<span class="label">' + escape(label) + '</span>' +
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                }
            },
            onDropdownOpen: function($dropdown) {
                $dropdown
                    .hide()
                    .velocity('slideDown', {
                        begin: function() {
                            $dropdown.css({'margin-top':'0'})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            },
            onDropdownClose: function($dropdown) {
                $dropdown
                    .show()
                    .velocity('slideUp', {
                        complete: function() {
                            $dropdown.css({'margin-top':''})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            }
        });
        routingInterfaceSelect = $routingInterfaceSelect[0].selectize;
        routingInterfaceSelect.load(function(callback) {
            interface_xhr && interface_xhr.abort();
            interface_xhr = $.ajax({
                url: '/networking/ethernet/getlist',
				type: 'GET',
				dataType: 'json',
                success: function(results) {
                    callback(results);
                },
                error: function() {
                	console.log("error has occured!!!");
                    callback();
                }
            })
        });
    },
    char_words_counter: function() {
        var $imputCount = $('.input-count');
        if($imputCount.length) {
            (function($){"use strict";$.fn.extend({counter:function(options){var defaults={type:"char",count:"down",goal:140,text:true,target:false,append:true,translation:"",msg:"",container_class:""};var $countObj="",countIndex="",noLimit=false,options=$.extend({},defaults,options);var methods={init:function($obj){var objID=$obj.attr("id"),counterID=objID+"_count";methods.isLimitless();$countObj=$("<span id="+counterID+"/>");var counterDiv=$("<div/>").attr("id",objID+"_counter").append($countObj).append(" "+methods.setMsg());if(options.container_class&&options.container_class.length){counterDiv.addClass(options.container_class)}if(!options.target||!$(options.target).length){options.append?counterDiv.insertAfter($obj):counterDiv.insertBefore($obj)}else{options.append?$(options.target).append(counterDiv):$(options.target).prepend(counterDiv)}methods.bind($obj)},bind:function($obj){$obj.bind("keypress.counter keydown.counter keyup.counter blur.counter focus.counter change.counter paste.counter",methods.updateCounter);$obj.bind("keydown.counter",methods.doStopTyping);$obj.trigger("keydown")},isLimitless:function(){if(options.goal==="sky"){options.count="up";noLimit=true;return noLimit}},setMsg:function(){if(options.msg!==""){return options.msg}if(options.text===false){return""}if(noLimit){if(options.msg!==""){return options.msg}else{return""}}this.text=options.translation||"character word left max";this.text=this.text.split(" ");this.chars="s ( )".split(" ");this.msg=null;switch(options.type){case"char":if(options.count===defaults.count&&options.text){this.msg=this.text[0]+this.chars[1]+this.chars[0]+this.chars[2]+" "+this.text[2]}else if(options.count==="up"&&options.text){this.msg=this.text[0]+this.chars[0]+" "+this.chars[1]+options.goal+" "+this.text[3]+this.chars[2]}break;case"word":if(options.count===defaults.count&&options.text){this.msg=this.text[1]+this.chars[1]+this.chars[0]+this.chars[2]+" "+this.text[2]}else if(options.count==="up"&&options.text){this.msg=this.text[1]+this.chars[1]+this.chars[0]+this.chars[2]+" "+this.chars[1]+options.goal+" "+this.text[3]+this.chars[2]}break;default:}return this.msg},getWords:function(val){if(val!==""){return $.trim(val).replace(/\s+/g," ").split(" ").length}else{return 0}},updateCounter:function(e){var $this=$(this);if(countIndex<0||countIndex>options.goal){methods.passedGoal($this)}if(options.type===defaults.type){if(options.count===defaults.count){countIndex=options.goal-$this.val().length;if(countIndex<=0){$countObj.text("0")}else{$countObj.text(countIndex)}}else if(options.count==="up"){countIndex=$this.val().length;$countObj.text(countIndex)}}else if(options.type==="word"){if(options.count===defaults.count){countIndex=methods.getWords($this.val());if(countIndex<=options.goal){countIndex=options.goal-countIndex;$countObj.text(countIndex)}else{$countObj.text("0")}}else if(options.count==="up"){countIndex=methods.getWords($this.val());$countObj.text(countIndex)}}return},doStopTyping:function(e){var keys=[46,8,9,35,36,37,38,39,40,32];if(methods.isGoalReached(e)){if(e.keyCode!==keys[0]&&e.keyCode!==keys[1]&&e.keyCode!==keys[2]&&e.keyCode!==keys[3]&&e.keyCode!==keys[4]&&e.keyCode!==keys[5]&&e.keyCode!==keys[6]&&e.keyCode!==keys[7]&&e.keyCode!==keys[8]){if(options.type===defaults.type){return false}else if(e.keyCode!==keys[9]&&e.keyCode!==keys[1]&&options.type!=defaults.type){return true}else{return false}}}},isGoalReached:function(e,_goal){if(noLimit){return false}if(options.count===defaults.count){_goal=0;return countIndex<=_goal?true:false}else{_goal=options.goal;return countIndex>=_goal?true:false}},wordStrip:function(numOfWords,text){var wordCount=text.replace(/\s+/g," ").split(" ").length;text=$.trim(text);if(numOfWords<=0||numOfWords===wordCount){return text}else{text=$.trim(text).split(" ");text.splice(numOfWords,wordCount,"");return $.trim(text.join(" "))}},passedGoal:function($obj){var userInput=$obj.val();if(options.type==="word"){$obj.val(methods.wordStrip(options.goal,userInput))}if(options.type==="char"){$obj.val(userInput.substring(0,options.goal))}if(options.type==="down"){$countObj.val("0")}if(options.type==="up"){$countObj.val(options.goal)}}};return this.each(function(){methods.init($(this))})}})})(jQuery);

            $imputCount.each(function() {
                var $this = $(this);

                var $thisGoal = $(this).attr('maxlength') ? $(this).attr('maxlength') : 80 ;

                $this.counter({
                    container_class: 'text-count-wrapper',
                    msg: ' / '+$thisGoal,
                    goal: $thisGoal,
                    count: 'up'
                });

                if($this.closest('.md-input-wrapper').length) {
                    $this.closest('.md-input-wrapper').addClass('md-input-wrapper-count')
                }
            })
        }
    },
    fadeInvalidFormErrorMessage: function(){
	    $("#invalid-form-error-window").css("display", "inline").fadeToggle(4000);
    },
    form_validator: function() {
        var $formValidate = $('#window_routing_form');

        $formValidate
        	.parsley()
	        	.on('form:validated',function() {
	                altair_md.update_input($formValidate.find('.md-input-danger'));
	            })
	            .on('field:validated',function(parsleyField) {
	                if($(parsleyField.$element).hasClass('md-input')) {
	                    altair_md.update_input( $(parsleyField.$element) );
	                }
	            });
    },
    clearValidationErrors: function () {
		var $formValidate = $('#window_routing_form');
		var FormInstance = $formValidate.parsley();
    	FormInstance.reset();
    },
	loadAllSelects: function(){
        routing.initIpv4AddressSelect();
        routing.initGatewaySelect();
        routing.initInterfaceSelect();
    },
	unloadAllSelects: function(){
		routingIpv4AddressSelect.destroy();
		routingGatewaySelect.destroy();
		routingInterfaceSelect.destroy();
	}
};
