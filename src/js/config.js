require.config({

    paths: {
        angular: '../bower_components/angular/angular',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
        jquery: '../bower_components/jquery/dist/jquery.min',
        jqueryui: '../bower_components/jquery-ui/jquery-ui.min',
        underscore: '../bower_components/underscore/underscore-min',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        'angular-ui-utils': '../bower_components/angular-ui-utils/ui-utils.min',
        'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
        'ui.grid':  '../bower_components/angular-ui-grid/ui-grid',
        'highcharts': "../bower_components/highcharts/highcharts",
        'highcharts-ng': "../bower_components/highcharts-ng/dist/highcharts-ng"
    },

    shim: {
        jquery: {
            exports: 'jquery'
        },
        jqueryui: {
            deps: ['jquery']
        },
        bootstrap: {
            deps: ['jquery']
        },
        angular: {
            exports: 'angular',
            deps: ['jquery']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-ui-utils': {
          deps: ['angular']
        },
        'angular-bootstrap': {
            deps: ['angular']
        },
        'ui.grid': {
            deps: ['angular']
        },
        'highcharts': {
            exports: 'highcharts'
        },
        'highcharts-ng': {
            deps: ['angular', 'highcharts']
        }
    }

});
