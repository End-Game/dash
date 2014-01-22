define(['dash', 'underscore'], function(Dash, _) {
    'use strict';
    // <!-- templates-->
    Dash.Template = {};
    
    Dash.Template.home = _.template(
        "<hr>" +
        "<div id='products' class='container'>" +
        "</div>" +
        "<hr>" +
        "<div id='keySections' class='container'>" +
        "</div>"
    );

    Dash.Template.homeProduct = _.template(
        "<a class='product' href='#<%=URL%>'>" +
        "<img src='images/product.jpg'/>" +
        "</a>" +
        "<h3><%=name%></h3>" +
        "<p><%=shortDescription%></p>"
    );

    Dash.Template.keySections = _.template(
        "<h1>Key Sections</h1>" +
        "<ul id='keySections<%=_id%>'>" +
        "</ul>"
    );

    Dash.Template.helpDesk = _.template(
        "<h1><%=name%> Help Desk</h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<!--insert search box here-->" +
            "<p><%=description%></p>" +
            "<hr>" +
            "<div class='inlineDiv half' id='faqs'>" +
                "<h3>FAQ&#39;s</h3>" +
                "<ul id='faqList'>" +
                "</ul>" +
            "</div>" +
            "<div class='inlineDiv half' id='howDoIs'>" +
                "<h3>How Do I&#39;s</h3>" +
                "<ul id='howDoIList'>" +
                "</ul>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.article = _.template(
        "<h1><%=name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='article'>" +
                "<div id='tags'>" +
                    "<p class='bold'>PUBLISHED <%=date%></p>" +
                "</div>" +
                "<p><%=content%></p>" +
                "<hr>" +
                "<div id='relevantArticles'>" +
                    "<h4>Other Relevant Articles</h4>" +
                    "<ul id='relevantArticleList'>" +
                    "</ul>" +
                "</div>" +
            "</div>" +
        "</div>"
    );
    
    Dash.Template.tag = _.template(
        "<p class='themeText'><%=name%></p>"
    );

    Dash.Template.section = _.template(
        "<h1><%=name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<ul id='children'>" +
            "</ul>" +
        "</div>"
    );

    Dash.Template.listItem = _.template(
        "<a href='#<%=URL%>'><%=name%></a>"
    );

    Dash.Template.productSideBar = _.template(
        "<a href='#<%=URL%>/sitemap'>" +
            "<div>" +
                "<img src='images/sitemap.png'/>" +
                "<h4 class='bold'>View Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div>" +
            "<h4>Sections</h4>" +
            "<ul id='sections'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<a href='#'>" +
            "<div>" +
                "<img src='images/sitemap.png'/>" +
                "<p class='bold'>View Other Products</p>" +
            "</div>" +
        "</a>"
    );

    Dash.Template.articleSideBar = _.template(
        "<!--insert mini site map-->" +
        "<hr>" +
        "<a href='#<%=currentProductName%>/sitemap'>" +
            "<div>" +
                "<img src='images/sitemap.png'/>" +
                "<h4 class='bold'>View Full Site Map</h4>" +
            "</div>" +
        "</a>" +
        "<hr>" +
        "<div id='faqs'>" +
            "<h4>FAQ&#39;s</h4>" +
            "<ul id='faqList'>" +
            "</ul>" +
        "</div>" +
        "<hr class='hideable'>" +
        "<div id='howDoIs'>" +
            "<h4>How Do I&#39;s</h4>" +
            "<ul id='howDoIList'>" +
            "</ul>" +
        "</div>" +
        "<hr class='hideable'>" +
        "<div id='otherArticles'>" +
            "<h4>Other Articles in this Section</h4>" +
            "<ul id='otherArticleList'>" +
            "</ul>" +
        "</div>" +
        "<button type='button'>" +
        "<img src='images/support.png'/> Request Support</button>"
    );

    Dash.Template.siteMapSideBar = _.template(
        "<div>" +
            "<h4>Sections</h4>" +
            "<ul id='sections'>" +
            "</ul>" +
        "</div>" +
        "<hr>" +
        "<a href='#'>" +
            "<div>" +
                "<img src='images/sitemap.png'/>" +
                "<p class='bold'>View Other Products</p>" +
            "</div>" +
        "</a>"
    );

    Dash.Template.siteMap = _.template(
        "<h1><%=name%></h1>" +
        "<div class='map inlineDiv twoThird'>" +
        "</div>"
    );

    Dash.Template.map = _.template(
        "<ul class='sections'>" +
        "</ul>"
    );

    // <!-- admin templates -->" +
    Dash.Template.adminHome = _.template(
        "<div class='buttonContainer'>" +
            "<button class='themeButton' type='button'>" +
            "<img src='images/support.png'/>Add New Product</button>" +
        "</div>" +
        "<hr>" +
        "<div id='products' class='container'>" +
        "</div>"
    );
    
    Dash.Template.adminArticle = _.template(
        "<h1><%=name%></h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='article'>" +
                "<div id='tags'>" +
                    "<p class='bold'><%=published ? " + 
                        '"PUBLISHED"'+":"+'"UNPUBLISHED"%>' + " <%=date%></p>" +
                "</div>" +
                "<p><%=content%></p>" +
                "<hr>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.productSetup = _.template(
        "<div class='content'>" +
            "<h1>Set Up Product</h1>" +
            "<hr>" +
            "<input type='text' id='name' class='topField' placeholder='Name of Product...' />" +
            "<textarea id='description' class='bottomField' placeholder='Description of Product...'>" +
            "</textarea>" +
            "<hr>" +
            "<div class='uploadLogo'>" +
                "<img src='images/sitemap.png'>" +
                "<h4 class='bold'>Upload Logo</h4>" +
            "</div>" +
            "<hr>" +
            "<button class='themeButton save' type='button'>Save Product</button>" +
        "</div>"
    );

    Dash.Template.newArticle = _.template(
        "<h1>Add New Article</h1>" +
        "<div class='inlineDiv twoThird'>" +
            "<hr>" +
            "<div id='menu'>" +
            "<div>" +
                "<img src='images/sitemap.png'>" +
                "<p>Format As Heading</p>" +
            "</div>" +
            "<div>" +
                "<img src='images/sitemap.png'>" +
                "<p>Format As Sub Heading</p>" +
            "</div>" +
            "<div>" +
                "<img src='images/sitemap.png'>" +
                "<p>Format As Body Text</p>" +
            "</div>" +
            "<div>" +
                "<img src='images/sitemap.png'>" +
                "<p>Upload Image</p>" +
            "</div>" +
            "<div>" +
                "<img src='images/sitemap.png'>" +
                "<p>Add Video</p>" +
            "</div>" +
            "</div>" +
            "<hr>" +
            "<input type='text' id='title' class='topField' placeholder='Enter Title of Article...' />" +
            "<textarea id='content' class='bottomField' placeholder='Enter Article Content...'>" +
            "</textarea>" +
            "<hr>" +
              "<h3>Preview</h3>" +
            "<div class='preview'></div>" +
            "<button class='half offwhite fullPreview' type='button'>" +
                "<img src='images/sitemap.png'> View Full Preview" +
            "</button>" +
        "</div>"
    );

    Dash.Template.preview = _.template(
        "<h1><%=name%></h1>" +
        "<hr>" +
        "<div id='article'>" +
            "<div id='tags'>" +
                "<p class='bold'>PUBLISHED <%=date%></p>" +
            "</div>" +
            "<p><%=content%></p>" +
        "</div>"
    );

    Dash.Template.backButton = _.template(
        "<button class='third back' type='button'>" +
            "<%=text%>" +
        "</button>"
    );

    Dash.Template.checkboxItem = _.template(
        "<label>" +
            "<input class='checkbox' type='checkbox'><%=name%>" + 
        "</label>"
    );

    Dash.Template.checkboxProduct = _.template(
        "<label>" +
            "<input class='checkbox' type='checkbox'><%=name%>" + 
        "</label>" +
        "<div id='_<%=_id%>'>" +
            "<button class='treePlace' type='button'>Place in Tree</button>" +
            "<div class='treePlace'>" +
                "<p></p>" +
                "<img src='images/sitemap.png'>" +
            "</div>" +
        "</div>"
    );

    Dash.Template.treePlace = _.template(
        "<div class='content big'>" +
            "<h1>Place Article in Tree</h1>" +
            "<hr>" +
            "<div class='map'>" +
            "</div>" +
            "<button class='themeButton inlineDiv half save' type='button'>Save</button>" +
            "<button class='themeButton inlineDiv half cancel' type='button'>Cancel</button>" +
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
                "<option value='unpublished'>Unpublished</option>" +
            "</select>" +
        "</div>" +
        "<button type='button' class='save'>Save</button>"
    );

    Dash.Template.adminProductSideBar = _.template(
        "<button class='themeButton newSection' type='button'> Add New Section</button>" +
        "<hr>" +
        "<button type='button' class='newArticle'> Add New Article</button>" +
        "<button type='button' class='productSettings'> Product Settings</button>" +
        "<button type='button' class='personalise'> Personalise</button>"
    );
    
    Dash.Template.adminArticleSideBar = _.template(
        "<button class='themeButton editArticle' type='button'> Edit Article</button>" +
        "<hr>" +
        "<button type='button' class='newArticle'> Add New Article</button>" +
        "<%=published ? " + 
        '"'+'"'+":"+'"' +
        "<button type='button' class='publishArticle'> publishArticle</button>" + '"%>' 
    );
    
    Dash.Template.errorText = _.template(
        "<p class='errorText'>* <%=errorText%></p>"
    );
    
    Dash.Template.newTag = _.template(
        "<div class='delete themeBorder themeButton'><p>&times;</p></div>" +
        "<p class='smallText'><%=name%></p>"
    );
    
    Dash.Template.newSection = _.template(
        "<div class='content'>" +
            "<h1>Add Section</h1>" +
            "<hr>" +
            "<input type='text' id='name' placeholder='Name of Section...' />" +
            "<hr>" +
            "<button class='treePlace' type='button'>Place in Tree</button>" +
            "<div class='treePlace'>" +
                "<p></p>" +
                "<img src='images/sitemap.png'>" +
            "</div>" +
            "<hr>" +
            "<button class='themeButton save' type='button'>Save Section</button>" +
        "</div>"
    );
    
    Dash.Template.adminSiteMapItem = _.template(
        "<a href='#<%=URL%>'><%=name%></a>" +
        "<%=published ? " + 
        '"'+"<p class='themeText bold small'>&#10003; PUBLISHED</p>"+'"'+":"+'"'+"" +
        "<div><label>" +
            "<p class='themeText bold small'>&times; UNPUBLISHED</p>" +
            "<input class='checkbox' type='checkbox'>" +
        "</label></div>"+'"'+ 
        "%>"
    );
    
    Dash.Template.siteMapSetPublished = _.template(
        "<p id='setPublished'>Set Selected to Published</p>"
    );
});