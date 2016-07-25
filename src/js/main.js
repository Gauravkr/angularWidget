define([
    'jquery',
    'underscore',
    'angular',
    'bootstrap',
    'jqueryui',
    'app/app'
], function($, _, angular) {
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
