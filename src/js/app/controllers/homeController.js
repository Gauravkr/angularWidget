
define([], function() {
    'use strict';

    /**
     * Controller to deal with header view, Include logout functionality
     * @type {*[]}
     */
    var homeController = ['$scope', 'AppConstants',
        function ($scope, AppConstant) {
            $scope.myData =  AppConstant.users;
            $scope.chartConfig = {
                "options":{
                    "chart":{
                        "type":"areaspline"
                    },
                    "plotOptions":{
                        "series":{
                            "stacking":""
                        }
                    },
                    "legend": {
                      layout: 'vertical',
         align: 'right',
         verticalAlign: 'top'
                    }
                },
                "series":[
                    {
                        "name":"Some data",
                        "data":[
                            1,
                            2,
                            4,
                            7,
                            3
                        ],
                        "id":"series-0"
                    },
                    {
                        "name":"Some data 3",
                        "data":[
                            3,
                            1,
                            null,
                            5,
                            2
                        ],
                        "connectNulls":true,
                        "id":"series-1"
                    },
                    {
                        "name":"Some data 2",
                        "data":[
                            5,
                            2,
                            2,
                            3,
                            5
                        ],
                        "type":"column",
                        "id":"series-2"
                    },
                    {
                        "name":"My Super Column",
                        "data":[
                            1,
                            1,
                            2,
                            3,
                            2
                        ],
                        "type":"column",
                        "id":"series-3"
                    }
                ],
                "title":{
                    "text":""
                },
                // "credits":{
                //     "enabled":true
                // },
                "loading":false,
                "size":{
                  "height":"200"
                }
            };
            $scope.lineChartConfig = {
                "options": {
                    "chart": {
                        "type": "pie"
                    },
                    "plotOptions": {
                        "series": {
                            "stacking": ""
                        }
                    }
                },
                "series": [{
                    "name": "Some data",
                    "data": [1, 2, 4, 7, 3],
                    "id": "series-0"
                }, {
                    "name": "Some data 3",
                    "data": [3, 1, null, 5, 2],
                    "connectNulls": true,
                    "id": "series-1"
                }, {
                    "name": "Some data 2",
                    "data": [5, 2, 2, 3, 5],
                    "type": "column",
                    "id": "series-2"
                }, {
                    "name": "My Super Column",
                    "data": [1, 1, 2, 3, 2],
                    "type": "column",
                    "id": "series-3"
                }],
                "title": {
                    "text": "PIE CHART"
                },
                "credits": {
                    "enabled": false
                },
                "loading": false,
                "size": {}
            };

            /*Date Picker*/
            $scope.today = function() {
                $scope.dt = new Date();
            };
            $scope.today();

            $scope.clear = function() {
                $scope.dt = null;
            };

            $scope.options = {
                customClass: "datePicker",
                minDate: new Date(),
                showWeeks: true
            };

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }
            /*Date Picker*/
            /*Pagination*/
            $scope.totalItems = 64;
            $scope.currentPage = 4;
            /*Pagination*/

            $scope.themes = {
                "default": "//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css",
                "cerulean" : "//bootswatch.com/cerulean/bootstrap.min.css",
                "cyborg" : "//bootswatch.com/cyborg/bootstrap.min.css",
                "flatly" : "//bootswatch.com/flatly/bootstrap.min.css",
                "readable" : "//bootswatch.com/readable/bootstrap.min.css",
                "simplex" : "//bootswatch.com/simplex/bootstrap.min.css",
                "united" : "//bootswatch.com/united/bootstrap.min.css"
            };

            var themesheet = $('<link href="'+$scope.themes['default']+'" rel="stylesheet" />');
            themesheet.appendTo('head');
            $scope.selected = function(theme) {
                var themeurl = $scope.themes[theme];
                themesheet.attr('href',themeurl);
            };
        }];

    return homeController;

});
