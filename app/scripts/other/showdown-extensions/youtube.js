/*  Youtube Extension 
     mix of 
     https://github.com/mehulkar/showdown/blob/8dcf76b6522ee2e3a6e18dc5217515e5f53b3731/src/extensions/youtube.js
     and http://stackoverflow.com/a/5831191


     ^^http://www.youtube.com/watch?v=0mmx68VmTEo  ->
     <iframe  src=\"//www.youtube.com/embed/0mmx68VmTEo?rel=0\"\nframeborder=\"0\" allowfullscreen></iframe>
 */

(function() {
    var youtube = function(converter) {
        return [{
            type: 'lang',
            regex: '\\^\\^([\\S]+)',
            replace: function(match, url) {
                var m, video_id, re;
                re = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
                if (re.test(url)) {
                    return url.replace(re, "<iframe src='http://www.youtube.com/embed/$1' frameborder='0' allowfullscreen></iframe>");
                } else {
                    return match;
                }
            }
        }];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.youtube = youtube;
    }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = youtube;

}());