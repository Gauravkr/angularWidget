define([
    'angular',
    'app/controllers/homeController',
    'app/services/alertService',
    'app/constants/appConstant',
    'app/appConfig',
    'angular-ui-router',
    'angular-ui-utils',
    'angular-bootstrap',
    'ui.grid',
    'highcharts-ng'
], function(angular,
            homeController,
            alertService,
            AppConstant,
            appConfig) {
    'use strict';

    // define the module and any module dependencies
    var appModule = angular.module('app', [
        'ui.router',
        'ui.bootstrap',
        'ui.grid',
        'highcharts-ng'
    ]);

    //configure module
    appModule
        .config(appConfig);

    // register controllers
    appModule
        .controller({
            'homeController': homeController
        });

    // register services
    appModule
        .factory({
            'alertService': alertService
        });

    //register directives
    appModule.directive({

    });

    //register constants
    appModule
        .constant({
            'AppConstants' : AppConstant
        });

    return appModule;

});
