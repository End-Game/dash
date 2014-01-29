define(function() {
    'use strict';
    return {
        checkKeywords: function(string){
            // could separate keywords for products and sections/articles
            var keywords = ['New Article', 'Sitemap', 'admin login', 'admin signup', 'search'];
            for(var i = 0; i<keywords.length; i++){
                if(keywords[i].equalsIgnoreCaseSpace(string)){
                    return false;
                }
            }
            return true;
        }
    };
});