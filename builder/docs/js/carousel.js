$.fn.carousel = {
    defaults:{
        switchCircle:4000,
        switchTime:500,
        currentIndex:0,
        timeoutId:-1,
        isSwitching:false
    },

    create:function(dom,options){
        var args = $.extend({},this.defaults,options);
        var items = $(".carousel-item",dom);
        var horNav = null;

        function initNav(){
            if(items.length === 0){
                return;
            }
            var str = "<div class='horizontal-nav nav'><ul></ul></div>";
            var jHorNav = $(str);
            jHorNav.appendTo(dom);
            jHorNav.css({position:"absolute",width:"100%",bottom:"20px"});
            horNav = jHorNav[0];

            var jUl = $("ul",jHorNav);
            jUl.on('click','li',function(){
                $('ul li',jUl).removeClass('selected');
                $(this).addClass('selected');
                var index = $(this).parent().children().index(this);
                clearTimeout(args.timeoutId);
                args.timeoutId = -1;
                animateSwitch(index);
            });

            args.currentIndex = 0;
            clearTimeout(args.timeoutId);
            items.each(function(){
                var strLi = "<li><a><span class='dot'></span></a></li>";
                $(strLi).appendTo(jUl);
            });
            var jLis = $("li",jUl);
            jLis.removeClass('selected');
            $(jLis[args.currentIndex]).addClass('selected');
            var newIndex = (args.currentIndex+1)%items.length;
            setLeft(args.currentIndex);
            args.timeoutId = setTimeout(function(){
                animateSwitch(newIndex);
            },args.switchCircle);
        }

        function setLeft(index){
            var w = $(dom).width();
            items.each(function(i){
                $(this).css("left",w*(i-index)+"px");
            });
        }

        function animateSwitch(newIndex){
            if(args.isSwitching){
                return;
            }
            setLeft(args.currentIndex);
            if(newIndex < 0){
                return;
            }
            if(items.length < 2){
                return;
            }
            if(newIndex >= items.length){
                return;
            }
            if(args.currentIndex === newIndex){
                return;
            }
            var jLis = $("li",horNav);
            jLis.removeClass("selected");
            $(jLis[newIndex]).addClass("selected");
            args.isSwitching = true;
            var deltaIndex = newIndex - args.currentIndex;
            var w = $(dom).width();
            var changeLeft = "-="+deltaIndex*w+"px";
            items.animate({left:changeLeft},args.switchTime,function(){
                onAfterSwitch(newIndex);
            });
        }

        function onAfterSwitch(newIndex){
            args.currentIndex = newIndex;
            args.isSwitching = false;
            clearTimeout(args.timeoutId);
            args.timeoutId = -1;
            setLeft(args.currentIndex);
            args.timeoutId = setTimeout(function(){
                var nextIndex = (args.currentIndex+1)%items.length;
                animateSwitch(nextIndex);
            },args.switchCircle);
        }

        function onResize(){
            var itemWidth = items.width();
            var radio = parseFloat(items.attr('data-radio'));
            var itemHeight = itemWidth * radio;
            items.css("height",itemHeight+"px");
            // var itemHeight = items.height();
            if(horNav){
                $(horNav).css('top',(itemHeight+20)+"px");
            }
            var header = $('iframe.header-iframe');
            if(header.length > 0){
                var headerHeight = header.height();
                var top = (window.innerHeight - headerHeight - itemHeight)/2+"px";
                $(dom).css("top",top);
            }
        }


        var cssPosition = $(dom).css('position');
        if(cssPosition !== 'absolute' && cssPosition !== 'relative'){
            $(dom).css({position:"relative",overflow:"hidden"});
        }
        $(dom).css({overflow:"hidden"});
        items.css({position:"absolute",left:0,top:0,width:"100%"});
        // items.css({position:"absolute",left:0,top:0,width:"100%",height:"100%"});
        initNav();
        $(window).resize(onResize);
        onResize();
    }
};