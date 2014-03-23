/*  Video Extension 
     mix of 
     showdown youtube extension base: https://github.com/mehulkar/showdown/blob/8dcf76b6522ee2e3a6e18dc5217515e5f53b3731/src/extensions/youtube.js
     youtube regex from: http://stackoverflow.com/a/5831191
     vimeo regex from: http://stackoverflow.com/a/13286930

     ^^http://www.youtube.com/watch?v=0mmx68VmTEo  ->
     <iframe  src=\"//www.youtube.com/embed/0mmx68VmTEo?rel=0\"\nframeborder=\"0\" allowfullscreen></iframe>
 */

(function() {
    var video = function(converter) {
        return [{
            type: 'lang',
            regex: '\\^\\^([\\S]+)',
            replace: function(match, url) {
                var m, video_id, re;
                vimeoRe = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
                youtubeRe = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
                if (vimeoRe.test(url)) {
                    return url.replace(vimeoRe, '<iframe src="//player.vimeo.com/video/$3" width="WIDTH" height="HEIGHT" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                } else if (youtubeRe.test(url)) {
                    return url.replace(youtubeRe, "<iframe src='//www.youtube.com/embed/$1' frameborder='0' allowfullscreen></iframe>");
                } else {
                    return match;
                }
            }
        }];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.video = video;
    }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = video;

}());