define(function() {
    'use strict';
    return {
        checkKeywords: function(string) {
            // could separate keywords for products and sections/articles
            var keywords = ['New Article', 'Sitemap', 'admin login', 'admin signup', 'search', '/', 'tag'];
            for (var i = 0; i < keywords.length; i++) {
                if (keywords[i].equalsIgnoreUrl(string)) {
                    return false;
                }
            }
            return true;
        },

        urlEscape: function(string) {
            var urlRegex = /[^0-9a-zA-Z_./~-]/g;
            return string.toLocaleLowerCase().replace(urlRegex, "");
        },

        getDateString: function(monthString) {
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth(); //starts from 0
            var year = date.getFullYear().toString();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', "December"];
            year = year.substring(year.length - 2); // make to 2 digits
            if (day < 10) {
                day = '0' + day;
            }
            if (monthString) {
                return day + ' ' + months[month] + ' ' + year;
            }
            month = month + 1;
            year = year.substring(year.length - 2); // make to 2 digits
            if (month < 10) {
                month = '0' + month;
            }
            return day + '.' + month + '.' + year;
        },

        // from stack overflow http://stackoverflow.com/a/5831191
        // id has length 11
        embedYouTubeURLs: function(text) {
            var re = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
            return text.replace(re, "<iframe width='425' height='250' src='http://www.youtube.com/embed/$1' frameborder='0' allowfullscreen></iframe>");
        }
    };
});