/*
*  NGFW Admin
*  page_routing.js (page_routing.html)
*/
var $routingNetmaskSelect, routingNetmaskSelect;
var $routingInterfaceSelect, routingInterfaceSelect;
var routingModalWindow;
var interface_xhr,netmask_xhr;

$(function() {
    routing.loadTable();
    routing.init();
    routing.save();
    routing.char_words_counter();
    routing.routing_form_validator();
});

routing = {
	init: function() {
    	$(document).ready(function () {
        	routingModalWindow = UIkit.modal("#window_routing");    		
        	$routingNetmaskSelect = $('#window_routing_netmask').selectize({
        		plugins: {
                    'remove_button': {
                        label     : ''
                    }
                },
                maxItems: 1,
                valueField: 'id',
                labelField: 'title',
                searchField: 'title',
                create: false,
                render: {
                    option: function(data, escape) {
                        return  '<div class="option">' +
                                '<span class="title">' + escape(data.title) + '</span>' +
                                '</div>';
                    },
                    item: function(data, escape) {
                        return '<div class="item"><a href="' + escape(data.url) + '" target="_blank">' + escape(data.title) + '</a></div>';
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
        	routingNetmaskSelect = $routingNetmaskSelect[0].selectize;
        	routingNetmaskSelect.load(function(callback) {
                netmask_xhr && netmask_xhr.abort();
                netmask_xhr = $.ajax({
                    url: '/static/data/netmask.json',
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
        	
        	$routingInterfaceSelect = $('#window_routing_interface').selectize({
    			plugins: {
                    'remove_button': {
                        label     : ''
                    }
                },
                maxItems: 1,
                valueField: 'id',
                labelField: 'title',
                searchField: 'title',
                create: false,
                render: {
                    option: function(data, escape) {
                        return  '<div class="option">' +
                                '<span class="title">' + escape(data.title) + '</span>' +
                                '</div>';
                    },
                    item: function(data, escape) {
                        return '<div class="item"><a href="' + escape(data.url) + '" target="_blank">' + escape(data.title) + '</a></div>';
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
                    url: '/networking/ethernet/read',
                    success: function(results) {
                        callback(results);
                    },
                    error: function() {
                        callback();
                    }
                })
            });
    	});
    },
    add: function(){
    	if ( routingModalWindow.isActive() ) {
			routingModalWindow.hide();
		} else {
			routingModalWindow.show();
		}
		$("#window_routing_title").text(" Add new route ");
		$('#window_routing_status').iCheck('check');
		$("#window_routing_id").val("0");
		$("#window_routing_row").val(parseInt($("#records_number").val())+1);
		$("#window_routing_name").val("");
		$("#window_routing_desc").val("");
		$("#window_routing_ipv4addr").val("");
		routingNetmaskSelect.setValue([0]);
		$("#window_routing_gateway").val("");
		routingInterfaceSelect.setValue([0]);
		$("#window_routing_metric").val("0");
		
		$('#window_routing_ipv4addr').ipAddress();
		$('#window_routing_gateway').ipAddress();    	
    },
    edit: function(obj){
		var $eventTargetId = obj.id.split("-");
		if ( routingModalWindow.isActive() ) {
			routingModalWindow.hide();
		} else {
			routingModalWindow.show();
		}
		
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
			$("#window_routing_ipv4addr").val(record[0].IPv4Address);
			routingNetmaskSelect.setValue([record[0].Netmask]);
			$("#window_routing_gateway").val(record[0].Gateway);
			routingInterfaceSelect.setValue([record[0].Interface]);
			$("#window_routing_metric").val(record[0].Metric);

			$('#window_routing_ipv4addr').ipAddress();
    		$('#window_routing_gateway').ipAddress();
		});    	
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
    save: function(){
        $("#window_routing_save").click( function() {
        	var $routingForm = $('#window_routing_form');
            if (( typeof($routingForm[0].checkValidity) == "function" ) && !$routingForm[0].checkValidity()) {
               return;
            }
            
            $('#window_routing_save').addClass("disabled");

        	var routing_status = "off";
        	if($("#window_routing_status").is(':checked'))
        		routing_status = "on";
        	var row_number = $('#window_routing_row').val();
        	var routing_id = $('#window_routing_id').val();
        	var routing_name = $('#window_routing_name').val();
        	var routing_desc = $('#window_routing_desc').val();
        	var routing_ipv4addr = $('#window_routing_ipv4addr').val();
        	var routing_netmask = $('#window_routing_netmask').val();
        	var routing_gateway = $('#window_routing_gateway').val();
        	var routing_interface = $('#window_routing_interface').val();
        	var routing_metric = $('#window_routing_metric').val();
        	
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
            		Netmask: routing_netmask,
            		Gateway: routing_gateway,
            		Interface: routing_interface,
            		Metric: routing_metric
            		},
        		dataType: 'json',
        		success: function(json) {
    				$('#window_routing_save').removeClass("disabled");
    				
    				routingModalWindow.hide();
    				
        			setTimeout(UIkit.notify({
                        message : json.Message,
                        status  : json.Status,
                        timeout : 2000,
                        pos     : 'top-center'
                    }), 5000);
        			
        			if ( routing_id === "0" ) {
        				var status_tooltip = "Disabled";
        				var status_icon = "/static/assets/img/md-images/toggle-switch-off.png";
            			if(json.Record[0].Status === true){
            				status_tooltip = "Enabled";
            				status_icon = "/static/assets/img/md-images/toggle-switch.png";
            			}

        				var link_tooltip = "Gateway is dead";
        				var link_icon = "/static/assets/img/md-images/gateway-off.png";
            			if(json.Record[0].Status === true){
            				link_tooltip = "Gateway is alive";
            				link_icon = "/static/assets/img/md-images/gateway-on.png";
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
	    	    			        				.text(json.Record[0].Name)
    	    			        				)
	    			        				)
	    	    			        		.append($('<div>')
    	    			        				.attr('class','uk-width-1-1')
    	    	    			        		.append($('<span>')
	    	    			        				.attr({'class':'uk-text-muted uk-text-small uk-text-truncate','id':'description-'+row_number})
	    	    			        				.text(json.Record[0].Description)
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
	    	    			        				.text(json.Record[0].IPv4Address)
    	    			        				)
	    			        				)
	    	    			        		.append($('<div>')
    	    			        				.attr('class','uk-width-1-1')
    	    	    			        		.append($('<span>')
	    	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'netmask-'+row_number})
	    	    			        				.text(json.Record[0].Netmask)
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
	    	    			        				.text(json.Record[0].Gateway)
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
	    	    			        				.text("Interface: "+json.Record[0].Interface)
    	    			        				)
	    			        				)
	    	    			        		.append($('<div>')
    	    			        				.attr('class','uk-width-1-1')
    	    	    			        		.append($('<span>')
	    	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'metric-'+row_number})
	    	    			        				.text("Metric: "+json.Record[0].Metric)
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
    	    			        						'href': '#',
    	    			        						'id':'status_anchor-'+row_number+'-'+json.Record[0].RouteID
    	    			        						})
	    			        						.append($('<img>')
    			        								.attr({
    			        									'src': status_icon,
    			        									'alt': status_tooltip,
    			        									'id': 'status_image-'+row_number+'-'+json.Record[0].RouteID
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
    	    			        						'href': '#',
    	    			        						'id':'link_anchor-'+row_number+'-'+json.Record[0].RouteID
    	    			        						})
	    			        						.append($('<img>')
    			        								.attr({
    			        									'src': link_icon,
    			        									'alt': link_tooltip,
    			        									'id': 'link_image-'+row_number+'-'+json.Record[0].RouteID
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
    	    			        						'id':'delete_routing-'+row_number+'-'+json.Record[0].RouteID
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
    	    			        						'id':'edit_routing-'+row_number+'-'+json.Record[0].RouteID
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
            			routing.refreshTable();        				
        			} else {
            			$("#name-"+row_number).text(json.Record[0].Name);
            			$("#description-"+row_number).text(json.Record[0].Description);
            			$("#ipv4address-"+row_number).text(json.Record[0].IPv4Address);
            			$("#netmask-"+row_number).text(json.Record[0].Netmask);
            			$("#gateway-"+row_number).text(json.Record[0].Gateway);
            			$("#interface-"+row_number).text("Interface: "+json.Record[0].Interface);
            			$("#metric-"+row_number).text("Metric: "+json.Record[0].Metric);
            			
            			if(json.Record[0].Status === true){
            				$("#status_anchor-"+row_number).attr("title","Enabled");
            				$("#status_image-"+row_number).attr({"alt":"Enabled", "src":"/static/assets/img/md-images/toggle-switch.png"});
            			} else{
            				$("#status_anchor-"+row_number).attr("title","Disabled");
            				$("#status_image-"+row_number).attr({"alt":"Disabled", "src":"/static/assets/img/md-images/toggle-switch-off.png"});
            			}

            			if(json.Record[0].Link === true){
            				$("#link_anchor-"+row_number).attr("title","Gateway is alive");
            				$("#link_image-"+row_number).attr({"alt":"Gateway is alive", "src":"/static/assets/img/md-images/gateway-on.png"});
            			} else{
            				$("#link_anchor-"+row_number).attr("title","Gateway is dead");
            				$("#link_image-"+row_number).attr({"alt":"Gateway is dead", "src":"/static/assets/img/md-images/gateway-off.png"});
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
				)
    	}
    },
    loadTable: function() {
    	var start_index = 0;
    	var page_size = 5;
    	var row_number = 0;
    	
    	$.ajax({
    		type: 'GET',
    		url: "/networking/routing/read",
    		data: { 
    			StartIndex: start_index,
    			PageSize: page_size
        		},
    		dataType: 'json',
    		success: function(json) {
    			$.each(json.Records, function(eachRecordIndex, eachRecord) {
    				row_number = eachRecordIndex + 1;
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
    	    			        				.attr({'class':'uk-text-muted uk-text-small .uk-text-truncate','id':'description-'+row_number})
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
    	    			        				.text(eachRecord.IPv4Address)
    				        				)
    			        				)
    	    			        		.append($('<div>')
    				        				.attr('class','uk-width-1-1')
    		    			        		.append($('<span>')
    	    			        				.attr({'class':'uk-text-muted uk-text-small','id':'netmask-'+row_number})
    	    			        				.text(eachRecord.Netmask)
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
    	    			        				.text(eachRecord.Gateway)
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
    	    			        				.text("Interface: "+eachRecord.Interface)
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
    			});
				routing.refreshTable();
    		}
		});
    },
    // characters/words counter
    char_words_counter: function() {
        var $imputCount = $('.input-count');
        if($imputCount.length) {
            /* http://qwertypants.github.io/jQuery-Word-and-Character-Counter-Plugin/ */
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
    routing_form_validator: function() {
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
    }
};
