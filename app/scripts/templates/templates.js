define(['dash', 'underscore', 'showdown', 'video'], function(Dash, _, Showdown) {
    'use strict';
    // <!-- templates-->
    // window.converter = new Showdown.converter();
    //{extensions: [Youtube]});
   window.converter = new Showdown.converter({extensions: ['video']});
    Dash.Template = {};
    Dash.Template.home = _.template(
        "<hr>" +
        "<div class='homeContainer'>" +
            "<div class='leftCover'>" +
                "<div class='productsArrow left'>" +
                    "<img src='images/left_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='rightCover'>" +
                "<div class='productsArrow right'>" +
                    "<img src='images/right_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='container'>" +
                "<div id='products'></div>" +
            "</div>" +
        "</div>" +
        "<hr>" +
        "<div class='homeContainer'>" +
            "<div class='leftCover'>" +
                "<div class='productsArrow left'>" +
                    "<img src='images/left_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='rightCover'>" +
                "<div class='productsArrow right'>" +
                    "<img src='images/right_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='container'>" +
                "<div id='keySections'></div>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.homeProduct = _.template(
        "<a class='product' href='#!<%-URL%>'>" +
          //  "<img src='<%-logoURL ? logoURL:'images/product.jpg'%>'/>" +
            "<div class='imageContainer'>" +
                "<img src='<%-logoURL%>'/>" +
            "</div>" +
        "</a>" +
        "<h2><%-name%></h2>" +
        "<p class='textBlock'><%-shortDescription%></p>"
    );

    Dash.Template.keySections = _.template(
        "<h1>Key Sections</h1>" +
        "<ul id='keySections<%-_id%>'>" +
        "</ul>"
    );

    Dash.Template.helpDesk = _.template(
        "<h1><%-name%> Help Desk</h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<!--insert search box here-->" +
            "<div class='textBlock'><%=converter.makeHtml(description.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
            "<hr>" +
            "<div class='inlineDiv half' id='faqs'>" +
                "<h2>FAQ&#39;s</h2>" +
                "<ul id='faqList'>" +
                "</ul>" +
            "</div>" +
            "<div class='inlineDiv half' id='howDoIs'>" +
                "<h2>How Do I&#39;s</h2>" +
                "<ul id='howDoIList'>" +
                "</ul>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.article = _.template(
        "<p class='breadCrumb'></p>" +
        "<h1><%-name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='article'>" +
                "<div id='tags'>" +
                    "<p>PUBLISHED <%-date%></p>" +
                "</div>" +
                "<div class='textBlock'><%=converter.makeHtml(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
                "<hr>" +
                "<div id='relevantArticles'>" +
                    "<h4>Other Relevant Articles</h4>" +
                    "<ul id='relevantArticleList'>" +
                    "</ul>" +
                "</div>" +
                "<hr>" +
                "<div class='discussionContainer'></div>" +
            "</div>" +
        "</div>"
    );
    
    Dash.Template.search = _.template(
        "<h1>Search Results</h1>" +
        "<hr>" +
        "<!--insert search box-->" +// insert searchbox
        "<div class='searchbox'>" + 
            "<input type='text' class='search' placeholder='What are you looking for...' />" +
            "<div class='themeBorder search themeButton'><p>Search</p></div>" +
        "</div>" +
        "<div class='results'></div>" +
        "<hr>" +
        "<!--insert page number links-->" //insert page number links
    );
    
    Dash.Template.searchResult = _.template(
        "<a href='<%-link%>'><h2><%-htmlTitle%></h2></a>" +
        "<p><%-htmlSnippet%></p>"
    );
    
    Dash.Template.tag = _.template(
        "<p><a class='themeText' href='#!<%-URL%>'><%-name%></a></p>"
    );

    Dash.Template.section = _.template(
        "<p class='breadCrumb'></p>" +
        "<h1><%-name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div class='textBlock'><%=converter.makeHtml(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
            "<hr>" +
            "<ul id='children'>" +
            "</ul>" +
            "<hr>" +
            "<div class='discussionContainer'></div>" +
        "</div>"
    );
    
    Dash.Template.tagPage = _.template(
        "<p class='breadCrumb'></p>" +
        "<h1><%-name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<ul id='children'>" +
            "</ul>" +
            "<hr>" +
        "</div>"
    );

    Dash.Template.listItem = _.template(
        "<a href='#!<%-URL%>'><%-name%></a>"
    );
    
    Dash.Template.nonLinkListItem = _.template(
        "<span class='themeText'><%-name%></span>" 
   );

    Dash.Template.productSideBar = _.template(
        "<a href='#!<%-URL%>/sitemap'>" +
            "<div>" +
                "<img class='themeColour' src='images/view.png'/>" +
                "<h4 class='bold'>View Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div>" +
            "<h4>Sections</h4>" +
            "<ul id='sections'>" +
            "</ul>" +
        "</div>" +
        "<hr class='goHome'>" +
        "<a href='#!' class='goHome'>" +
            "<div>" +
                "<img src='images/view_grey.png'/>" +
                "<p class='bold'>View Other Products</p>" +
            "</div>" +
        "</a>" +
       // "<hr>" +
        "<button type='button' class='support themeButton'>" +
            "<img src='images/help.png'/><p>Request Support</p>" +
        "</button>"
    );

    Dash.Template.articleSideBar = _.template(
        "<div id='miniMap'>" +
            "<ul id='miniMapList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<a href='#!<%-currentProductName%>/sitemap'>" +
            "<div>" +
                "<img class='themeColour' src='images/view.png'/>" +
                "<h4 class='bold'>View Full Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div id='faqs'>" +
            "<h4>FAQ&#39;s</h4>" +
            "<ul id='faqList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div id='howDoIs'>" +
            "<h4>How Do I&#39;s</h4>" +
            "<ul id='howDoIList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div id='otherArticles'>" +
            "<h4>Other Articles in this Section</h4>" +
            "<ul id='otherArticleList'>" +
            "</ul>" +
        "</div>" +
        "<button type='button' class='support themeButton'>" +
            "<img src='images/help.png'/><p>Request Support</p>" +
        "</button>"
    );
    
    Dash.Template.sectionSideBar = _.template(
        "<div id='miniMap'>" +
            "<ul id='miniMapList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<a href='#!<%-currentProductName%>/sitemap'>" +
            "<div>" +
                "<img class='themeColour' src='images/view.png'/>" +
                "<h4 class='bold'>View Full Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div id='faqs'>" +
            "<h4>FAQ&#39;s</h4>" +
            "<ul id='faqList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div id='howDoIs'>" +
            "<h4>How Do I&#39;s</h4>" +
            "<ul id='howDoIList'>" +
            "</ul>" +
        "</div>" +
        "<button type='button' class='support themeButton'>" +
            "<img src='images/help.png'/><p>Request Support</p>" +
        "</button>"
    );    
    
    Dash.Template.tagSideBar = _.template(
        "<a href='#!<%-currentProductName%>/sitemap'>" +
            "<div>" +
                "<img class='themeColour' src='images/view.png'/>" +
                "<h4 class='bold'>View Full Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div id='faqs'>" +
            "<h4>FAQ&#39;s</h4>" +
            "<ul id='faqList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div id='howDoIs'>" +
            "<h4>How Do I&#39;s</h4>" +
            "<ul id='howDoIList'>" +
            "</ul>" +
        "</div>" +
        "<button type='button' class='support themeButton'>" +
        "<img src='images/help.png'/><p>Request Support</p></button>"
    );

    Dash.Template.siteMapSideBar = _.template(
        "<div>" +
            "<h4>Sections</h4>" +
            "<ul id='sections'>" +
            "</ul>" +
        "</div>" +
        "<hr class='goHome'>" +
        "<a href='#!' class='goHome'>" +
            "<div>" +
                "<img src='images/view_grey.png'/>" +
                "<p class='bold'>View Other Products</p>" +
            "</div>" +
        "</a>" +
        "<button type='button' class='support themeButton'>" +
            "<img src='images/help.png'/><p>Request Support</p>" +
        "</button>"
    );

    Dash.Template.siteMap = _.template(
        "<div class='twoThird'>" +
            "<h1><%-name%></h1>" +
            "<div class='toggle'>" +
                "<div class='toggleMap'>" +
                    "<img src='images/map_white.png'/>" +
                    "<p>Map</p>" + 
                "</div>" + 
                "<div class='toggleList'>" +
                    "<img src='images/list_white.png'/>" +
                    "<p>List</p>" + 
                "</div>" + 
            "</div>" +
        "</div>" +
        "<div class='map inlineDiv twoThird'>" +
        "</div>"
    );

    Dash.Template.map = _.template(
        "<ul class='sections'>" +
        "</ul>"
    );
    
    Dash.Template.breadCrumb = _.template(
        "<a class='themeText' href='#!<%-URL%>'><%-name%></a>"
    );
    
    Dash.Template.productsArrow = _.template(
        "<div class='productsArrow <%=left? 'left':'right'%>'>" +
            "<img src='images/<%=left? 'left':'right'%>_arrow.png'/>" + 
        "</div>"
    );
    
    Dash.Template.supportModal = _.template(
        "<div class='content supportModal'>" +
            "<h1>Request Support</h1>" +
            "<p style='margin-bottom:15px;'>We'd love to hear from you if you have any questions, suggestions or problems. Or just send us a note.</p>" +
            "<div>" +
                "<label>Your Name</label>" +
                "<input type='text' value='' id='name' name='Name'></input>" +
            "</div>" +
            "<div>" +
                "<label>Your Email Address</label>" +
                "<input type='text' value='' id='emailAddress' name='EmailAddress'></input>" +
            "</div>" +
            "<div>" +
                "<label>Your Message</label>" +
                "<textarea id='message' name='Message'></textarea>" +
            "</div>" +
            "<button class='themeButton send half' type='button'><p>Send Request</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );
    
    // Dash.Template.discussionHidden = _.template("");
    
    Dash.Template.discussion = _.template(
        "<div class='toggleDiscussion'>" +
            "<img class='themeColour' src='images/discussion.png'>" +
            "<h4 class='bold'>View Discussions</h4>" +
        "</div>" +
        "<div class='toggleDiscussion'>" +
            "<img class='themeColour' src='images/hide_discussion.png'>" +
            "<h4 class='bold'>Hide Discussions</h4>" +
        "</div>" +
        "<div class='discussion'>" +
            "<div class='comments'></div>" +
            "<div class='toggleAddComment'>" +
                "<img src='images/discussion_grey.png'>" +
                "<p class='bold'>Add Comment</p>" +
            "</div>" +
            "<div class='addComment'>" +
                "<input type='text' id='author' class='topField' placeholder='Your Name...' />" +
                "<textarea id='content' class='bottomField' placeholder='Your Comment...'></textarea>" +
                "<button class='themeButton save half' type='button'><p>Save</p></button>" +
            "</div>" +
        "</div>"  
    );
    
    Dash.Template.comment = _.template(
        "<div class='textBlock'><%=converter.makeHtml(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
        "<p class='dateAuthor'><%-date%> // <%-author%>" +
        "<hr>"
    );
    
    // <!-- admin templates -->" +
    Dash.Template.adminHome = _.template(
        "<div class='buttonContainer container'>" +
            "<button class='themeButton' type='button'>" +
                "<img src='images/new_white.png'/><p>Add New Product</p>" +
            "</button>" +
        "</div>" +
        "<hr>" +
        "<div class='homeContainer'>" +
            "<div class='leftCover'>" +
                "<div class='productsArrow left'>" +
                    "<img src='images/left_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='rightCover'>" +
                "<div class='productsArrow right'>" +
                    "<img src='images/right_arrow.png'/>" + 
                "</div>" +
            "</div>" +
            "<div class='container'>" +
                "<div id='products'></div>" +
            "</div>" +
        "</div>"
    );
    
    Dash.Template.adminArticle = _.template(
        "<p class='breadCrumb'></p>" +
        "<h1><%-name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='article'>" +
                "<div id='tags'>" +
                    "<p class='bold'><%-published ? 'PUBLISHED':'NOT PUBLISHED'%> <%-date%></p>" +
                "</div>" +
                "<div class='textBlock'><%=converter.makeHtml(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
                "<hr>" +
                "<div class='discussionContainer'></div>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.productSetup = _.template(
        "<div class='content'>" +
            "<h1>Set Up Product</h1>" +
            "<hr>" +
            "<input type='text' id='name' class='topField' placeholder='Name of Product...' />" +
            "<textarea id='shortDescription' class='middleField' placeholder='Short description of Product...'></textarea>" +
            "<textarea id='description' class='bottomField' placeholder='Full description of Product...'></textarea>" +
            "<hr>" +
            "<div class='uploadLogo'>" +
                "<img class='themeButton' src='images/image.png'>" +
                "<h4 class='bold'>Upload Logo</h4>" +
            "</div>" +
            "<div class='changeLogo'>" +
                "<img src='' class='logo inlineDiv'>" +
                "<div class='uploadLogo inlineDiv'>" +
                    "<img class='themeButton' src='images/image.png'>" +
                    "<h4 class='bold'>Change Logo</h4>" +
                "</div>" +
            "</div>" +
            "<input type='file'/>" +
            "<hr>" +
            "<button class='themeButton save half' type='button'><p>Save Product</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );
    
    Dash.Template.productPersonalise = _.template(
        "<div class='content'>" +
            "<h1>Personalise</h1>" +
            "<hr>" +
            "<img src='<%-logoURL%>' class='logo inlineDiv'>" +
            "<div class='uploadLogo inlineDiv'>" +
                "<img class='themeButton' src='images/image.png'>" +
                "<h4 class='bold'>Change Logo</h4>" +
            "</div>" +
            "<input type='file'/>" +
            "<hr>" +
            "<h4>Choose Primary Colour</h4>" +
            // insert drop down for colour
            "<input type='text' class='primary smallText' placeholder='Enter Hex Code' />" +
            "<hr>" +
            "<label>" +
                "<input id='discussion' class='checkbox' type='checkbox'>Enable Discussion" + 
            "</label>" +
            "<hr>" +
            "<button class='themeButton save half' type='button'><p>Save Changes</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );

    Dash.Template.newArticle = _.template(
        "<h1>Add New Article</h1>" +
        "<div id='newArticleContainer' class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='menu'>" +
                "<div id='formatHeading'>" +
                    "<img class='themeColour' src='images/heading.png'>" +
                    "<p>Format As Heading</p>" +
                "</div>" +
                "<div id='formatSubHeading'>" +
                    "<img class='themeColour' src='images/subheading.png'>" +
                    "<p>Format As Sub Heading</p>" +
                "</div>" +
                "<div id='formatBody'>" +
                    "<img class='themeColour' src='images/body.png'>" +
                    "<p>Format As Body Text</p>" +
                "</div>" +
                "<div id='formatImage'>" +
                    "<input type='file'/>" +
                    "<img class='themeColour' src='images/image.png'>" +
                    "<p>Upload Image</p>" +
                "</div>" +
                "<div id='formatVideo'>" +
                    "<input type='file'/>" +
                    "<img class='themeColour' src='images/video.png'>" +
                    "<p>Add Video</p>" +
                "</div>" +
            "</div>" +
            "<hr>" +
            "<input type='text' id='title' class='topField' placeholder='Enter Title of Article...' />" +
            "<textarea id='content' class='bottomField' placeholder='Enter Article Content...'></textarea>" +
            "<hr>" +
            "<h3>Preview</h3>" +
            "<div class='preview'></div>" +
            "<button class='half offwhite fullPreview' type='button'>" +
                "<img src='images/view_grey.png'><p>View Full Preview</p>" +
            "</button>" +
        "</div>"
    );

    Dash.Template.preview = _.template(
        "<h1><%-name%></h1>" +
        "<hr>" +
        "<div id='article'>" +
            "<div id='tags'>" +
                "<p class='bold'>PUBLISHED <%-date%></p>" +
            "</div>" +
            "<div class='textBlock'><%=converter.makeHtml(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'))%></div>" +
        "</div>"
    );

    Dash.Template.backButton = _.template(
        "<button class='third back' type='button'>" +
            "<p><%-text%></p>" +
        "</button>"
    );

    Dash.Template.checkboxItem = _.template(
        "<label>" +
            "<input class='checkbox' type='checkbox'><%-name%>" + 
        "</label>"
    );

    Dash.Template.checkboxProduct = _.template(
        "<label>" +
            "<input class='checkbox' type='checkbox'><%-name%>" + 
        "</label>" +
        "<div class='treePlaceContainer' id='_<%-_id%>'>" +
            "<button class='treePlace' type='button'><img src='images/place.png'><p>Place in Tree</p></button>" +
            "<div class='treePlace'>" +
                "<p></p>" +
                "<div><img src='images/pencil.png'></div>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.treePlace = _.template(
        "<div class='content big'>" +
            "<h1>Place Article in Tree</h1>" +
            "<hr>" +
            "<div class='map'>" +
            "</div>" +
            "<button class='themeButton inlineDiv half save' type='button'><p>Save</p></button>" +
            "<button class='themeButton inlineDiv half cancel' type='button'><p>Cancel</p></button>" +
        "</div>"
    );

    Dash.Template.newArticleSideBar = _.template(
        "<div>" +
            "<h4>Products This Article Relates To</h4>" +
            "<ul class='checkboxList' id='productList'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div>" +
            "<ul id='articleTypeList' class='checkboxList'>" +
                "<li>" +
                    "<label>" +
                    "<input class='checkbox' id='isFaq' type='checkbox'>Article is a 'FAQ'</label>" +
                "</li>" +
                "<li>" +
                    "<label>" +
                    "<input class='checkbox' id='isHowTo' type='checkbox'>Article is a 'How To'</label>" +
                "</li>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<div id='tagsList'>" +
            "<h4>Tags</h4>" +
            "<input class='smallText' type='text' id='tagName' placeholder='Enter Tag'/>" +
        "</div>" +
        "<hr>" +
        "<div>" +
            "<h4>Article Status</h4>" +
            "<select id='published'>" +
                "<option value='published'>Published</option>" +
                "<option value='unpublished'>Not published</option>" +
            "</select>" +
        "</div>" +
        "<button type='button' class='save themeButton'><p>Save</p></button>"
    );

    Dash.Template.adminProductSideBar = _.template(
        "<button class='themeButton newSection' type='button'><img src='images/new_white.png'/><p>Add New Section</p></button>" +
        "<hr>" +
        "<button type='button' class='newArticle'><img src='images/article_grey.png'/><p>Add New Article</p></button>" +
        "<button type='button' class='settings'><img src='images/settings.png'/><p>Product Settings</p></button>" +
        "<button type='button' class='personalise'><img src='images/personalise.png'/><p>Personalise</p></button>" +
        "<button type='button' class='keySections'><img src='images/edit.png'/><p>Edit Key Sections</p></button>"
    );
    
    Dash.Template.adminArticleSideBar = _.template(
        "<button class='themeButton editArticle' type='button'><img src='images/edit_white.png'/><p>Edit Article</p></button>" +
        "<hr>" +
        "<button type='button' class='newArticle'><img src='images/article_grey.png'/><p>Add New Article</p></button>" +
        
        "<button type='button' class='publishArticle'><img src='images/<%-published ?'un':''%>publish.png'/><p><%-published ?  'Unpublish Article':'Publish Article' %></p></button>" 
    );
    
    Dash.Template.adminSectionSideBar = _.template(
        "<button class='themeButton newArticle' type='button'><img src='images/article.png'/><p>Add New Article</p></button>" +
        "<hr>" +
        "<button type='button' class='newSection'><img src='images/new.png'/><p>Add New Section</p></button>" +
        "<button type='button' class='editSection'><img src='images/edit.png'/><p>Edit Section</p></button>"
    );
    
    Dash.Template.errorText = _.template(
        "<p class='errorText'>* <%-errorText%></p>"
    );
    
    Dash.Template.newTag = _.template(
        "<div class='delete themeBorder themeButton'><img src='images/cross_white-33.png'></div>" +
        "<p><%-name%></p>"
    );
    
    Dash.Template.newSection = _.template(
        "<div class='content'>" +
            "<h1>Add Section</h1>" +
            "<hr>" +
            "<input type='text' id='name' class='topField' placeholder='Name of Section...' />" +
            "<textarea id='content' class='bottomField' placeholder='Overview of Section...'></textarea>" +
            "<hr>" +
            "<button class='treePlace' type='button'><img src='images/place.png'><p>Place in Tree</p></button>" +
            "<div class='treePlace'>" +
                "<p></p>" +
                "<div><img src='images/pencil.png'></div>" +
            "</div>" +
            "<hr>" +
            "<button class='themeButton save half' type='button'><p>Save Section</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );
    
    Dash.Template.adminMapItemPublished = _.template(
        "<div class='published'>" + 
            "<img class='themeColour' src='images/tick.png'>" +
            "<p class='themeText bold'> PUBLISHED</p>" +
        "</div>"
    );
    
    // Dash.Template.adminMapItemPublished = _.template(
    //     "<a href='#!<%-URL%>'><%-name%></a>" +
    //     "<p class='themeText bold small'>&#10003; PUBLISHED</p>"
    // );
    
    Dash.Template.adminMapItemUnpublished = _.template(
        "<div class='published'>" +
            "<label>" +
                "<img class='themeColour' src='images/cross.png'>" +
                "<p class='themeText bold'> NOT PUBLISHED</p>" +
                "<input class='checkbox' type='checkbox'>" +
            "</label>" +
        "</div>"
    );
    
    Dash.Template.siteMapSetPublished = _.template(
        "<div class='setPublished'><p>Set Selected to Published</p><div>"
    );
    
    Dash.Template.login = _.template(
        "<div class='third centre'>" +
            "<h1>Log in</h1>" +
            "<fieldset>" +
                "<label for='EmailAddress'>Email Address</label>" +
                "<div class='input-cage'>" +
                    "<input type='text' id='EmailAddress' name='EmailAddress' />" +
                "</div>" +
            "</fieldset>" +
            "<fieldset>" +
                "<label for='Password'>Password</label>" +
                "<div class='input-cage'>" +
                    "<input type='password' id='Password' name='Password' />" +
                "</div>" +
            "</fieldset>" +
            "<button class='login third themeButton centre' type='button'><p>Log in</p></button>" +
        "</div>"
    );
    
    Dash.Template.signup = _.template(
        "<div class='third centre'>" +
            "<h1>Sign Up</h1>" +
            "<fieldset>" +
                "<label for='Name'>Name</label>" +
                "<div class='input-cage'>" +
                    "<input type='text' id='Name' name='Name' />" +
                "</div>" +
            "</fieldset>" +
            "<fieldset>" +
                "<label for='EmailAddress'>Email Address</label>" +
                "<div class='input-cage'>" +
                    "<input type='text' id='EmailAddress' name='EmailAddress' />" +
                "</div>" +
            "</fieldset>" +
            "<fieldset>" +
                "<label for='Password'>Password</label>" +
                "<div class='input-cage'>" +
                    "<input type='password' id='Password' name='Password' />" +
                "</div>" +
            "</fieldset>" +
            "<fieldset>" +
                "<label for='RepeatPassword'>Repeat Password</label>" +
                "<div class='input-cage'>" +
                    "<input type='password' id='RepeatPassword' name='RepeatPassword' />" +
                "</div>" +
            "</fieldset>" +
            "<button class='signup third themeButton centre' type='button'><p>Sign Up</p></button>" +
        "</div>"
    );
    
    Dash.Template.adminEmptyProduct = _.template(
        "<div class='emptyProduct'>" +
            "<h1>There are currently no sections set up for this product.</h1>" +
            "<hr>" +
            "<p>To get your site map underway, click on the ‘Add New Section’ button to the right.</p>" +
        "</div>"
    );
    
    Dash.Template.adminMapListHeader = _.template(
        '<div>' + 
            '<div><h3>Article</h3></div>' +
            '<div><h3>Section</h3></div>' +
            '<div><h3>Status</h3></div>' +
            '<hr>' +
        '</div>'
    );
    
    Dash.Template.mapListHeader = _.template(
        '<div>' + 
            '<div><h3>Article</h3></div>' +
            '<div><h3>Section</h3></div>' +
            '<hr>' +
        '</div>'
    );
    
    Dash.Template.adminMapListItem = _.template(
        "<div><a href='#!<%-URL%>'><%-name%></a></div>" +
        "<div><a class='lightText' href='#!<%-sectionURL%>'><%-sectionName%></a></div>"
    );
    
    Dash.Template.mapListItem = _.template(
        "<div><a href='#!<%-URL%>'><%-name%></a></div>" +
        "<div><a class='lightText' href='#!<%-sectionURL%>'><%-sectionName%></a></div>"
    );
    
    Dash.Template.adminMenu = _.template(
        "<div class='container'>" +
            "<div class='productSelect'>" +
                "<p><%-product? product.name:'Select a Product'%></p>" + 
                "<div class='arrow themeBorder'><img src='images/arrow_white.png'></div>" +
                "<ul id='productMenu'></ul>" +
            "</div>" +
            "<div class='logout themeBorder'><p>Logout</p></div>" +
            "<p>Welcome Back <%-user%></p>" +
        "</div>"
    );
    
    Dash.Template.productMenuItem = _.template(
        "<li>" +
            "<a href='#!<%-URL%>'><%-name%></a>" +
        "</li>"
    );
    
    Dash.Template.editKeySections = _.template(
        "<div class='content'>" +
            "<h1>Key Sections</h1>" +
            "<hr>" +
            "<div id='sectionList'></div>" +
            "<hr>" +
            "<button class='addSection' type='button'><img src='images/new.png'><p>Add Key Section</p></button>" +
            "<hr>" +
            "<button class='themeButton save half' type='button'><p>Save</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );
    
    Dash.Template.addVideo = _.template(
        "<div class='content addVideo'>" +
            "<h4>Enter Youtube or Vimeo url</h4>" +
            "<input type='text' class='videoUrl' />" +
            "<hr>" +
            "<button class='themeButton save half' type='button'><p>Save</p></button>" +
            "<button class='themeButton cancel half' type='button'><p>Cancel</p></button>" +
        "</div>"
    );
    
});