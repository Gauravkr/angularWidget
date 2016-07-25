define([
    'jquery',
    'underscore',
    'angular',
    'highcharts',
    'bootstrap',
    'jqueryui',
    'app/app'
], function($, _, angular, highcharts) {
    'use strict';

    try {
        if (!window.jasmine) {
            angular.bootstrap(document, ['app']);
        }
    } catch (e) {
        // don't bootstrap more than once.
        if(this.console && this.console.log){
          console.log(e);
        }
    }

});
