define([], function() {

    'use strict';

    /**
     * service to show alert
     * @type {*[]}
     */
    var alertService = ['$log', function($log){
        var _bootstrap_alert = function() {};
        _bootstrap_alert.warning = function(message, alert, timeout) {
            $('<div id="floating_alert" class="alert theme-alert alert-' + alert +
                ' fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                message + '&nbsp;&nbsp;</div>').appendTo('body');
            setTimeout(function() {
                $(".theme-alert").alert('close');
            }, timeout);

        };
        return  {
            alerts: {},

            addAlert: function(message, type) {
                $log.log("Showing Alerts");
                _bootstrap_alert.warning(message, type, 4000);
            }
        };
    }];

    return alertService;
});


