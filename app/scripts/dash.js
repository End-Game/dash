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
            year = year.substring(year.length - 2); // make to 2 digits
            if (month < 10) {
                month = '0' + month;
            }
            return day + '/' + (month + 1) + '/' + year;
        }
    };
});