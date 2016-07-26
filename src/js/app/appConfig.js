define([], function(){

    'use strict';

    var appConfig = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.url();
            // check to see if the path has a trailing slash
            if ('/' === path[path.length - 1]) {
                return path.replace(/\/$/, '');
            }
            return false;
        });
        $urlRouterProvider
            .when('/','home')
            .otherwise('home');

        $stateProvider
            .state('default',{
                url: '/',
                views:{
                    '': {
                        templateUrl: 'partials/defaultAppPage.html'
                    }
                }
            })
            .state('default.home',{
                url: 'home',
                views:{
                    'moduleContainer@default':{
                        templateUrl: 'partials/home.html',
                        controller: 'homeController'
                    },
                    'footer@default':{
                        templateUrl: 'partials/footer.html'
                    }
                }
            });
    }];

    return appConfig;

});
