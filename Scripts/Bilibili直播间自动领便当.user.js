// ==UserScript==
// @name         Bilibili直播间自动领便当
// @namespace    mscststs
// @version      1.63
// @description  bilibili直播间自动领低保，妈妈再也不用担心我忘记领瓜子啦
// @author       mscststs
// @include        /^https?:\/\/live\.bilibili\.com\/\d/
// @include        /^https?:\/\/api\.live\.bilibili\.com\/freeSilver\/getCaptcha.*?/
// @grant        none
// @license            MIT License
// ==/UserScript==

(function() {
    'use strict';


 if((window.location.href+"").indexOf("getCaptcha")>10){


     /****************************************/
     /*--------------验证码回调-------------------------*/
      window.onload =ls();
     function ls(){
         function get_word(a){
             if(a.total<=50) return "-";
             if(a.total>120&&a.total<135) return "+";
             if(a.total>155&&a.total<162) return 1;
             if(a.total>189&&a.total<195) return 7;
             if(a.total>228&&a.total<237) return 4;
             if(a.total>250&&a.total<260) return 2;
             if(a.total>286&&a.total<296) return 3;
             if(a.total>303&&a.total<313) return 5;
             if(a.total>335&&a.total<342) return 8;
             if(a.total>343&&a.total<350){
                 if(a.fi>24&&a.la>24) return 0;
                 if(a.fi<24&&a.la>24) return 9;
                 if(a.fi>24&&a.la<24) return 6;
             }
         }


        var canvas = document.createElement("canvas");
        document.querySelector("body").appendChild(canvas);
        var ctx = document.querySelector("canvas").getContext("2d");
         var img =  document.querySelector("img");
        ctx.drawImage(img,0,0,120,40,0,0,120,40);
         var pixels = ctx.getImageData(0,0,120,40).data;
         //console.log(pixels);
            var pix = []; //定义一维数组
            var j = 0;
            var i=0;
            var n=0;
            for(i=1;i<=40;i++)
            {
                pix[i] = []; //将每一个子元素又定义为数组
                for(n=1;n<=120;n++)
                {
                    let c = 1;
                    if(pixels[j]-(-pixels[j + 1])-(- pixels[j + 2]) >200){
                        c=0;
                    }
                    j = j+4;
                    pix[i][n]=c; //此时pix[i][n]可以看作是一个二级数组
                }
            }
            //我们得到了二值化后的像素矩阵pix[40][120]
           //  console.log(pix);
            var lie = [];
            lie[0]=0;
            for(i=1;i<=120;i++){
                lie[i] = 0;
                for(n=1;n<=40;n++){
                    lie[i] = lie[i]+pix[n][i];
                }
            }
            var ta = [];
            n=0;
            for(i=1;i<=120;i++){
                if(lie[i]>0&&lie[i-1]===0){
                    n++;
                    ta[n] ={};
                    ta[n].fi = lie[i];
                    ta[n].total = 0;
                }
                if(lie[i]>0){
                    ta[n].total = ta[n].total+lie[i];
                }
                if(lie[i-1]>0&&lie[i]===0){
                    ta[n].la = lie[i-1];
                }
            }
            console.log(get_word(ta[1])+" "+get_word(ta[2])+" "+get_word(ta[3])+" "+get_word(ta[4]));
            var val_a = 0;
            var val_b = 0;
            var result = 0;
            val_a = get_word(ta[1])*10-(-get_word(ta[2]));
            val_b = get_word(ta[4]);
            if(get_word(ta[3])=="+"){
                result = val_a-(-val_b);
            }else{
                result = val_a-val_b;
            }

            console.log(result);
            document.domain="bilibili.com";
             try{
                 if(window.parent.valid&&typeof(window.parent.valid)=="function"){
                     window.parent.valid(result);
                 }else{
                     console.log("回调失败，请反馈");
                 }
             }catch(e){
             }
    }
    }else{



        /**********************************************/
        /*---------------直播间----------------------------*/


     /***********新直播间************/



     (function($) {
    $.fn.dragDiv = function(options) {
        return this.each(function() {
            var _moveDiv = $(this);//需要拖动的Div
            var _moveArea = options ? $(options) : $(document);//限定拖动区域，默认为整个文档内
            var isDown = false;//mousedown标记
            //ie的事件监听，拖拽div时禁止选中内容，firefox与chrome已在css中设置过-moz-user-select: none; -webkit-user-select: none;
            if(document.attachEvent){
                _moveDiv[0].attachEvent('onselectstart', function() {
                    return false;
                });
            }
            _moveDiv.mousedown(function(event) {
                var e = event || window.event;
                //拖动时鼠标样式
                _moveDiv.css("cursor", "move");
                //获得鼠标指针离DIV元素左边界的距离
                var x = e.pageX - _moveDiv.offset().left;
                //获得鼠标指针离DIV元素上边界的距离
                var y = e.pageY - _moveDiv.offset().top;
                _moveArea.on('mousemove', function(event) {
                    var ev = event || window.event;
                    //获得X轴方向移动的值
                    var abs_x = ev.pageX - x;
                    //获得Y轴方向移动的值
                    var abs_y = ev.pageY - y;
                    //div动态位置赋值
                    _moveDiv.css({'left': abs_x, 'top': abs_y});

                    window.localStorage["helper_msg_left"] = abs_x+"px";
                    window.localStorage["helper_msg_top"] = abs_y+"px";

                });
            });
            _moveDiv.mouseup(function() {
                _moveDiv.css('cursor', 'default');
                //解绑拖动事件
                _moveArea.off('mousemove');

            });

        });
    };
})(jQuery);


    window.clo="";//计时器
    $().ready(function(){

        /****************************************************************/
        /*----------------------小电视-------------------------------------*/

        function helper_gift_count(gift_name,gift_number){
            if(window.helper_gift){

            }else{
                window.helper_gift = [];
            }
            if(window.helper_gift[gift_name]){

            }else{
                window.helper_gift[gift_name] = 0;
            }
            window.helper_gift[gift_name] = window.helper_gift[gift_name]-(-gift_number);
        }

        function Listener_smalltv(){
            msg("自动领低保已启动");

            $("body").on("dblclick","#helper_probar",function(){
                if(typeof(window.helper_gift)=="undefined"){
                    msg("还没有低保呀 (｡･ω･｡)","info",6000);
                }else{
                    var text = "已领取：<br>";
                    for(var name in window.helper_gift){
                        text+=name+" X "+window.helper_gift[name]+"<br>";
                    }
                    msg(text,"info",6000);

                }


            });
            $(document).on("DOMNodeInserted",".small-tv",function(){
                var text = $(this).find("div a").text();
                var m = text.match(/([^【]+)(?=】)/g);
                if(window.localStorage["id"]!=window.helper_id ){
                    close();
                    getSmallTV_close();
                    msg("在其他房间打开了","caution");
                    return;
                }//判断是否在其他房间打开了
                var delay = (parseInt(Math.random()*20)+1)*1000;//随机20秒以内延迟
                setTimeout(function(){getSmallTV(m[1]);},delay);



            });
            $(document).on("DOMNodeInserted",".system-msg.news",function(){
                var text = $(this).find("div a").text();
                var m = parseInt(text.slice(text.indexOf("直播间")+3,100));
                if(window.localStorage["id"]!=window.helper_id ){
                    close();
                    getSmallTV_close();
                    msg("在其他房间打开了","caution");
                    return;
                }//判断是否在其他房间打开了
                if(m>=0){
                    var delay = (parseInt(Math.random()*10)+1)*1000;//随机10秒以内延迟
                     setTimeout(function(){getlottery(m);},delay);//10秒延迟
                }
                else{

                }


            });
        }
        function getSmallTV(room){
            getSmallTV_init(room);
        }
        function getlottery(room){
            if(window.localStorage["helper_close_hdcj"]){
				return;
			}
			getlottery_init(room);
        }
        function getSmallTV_init(roomid){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/room/v1/Room/room_init",
                    data: {
                        id:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            msg("正在帮你抢小电视啦~");
                            var room_id = data.data.room_id;
                            var short_id = data.data.short_id;
                            if(short_id==0){
                                short_id = room_id;
                            }
                            getSmallTV_check(room_id,short_id);
                        }else{
                            msg("在获取房间信息的时候出错！","caution",5000);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getSmallTV_check(roomid,short_id){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/gift/v2/smalltv/check",
                    data: {
                        roomid:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        if(data.code==0){
                            var i=0;
                            for(i=0;i<data.data.length;i++){
                                var raffleId = data.data[i].raffleId;
                                if(data.data[i].status==1)
                                getSmallTV_join(roomid,raffleId,short_id);
                            }
                             if(i==0){
                                msg("在查找小电视的时候失败，是不是网速太慢了？","caution",5000);
                            }
                        }else{
                            msg("在查找小电视的时候出错","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getSmallTV_join(roomid,raffleId,short_id){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/gift/v2/smalltv/join",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var restime = data.data.time-(-60);//额外等一分钟
                            msg("成功参加了直播间【"+short_id+"】的小电视抽奖，还有 "+restime+" 秒开奖","success",5000);
                            restime*=1000;
                            setTimeout(function(){
                                getSmallTV_notice(roomid,raffleId,short_id);
                            },restime);
                        }else{
                            if(data.code!=-400)
                            msg("参加小电视抽奖失败了 (´･_･`)","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {

                    },
                    error: function () {
                    }
                });
        }

        function getSmallTV_notice(roomid,raffleId,short_id,steps){
            steps=steps||0;
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/gift/v2/smalltv/notice",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var gift_name = data.data.gift_name;
                            var gift_num = data.data.gift_num;
                            var gift_from = data.data.gift_from;
                            if(gift_num){
                                helper_gift_count(gift_name,gift_num);
                                msg("你从直播间【"+short_id+"】抽到了【"+gift_from+"】赠送的礼物： "+gift_name+" X "+gift_num+" !","success",5000);
                            }
                        }else{
                            if(steps<=3){
                                setTimeout(function(){
                                    getSmallTV_notice(roomid,raffleId,short_id,steps+1);
                                },60000);
                            }else{
                                msg("获取中奖信息时出错！","caution",5000);
                                console.log(data);
                            }
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }


        /********************秋收起义******************************/
        /*原本是给镰刀活动准备的，没想到每个活动竟然都是同一个API*/
        function getlottery_init(roomid){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/room/v1/Room/room_init",
                    data: {
                        id:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            msg("正在帮你PY交易啦~");
                            var room_id = data.data.room_id;
                            var short_id = data.data.short_id;
                            if(short_id==0){
                                short_id = room_id;
                            }
                            getlottery_check(room_id,short_id);
                        }else{
                            msg("在获取房间信息的时候出错！","caution",5000);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getlottery_check(roomid,short_id){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/check",
                    data: {
                        roomid:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        if(data.code==0){
                            var i=0;
                            for(i=0;i<data.data.length;i++){
                                var raffleId = data.data[i].raffleId;
                                if(data.data[i].status==1)
                                getlottery_join(roomid,raffleId,short_id);
                            }
                            if(i==0){
                                msg("在查找活动的时候失败，是不是网速太慢了？","caution",5000);
                            }
                        }else{
                            msg("在查找活动的时候出错","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getlottery_join(roomid,raffleId,short_id){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/join",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var restime = data.data.time-(-60);//额外等一分钟
                            msg("成功参加了直播间【"+short_id+"】的PY抽奖，还有 "+restime+" 秒开奖","success",5000);
                            restime*=1000;
                            setTimeout(function(){
                                getlottery_notice(roomid,raffleId,short_id);
                            },restime);
                        }else{
                            if(data.code!=-400)
                            msg("参加PY抽奖失败了 (´･_･`)","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {

                    },
                    error: function () {
                    }
                });
        }
        function getlottery_notice(roomid,raffleId,short_id,steps){
            steps=steps||0;
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/notice",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var gift_name = data.data.gift_name;
                            var gift_num = data.data.gift_num;
                            var gift_from = data.data.gift_from;
                            if(gift_num){
                                helper_gift_count(gift_name,gift_num);
                                msg("你从直播间【"+short_id+"】抽到了【"+gift_from+"】赠送的礼物： "+gift_name+" X "+gift_num+" !","success",5000);
                            }
                        }else{
                            if(steps<=3){
                                setTimeout(function(){
                                    getlottery_notice(roomid,raffleId,short_id,steps+1);
                                },60000);
                            }else{
                                msg("获取中奖信息时出错！","caution",5000);
                                console.log(data);
                            }
                            
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        Listener_smalltv();








        /****************************************************************/
        //var pr = $("#link-navbar-vm");//导航栏
        var pr = $("#gift-control-vm");//礼物栏
        pr.append("<div id='helper_probar'><span id='helper_progress'></span></div>");
         $("body").append("<style>.helper_msg{pointer-events: auto !important;}#helper_probar{position:absolute;top:0px;width:100%;height:3px;border-radius:1.5px;background-color:#666;z-index:0}#helper_progress{position:absolute;height:3px;width:0;border-radius:3px;background-color:#fff;transition:all 1s linear}#helper_canvas,#helper_img{display:block}.blue-shadow{box-shadow:0 0 10px 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8}.green-shadow{box-shadow:0 0 10px 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A}.pink-shadow{box-shadow:0 0 10px 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275}.helper_hide{visibility:hidden}.helper_none{display:none}</style>");
        var progress = $("span#helper_progress");



        init();
        function getSmallTV_close(){
            $(document).off("DOMNodeInserted");
            $("#helper_probar").css("background-color","rgb(227, 98, 9)");
        }


        function close(){
            clearInterval(window.clo);
            $("#helper_progress").remove();

        }


        function init(){

            if(window.localStorage["helper_help"]!="1.63"){
                $("body").append('<style>#helper_help{width:100%;height:100%;top:0;left:0;position:fixed;z-index:999999;background-color:rgba(0,0,0,.4);overflow:hidden;word-break:break-all}.helper_lisences{background-color:#555;box-shadow:0 0 15px#111;margin-left:20%;margin-top:10px;width:60%;font-size:18px;color:#fff;border-radius:5px;border:1px solid#fff;padding:5px 10px}</style><div id="helper_help"><div class="helper_lisences"><p><em>当你看到该提示，说明你的脚本是第一次启动或在最近发生了更新，请阅读以下说明(5秒后可点击空白处关闭)</em><a href="https://greasyfork.org/zh-CN/scripts/31994"style="color:#7f7">点此查看详细介绍</a></p><h3 style="color:#f77">重要公告：</h3><p style="color:#f77">在12月15日，B站官方对活动道具抽奖进行了一些限制，由于一些原因，暂时不能对脚本进行升级，我们提供了以下两个解决方案</p><ol><li>关闭活动抽奖点此-><span id="helper_close_hdcj"style="color:#7ff;cursor:pointer">关闭活动抽奖</span></li><li>前往短号房间，4位以内短号房间可以继续使用该脚本进入活动道具抽奖</li></ol><p style="color:#f77">如果你想重新选择，请清除浏览器缓存，该公告会重新出现。</p><h4>使用须知：</h4><ul><li>请勿宣传，闷声发财</li><li>作者有权决定何时何种情况对脚本进行处理，包括但不限于：<em>官方与作者进行了交涉</em>等</li></ul><h4>功能简介：</h4><ul><li>略，请去脚本描述页查看，关于如何查看抽奖统计和移动通知的位置</li></ul><h4>注意事项：（重要）</h4><ul><li>兼容：FireFox/Chrome+Tampermonkey。其他兼容性问题概不负责</li><li>已知与助手不兼容</li><li>其他：略，去脚本描述页查看</li><li><a href="https://greasyfork.org/zh-CN/scripts/31994"style="color:#7f7">如果你想支持我，请点击此处捐赠（支付鸨）</a></li></ul><h4>鸣谢：</h4><ul><li>Greasy Fork网站提供的脚本托管服务</li></ul></div></div>');
                $("#helper_close_hdcj").click(function(){
					window.localStorage["helper_close_hdcj"] = 1;
				});

				setTimeout(function(){
                    window.localStorage["helper_help"] = "1.63";
                    $("#helper_help").css("background-color","none");
                    $("#helper_help").click(function(){
                        $("#helper_help").fadeOut(function(){$(this).remove();});
                    });
                },5000);
            }

			/*
				----------------------公告逻辑--------------------
			*/


            $(document).on("contextmenu","#helper_probar", function(){
                return false;
            });
            $(document).on("click",".helper_msg",function(){
                $(".helper_msg").fadeOut().remove();
            });


            $(document).on("mousedown","#helper_probar",function(e) {
                //右键为3
                if (3 == e.which) {
                    var text = "拖动这个来移动通知的位置";
                    var level = "success";
                    window.localStorage["helper_msg_left"] = "400px";
                    window.localStorage["helper_msg_top"] = "500px";
                    var left = window.localStorage["helper_msg_left"];
                    var top = window.localStorage["helper_msg_top"];
                    $("body").append('<div class="link-toast helper_msg '+level+'" style="left: '+left+'; top: '+top+';"><span class="toast-text">'+text+'</span></div>');
                    $(".helper_msg").slideDown(function(){
                        $(this).dragDiv();
                    });
                }
            });


            document.domain="bilibili.com";
            window.helper_errcount=0;
            window.ontask=0;
            window.helper_id = getMiliSeconds();//脚本序列号
            window.localStorage["id"] =window.helper_id ;
            setTimeout(function(){
                 if(isExist()){
                    msg("自动领瓜子已启动");
                    $("#link-navbar-vm > nav  div.checkin-btn.t-center.pointer").click();//签到
                    start();

                }else{
                    msg("没有瓜子哦","caution");
                }
            },10000);//10秒
        }
        function start(){
            $("#helper_progress").click(function(){
            msg("第"+window.round+"轮，第"+window.rank+"个宝箱","caution",5000);
            });
           window.round = parseInt($("#gift-control-vm  div.round-count.t-center > span").text().slice(2,3));
            window.rank = $("div.in-countdown span").text().slice(0,1)/3;
            switch_color(window.rank);
            window.localStorage["helper_time"]=getSeconds();
            $("div.treasure-box").fadeOut();



            window.clo = setInterval(function(){
                var per =  (getSeconds()-window.localStorage["helper_time"])/(window.rank*180)*100;
                if(per>100){
                    per = 100;
                }
                setProgress(per+"%");
                if(window.localStorage["id"]!=window.helper_id ){
                    close();
                    getSmallTV_close();
                    msg("在其他房间打开了","caution");
                }//判断是否在其他房间打开了
                if((getSeconds()-window.localStorage["helper_time"])/(window.rank*180)>1){
                    //可以领取瓜子时
                    if(window.ontask==0){//判断是否已经在执行领取过程
                        ontask=1;
                        console.log("进入验证码识别回调过程");
                        $("body").append("<iframe class='helper_none' src='//api.live.bilibili.com/freeSilver/getCaptcha?ts="+getMiliSeconds()+"'></iframe>");
                    }

                   }

            },1000);
        }


        function turn(){
            window.localStorage["helper_time"]=getSeconds();
            if(window.rank==3&&window.round>=parseInt($("#gift-control-vm  div.round-count.t-center > span").text().slice(6,7))){
                close();
                msg("瓜子领取完毕啦");
            }else
            if(window.rank==3){
                window.round++;
                window.rank=1;
            }else{
            window.rank++;
            }
            switch_color(window.rank);
        }

        function setProgress(percent){
            var progress = $("span#helper_progress");
            progress.css("width",percent);
            //console.log(percent);
        }
        function switch_color(rank){
             var progress = $("span#helper_progress");
             $("span#helper_progress").removeClass();
            if(rank==1){
             $("span#helper_progress").addClass("green-shadow");//第一个箱子
            }else
            if(rank==2){
              $("span#helper_progress").addClass("blue-shadow");//第二个箱子
            }else
            if(rank==3){
              $("span#helper_progress").addClass("pink-shadow");//第三个箱子
            }
        }

        function isExist(){
            var time = $("#gift-control-vm  div.count-down").text()||"00:00";
            if(time!="00:00"){
                return true;
            }
            return false;
        }
        function getSeconds(){//取得秒数时间戳
            return Date.parse(new Date())/1000;
        }

        function getMiliSeconds(){//取得毫秒数时间戳
            return (new Date()).valueOf();
        }
        function msg(text,level,time){
            text=text||"这是一个提示";
            level=level||"success";
            time=time||2000;
            if(level!="success"){
                console.log(text);
            }
            var id = (new Date()).valueOf();
            if(window.localStorage["helper_msg_left"]){
            }else{
                window.localStorage["helper_msg_left"] = "400px";
            }
            if(window.localStorage["helper_msg_top"]){
            }else{
                window.localStorage["helper_msg_top"] = "500px";
            }

            var left = window.localStorage["helper_msg_left"];
            var top = window.localStorage["helper_msg_top"];

            $("body").append('<div class="link-toast '+level+'"data-id="'+id+'" style="left: '+left+'; top: '+top+';"><span class="toast-text">'+text+'</span></div>');
            $("div.link-toast[data-id='"+id+"']").slideDown("normal",function(){setTimeout(function(){$("div.link-toast[data-id='"+id+"']").fadeOut("normal",function(){$("div.link-toast[data-id='"+id+"']").remove();});},time);});

        }







        function refreshSilver(val){
            var aval = '<i data-v-06a3a440="" class="svg-icon silver-seed"></i>'+val;
            $("#gift-control-vm > div > div.vertical-middle.dp-table.section.right-part > div > div.supporting-info > div > div:nth-child(2)").html(aval);
            $("#gold-store-vm > div > div.dp-table-cell.v-middle > div > div.content > div > footer > span:nth-child(3)").html(aval);
            $("#link-navbar-vm > nav > div > div.right-part.h-100.f-right.f-clear > div.user-panel.dp-table.h-100.p-relative.v-top.f-clear.f-left > div > div.user-panel-ctnr.p-relative.dp-i-block.v-middle > div > div > div > div.content-ctnr.border-box.p-relative.over-hidden > div.section-block.info-items.dp-none.a-move-in-left > div:nth-child(1) > div > div:nth-child(2) > a > div > span.right-label.f-right.v-middle > span").text(val);

        }
        function ticket(data){//对ajax数据进行判断
            $("iframe.helper_none").remove();
            if(data.code!="0"){
                console.log(data);
                if(window.helper_errcount++==3){
                    close();
                    msg("出错过多，已关闭脚本，详情见控制台Log");
                }
            }else{
                console.log(data);
                msg("成功领取"+data.data.awardSilver+"个瓜子，目前瓜子总数："+data.data.silver,"success",3000);
                currentTask();
                refreshSilver(data.data.silver);
                setTimeout(turn(),2000);
            }
            ontask=0;
        }
        function currentTask(){
            console.log("获取新一轮宝箱");
            $.ajax({
                    //提交数据的类型 POST GET
                    type: "get",
                    //提交的网址
                    url: "//api.live.bilibili.com/FreeSilver/getCurrentTask",
                    //提交的数据
                    data: {},
                    //返回数据的格式
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    //在请求之前调用的函数
                    //beforeSend:function(){$("#msg").html("logining");},
                    //成功返回之后调用的函数
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        console.log(data);
                    },
                    //调用执行后调用的函数
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                        //请求出错处理
                        msg("自动领瓜子出错啦！！","caution");
                    }
                });
        }





        window.valid = function(valid){
            console.log("尝试回调成功，可以获取"+valid);
            var ntime = getSeconds();
            $.ajax({
                    //提交数据的类型 POST GET
                    type: "get",
                    //提交的网址
                    url: "//api.live.bilibili.com/FreeSilver/getAward",
                    //提交的数据
                    data: {
                        time_start:ntime-window.rank*180,
                        end_time:ntime,
                        captcha:valid
                    },
                    //返回数据的格式
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    //在请求之前调用的函数
                    //beforeSend:function(){$("#msg").html("logining");},
                    //成功返回之后调用的函数
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        ticket(data);
                    },
                    //调用执行后调用的函数
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                        //请求出错处理
                        msg("自动领瓜子出错啦！！","caution");
                    }
                });
        };

    });

/*-----------------直播间-------------------------------------------*/
/***************************************************************/

    }

})();