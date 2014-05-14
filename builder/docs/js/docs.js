 var jUlRoot;

 function setVisibilityByActivate() {
     var jUl = $("ul", jUlRoot);
     jUl.css({
         display: "none"
     });

     var jLiActive = $("li.active", jUlRoot);
     var jUlActive = jLiActive.children('ul');
     jUlActive.css({
         display: "block"
     });

     jUlRoot.css({
         display: "block"
     });
 }

 function initCatalog() {
     var catalog = [];
     jUlRoot = $("#navRoot");
     jUlRoot.addClass('ul0');

     var currentHs = [];
     var hs = $("h1,h2,h3,h4,h5,h6","#docRoot");

     hs.each(function(index) {
         var id = this.id;
         var title = this.innerHTML;
         var level = currentHs.length - 1;
         var thisLevel = parseInt(this.tagName.slice("1")) - 1;
         var strLi, jLi, jUl;
         if (thisLevel === 0) {
             currentHs = [this];
             strLi = "<li data-idinfo=" + id + "><a href=#" + id + ">" + title + "</a></li>";
             jLi = $(strLi);             
             jLi.appendTo(jUlRoot);
             jLi.addClass('li0');
             $('a',jLi).addClass('a0');
         } else {
             if (thisLevel > level) {
                 currentHs[thisLevel] = this;
             } else if (thisLevel === level) {
                 currentHs[thisLevel] = this;
             } else if (thisLevel < level) {
                 currentHs = currentHs.slice(0, thisLevel);
                 currentHs[thisLevel] = this;
             }
             var parentId = currentHs[currentHs.length - 2].id;
             jLi = $("li[data-idinfo='" + parentId + "']", jUlRoot);
             jUl = jLi.children("ul");
             if (jUl.length === 0) {
                 jUl = $("<ul class='nav'></ul>");
                 jUl.appendTo(jLi);
                 jUl.addClass('ul'+thisLevel);
             }
             strLi = "<li data-idinfo=" + id + "><a href=#" + id + ">" + title + "</a></li>";
             var jLi2 = $(strLi);
             jLi2.appendTo(jUl);
             jLi2.addClass('li'+thisLevel);
             $('a',jLi2).addClass('a'+thisLevel);
         }
     });
 }

 function getBodyScrollTop() {
     var result = 0,
         top1 = 0,
         top2 = 0;
     if (document.body) {
         top1 = document.body.scrollTop;
     }
     if (document.documentElement) {
         top2 = document.documentElement.scrollTop;
     }
     result = Math.max(top1, top2);
     return result;
 }

 function resetCatalogMaxHieght(){
    var H = $("#root").height();
    var top = $("#catalog").offset().top;
    var a = top - 51;
    var b = 30;
    var h = H - a - b;
    $("#catalog").css("maxHeight",h+"px");
 }

 function onAtivate(){
    setVisibilityByActivate();
 }

 function onResize(){
    resetCatalogMaxHieght();
 }

 function onScroll() {
    var top = 210;
    var scrollTop = $("#root").scrollTop(); //getBodyScrollTop();
    if (scrollTop >= top) {
       $("#myaffix").removeClass("affix-top").addClass("affix").removeClass("affix-bottom");
    } else {
        $("#myaffix").addClass("affix-top").removeClass("affix").removeClass("affix-bottom");
    }
    resetCatalogMaxHieght();
 }

 function back2Top(){
    $("#root").animate({scrollTop:0},500);
 }

 $(function() {
     initCatalog();
     $('#root').scrollspy({
         target: '.catalog'
     });
     $('.nav li').on('activate',onAtivate);
     $("myaffix").addClass("affix-top");
     $('#root').scroll(onScroll);
     $('.button-back').click(back2Top);
     $(window).on('resize',onResize);
     onScroll();
     onResize();
 });