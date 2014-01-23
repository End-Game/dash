define(function() {
    'use strict';
    return {
        checkKeywords: function(string){
            var keywords = ['New Article', 'Sitemap', 'admin login', 'admin signup'];
            for(var i = 0; i<keywords.length; i++){
                if(keywords[i].equalsIgnoreCaseSpace(string)){
                    return false;
                }
            }
            return true;
        }
    };
});