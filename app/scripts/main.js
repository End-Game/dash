require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        relational: '../bower_components/backbone-relational/backbone-relational',
        underscore: '../bower_components/underscore/underscore',
        hoist: './hoist/hoist',
        templates: './templates/templates',
        requirejs: '../bower_components/requirejs/require',
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie",
        showdown: '../bower_components/showdown/src/showdown',
        rangyInputs: './other/rangyinputs/rangyinputs-jquery-1.1.2',
        video: './other/showdown-extensions/video',
        colorPicker: './other/jquery.wheelcolorpicker/jquery.wheelcolorpicker'
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
        },
        relational: {
            deps: ['backbone']
        },
        rangyInputs: {
            deps: ['jquery'],
            exports: '$'
        },
        video: {
            deps: ['showdown'],
            exports: 'Showdown'
        },
        colorPicker: {
            deps: ['jquery'],
            exports: '$'
        }
    }
});
require(['app', 'jquery', 'backbone', 'hoist', 'rangyInputs', 'colorPicker'], function(app, $, Backbone) {
    'use strict';
    $('section').hide();
    $('header').hide();
});