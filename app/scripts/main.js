require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        hoist: './hoist/hoist',
        requirejs: '../bower_components/requirejs/require',
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie"
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    }
});
require(['app', 'jquery', 'hoist'], function(app, $, hoist) {
    'use strict';
    hoist.initialize('apikey');
    new app.dash.View.Home();
});