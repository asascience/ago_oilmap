

$(document).ready(function(){
    // initBanner();
    initCarousel();
    initVerticalNav();
    initHorNav();
    animateSwitchVerNav(0);
    //initHorNav();
    $(window).resize(onResize);
    $(window).bind("mousewheel",onScroll);
    $(window).bind("DOMMouseScroll",onScroll);
    $(".button-back").click(function(){
        animateSwitchVerNav(0);
    });
    $(window).keydown(onKeyDown);
    onResize();
});

function initCarousel(){
    var carousels = $(".carousel");
    carousels.each(function(){
        $.fn.carousel.create(this);
    });
}

function onKeyDown(event){
    var originalEvent = event.originalEvent;
    var keyNum = originalEvent.keyCode !== undefined ? originalEvent.keyCode : originalEvent.which;
    if(keyNum === 40 || keyNum === 34){
        //next page
        onPartScroll(1);
    }
    else if(keyNum === 38 || keyNum === 33){
        //previous page
        onPartScroll(-1);
    }
    else if(keyNum === 36){
        //home page
        animateSwitchVerNav(0);
    }
    else if(keyNum === 35){
        //last page
        var parts = $(".part");
        animateSwitchVerNav(parts.length-1);
    }
}

////////////////////////////////////////////banner setting//////////////////////////////////////////////////////
var banner=null;
var isBannerVisible=true;
var isBannerMoving = false;
var bannerMovingTime = 500;
var bannerHeight = 0;

function initBanner(){
    var jBanner = $(".banner");
    if(jBanner.length > 0){
        banner = jBanner[0];
        bannerHeight = $(banner).height();
        $.fn.carousel.create(banner);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function onScroll(evt){
    var originalEvent = evt.originalEvent;
    originalEvent.preventDefault();
    originalEvent.stopPropagation();

    var delta = 0;
    if(originalEvent.wheelDelta !== undefined){
        //Firefox
        delta = -parseInt(originalEvent.wheelDelta / 120);
    }
    else if(originalEvent.detail !== undefined){
        //not Firefox
        delta = parseInt(originalEvent.detail / 3);
    }

    if(isBannerMoving){
        return;
    }

    if(delta > 0){
        //down
        if(banner && isBannerVisible){
            isBannerMoving = true;
            var marginTop = -bannerHeight+"px";
            $(banner).animate({marginTop:marginTop},bannerMovingTime,function(){
                isBannerVisible = false;
                isBannerMoving = false;
            });
        }
        else{
            onPartScroll(delta);
        }
    }
    else if(delta < 0){
        //up
        if(banner && !isBannerVisible && selectedPartIndex === 0){
            isBannerMoving = true;
            $(banner).animate({marginTop:0},bannerMovingTime,function(){
                isBannerVisible = true;
                isBannerMoving = false;
            });
        }
        else{
            onPartScroll(delta);
        }
    }
}

function onPartScroll(delta){
    if(delta > 0){
        animateSwitchVerNav(selectedPartIndex+1);
    }
    else if(delta < 0){
        animateSwitchVerNav(selectedPartIndex-1);
    }
}

function onResize(){
    var vNavHeight = verticalNav.clientHeight;
    var vNavTop = (innerHeight - vNavHeight)/2;
    $(verticalNav).css("top",vNavTop+"px");
    setVerTop(selectedPartIndex);
}
///////////////////////////////////////////vertical setting////////////////////////////////////////////////////
var verticalNav = null;
var selectedPartIndex = 0;
var partSwitchTime = 800;
var isVerNavSwitching = false;

function initVerticalNav(){
    var strNav = "<div class='vertical-nav nav'><ul></ul></div>";
    var jVerNav = $(strNav);
    verticalNav = jVerNav[0];
    jVerNav.appendTo(document.body);

    $("div.part").each(function(){
        var tip = this.getAttribute('data-tip');//this.dataset.tip;
        var str = "<li>"
            +"<a>"
                +"<span class='dot'></span>"
                +"<p class='hover-text'>"+tip+"</p>"
            +"</a>"
        +"</li>";
        var jLi = $(str);
        jLi.appendTo($("ul",verticalNav));
    });

    $("ul li",verticalNav).click(function(event){
        $("ul li",verticalNav).removeClass("selected");
        $(this).addClass("selected");
        var index = $(this).parent().children().index(this);
        animateSwitchVerNav(index);
    });
}

function setVerTop(currentPartIndex){
    currentPartIndex = typeof currentPartIndex == "number" ? currentPartIndex : 0;
    var partHeight = getPartHeight();
    $(".part").each(function(i){
        $(this).css("top",partHeight*(i-currentPartIndex)+"px");
    });
}

function animateSwitchVerNav(newPartIndex){
    if(isVerNavSwitching){
        return;
    }
    setVerTop(selectedPartIndex);
    if(newPartIndex < 0){
        return;
    }
    if(newPartIndex >= $("div.part").length ){
        return;
    }

    $("ul li",verticalNav).removeClass("selected");
    var i = newPartIndex + 1;
    var jLi = $("ul li:nth-child("+i+")",verticalNav);
    jLi.addClass("selected");
    var jHoverText = $(".hover-text",jLi);
    jHoverText.css({
        "opacity":0,
        "display":"block"
    });
    jHoverText.animate({opacity:1},1000,function(){
        jHoverText.css("display","");
    });

    if(selectedPartIndex == newPartIndex){
        return;
    }
    isVerNavSwitching = true;
    var deltaIndex = newPartIndex - selectedPartIndex;
    var changeTop = "-="+deltaIndex*getPartHeight()+"px";
    $("div.part").animate({top:changeTop},partSwitchTime,function(){
        onAfterSwitchVerNav(newPartIndex);
    });
}

function getPartHeight(){
    var h = innerHeight;
    var partSection = $(".part-section");
    if(partSection.length > 0){
        h = partSection.height();
    }
    return h;
}

function onAfterSwitchVerNav(newPartIndex){
    selectedPartIndex = newPartIndex;
    isVerNavSwitching = false;
    setVerTop(selectedPartIndex);
    setHorNavContent(selectedPartIndex);
}

/////////////////////////////////////horizontal setting/////////////////////////////////////////////////////////
var horNav = null;
var horSwitchCycle = 4000;
var horSwitchTime = 800;
var horTimeoutId = -1;
var currentHorIndex = 0;
var isHorNavSwitching = false;

function initHorNav(){
    var str = "<div class='horizontal-nav nav'><ul></ul></div>";
    var jHorNav = $(str);
    horNav = jHorNav[0];
    jHorNav.appendTo(document.body);

    jHorNav.on("click","ul li",function(){
        $("ul li",jHorNav).removeClass("selected");
        $(this).addClass("selected");
        var index = $(this).parent().children().index(this);
        clearTimeout(horTimeoutId);
        horTimeoutId = -1;
        animateSwitchHorNav(index);
    });

    setHorNavContent(selectedPartIndex);
}

function setHorNavContent(idx){
    currentHorIndex = 0;
    clearTimeout(horTimeoutId);
    horTimeoutId = -1;
    $("ul",horNav).empty();
    var part = $(".part:nth-child("+(idx+1)+")")[0];
    var items = $(".part-item",part);
    if(items.length > 1){
        var strLi = "<li><a><span class='dot'></span></a></li>";
        for(var i=0;i<items.length;i++){
            $(strLi).appendTo($("ul",horNav));
        }
    }
    var jLis = $("ul li",horNav);
    jLis.removeClass("selected");
    $(jLis[currentHorIndex]).addClass("selected");
    var newHorIndex = (currentHorIndex+1)%items.length;
    setHorLeft(currentHorIndex);
    horTimeoutId = setTimeout(function(){
        animateSwitchHorNav(newHorIndex);
    },horSwitchCycle);
}

function setHorLeft(horIndex){
    var part = $(".part:nth-child("+(selectedPartIndex+1)+")")[0];
    var w =$(".part-section")[0].clientWidth;
    $(".part-item",part).each(function(i){
        $(this).css("left",w*(i-horIndex)+"px");
    });
}


function animateSwitchHorNav(newHorIndex){
    if(isHorNavSwitching){
        return;
    }
    setHorLeft(currentHorIndex);
    if(newHorIndex < 0){
        return;
    }
    var part = $(".part:nth-child("+(selectedPartIndex+1)+")")[0];
    var items = $(".part-item",part);
    if(items.length < 2){
        return;
    }
    if(newHorIndex >= items.length){
        return;
    }
    if(currentHorIndex == newHorIndex){
        return;
    }
    var jLis = $("ul li",horNav);
    jLis.removeClass("selected");
    $(jLis[newHorIndex]).addClass("selected");
    isHorNavSwitching = true;
    var deltaIndex = newHorIndex - currentHorIndex;
    var w =$(".part-section")[0].clientWidth;
    var changeLeft = "-="+deltaIndex*w+"px";
    items.animate({left:changeLeft},horSwitchTime,function(){
        onAfterSwitchHorNav(newHorIndex);
    });
}

function onAfterSwitchHorNav(newHorIndex){
    currentHorIndex = newHorIndex;
    isHorNavSwitching = false;
    clearTimeout(horTimeoutId);
    horTimeoutId = -1;
    setHorLeft(currentHorIndex);
    horTimeoutId = setTimeout(function(){
        var part = $(".part:nth-child("+(selectedPartIndex+1)+")")[0];
        var items = $(".part-item",part);
        var nextHorIndex = (currentHorIndex+1)%items.length;
        animateSwitchHorNav(nextHorIndex);
    },horSwitchCycle);
}