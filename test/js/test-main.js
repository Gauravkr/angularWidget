var tests = [];

for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/\.spec\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

require.config({
    "waitSeconds": 240,
    "paths": {
        "angular": "../bower_components/angular/angular",
        "angular-mocks": "../bower_components/angular-mocks/angular-mocks",
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'jqueryui': '../bower_components/jquery-ui/jquery-ui.min',
        'underscore': '../bower_components/underscore/underscore-min',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap.min',
        'angular-ui-utils': '../bower_components/angular-ui-utils/ui-utils.min',
        'cookies': '../bower_components/cookies-js/dist/cookies',
        'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
        'angularTreeview': '../libs/angular.treeview/angular.treeview',
        'toastr' : '../bower_components/angular-toastr/dist/angular-toastr.tpls'
    },
    "shim": {
        "angular": {
            "exports": "angular"
        },
        "angular-mocks": {
            "deps": [
                "angular"
            ]
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
        'angularTreeview': {
            deps: ['angular']
        },
        'toastr': {
            deps: ['angular']
        }
    },
    "baseUrl": "/base/src/js/",
    "deps": tests,
    "callback": window.__karma__.start
});

require([
        'angular',
        'app/app'
    ], function(angular) {
        angular.element().ready(function() {
            // bootstrap the app manually
            angular.bootstrap(document, ['app']);
        });
    }
);