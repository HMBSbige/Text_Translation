// ==UserScript==
// @name         Bilibili直播间挂机助手
// @namespace    SeaLoong
// @version      1.3.1
// @description  Bilibili直播间自动签到，领瓜子，参加抽奖，完成任务，送礼等
// @author       SeaLoong
// @include      /https?:\/\/live\.bilibili\.com\/\d+/
// @grant        none
// @run-at       document-end
// @license      MIT License
// ==/UserScript==

(function() {
    'use strict';

    // <-!!!请注意，修改此处设置将不会再生效，请点击页面右下角的"挂机助手设置"打开设置界面进行设置!!!->
    var CONFIG = { // <-!!!请注意，修改此处设置将不会再生效，请点击页面右下角的"挂机助手设置"打开设置界面进行设置!!!->
        USE_SIGN: true, // 自动签到: true:启用, false:不启用
        USE_AWARD: true, // 自动领取瓜子: true:启用, false:不启用
        USE_LOTTERY: true, // 自动参加抽奖: true:启用, false:不启用
        USE_TASK: true, // 自动完成任务: true:启用, false:不启用
        USE_GIFT: true, // 自动送礼物: true:启用, false:不启用
        GIFT_CONFIG: { // 若启用自动送礼物，则需要设置以下项
            SHORT_ROOMID: 0, // 送礼物的直播间ID(即地址中live.bilibili.com/后面的数字), 设置为0则表示自动检查当前主播勋章
            CHANGE_MEDAL: true, // 当有当前主播勋章，且当前佩戴的勋章不是当前主播勋章时自动切换为当前主播勋章: true:自动切换，false:不切换
            SEND_GIFT: [1], // 设置默认送的礼物类型编号(见下方列表)，多个请用英文逗号(,)隔开，为空则表示允许送出ALLOW_GIFT允许的礼物
            ALLOW_GIFT: [1, 4, 6, 109, 110], // 设置允许送的礼物类型编号(见下方列表)(!!任何未在此列表的礼物一定不会被送出!!)，多个请用英文逗号(,)隔开，为空则表示允许送出所有类型的礼物
            SEND_TODAY: true // 送出包裹中今天到期的礼物(!会送出SEND_GIFT之外的礼物!若今日亲密度已满则不送): true:启用，false:不启用
        },
        SHOW_TOAST: true // 显示浮动提示: true:显示，false:不显示
    };
    // <-!!!请注意，修改此处设置将不会再生效，请点击页面右下角的"挂机助手设置"打开设置界面进行设置!!!->

    /* 礼物编号及对应礼物、亲密度对照表
    (有些数据暂时不清楚，如有知道的可以告诉我，目前采用的亲密度计算方法是:礼物亲密度=向下取整(礼物价值瓜子数/100))
    1:辣条：亲密度+1
    3:B坷垃：亲密度+99
    4:喵娘：亲密度+52
    6:亿元：亲密度+10
    7:666：亲密度+?
    8:233：亲密度+?
    25:小电视：亲密度+12450?
    39:节奏风暴：亲密度+1000?
    105:火力票：亲密度+20
    106:哔哩星：亲密度+20
    109:红灯笼：亲密度+20
    110:小爆竹：亲密度+20
    */

    /* 此行以下内容请勿修改，当然你要改那我也没办法 */

    var CONFIG_DEFAULT = {
        USE_SIGN: true,
        USE_AWARD: true,
        USE_LOTTERY: true,
        USE_TASK: true,
        USE_GIFT: true,
        GIFT_CONFIG: {
            SHORT_ROOMID: 0,
            CHANGE_MEDAL: true,
            SEND_GIFT: [1],
            ALLOW_GIFT: [1, 4, 6, 109, 110],
            SEND_TODAY: true
        },
        SHOW_TOAST: true
    };
    var NAME = 'Bilibili-LiveRoom-HangHelper';
    var TaskAward_Running = false;
    var Toast = {
        element: null,
        list: [],
        count: 0
    };
    var DOM = {
        treasure: {
            div: null,
            image: null,
            canvas: null,
            div_tip: null,
            div_timer: null
        },
        storm: {
            div: null,
            image: null,
            canvas: null
        },
        config: {
            div_button: null,
            div_button_p: null,
            div: null,
            div_showed: false
        }
    };
    var interval_treasure_timer;
    var room_id_list = [];
    var lottery_list_last = [],
        lottery_check_time = 20;
    var gift_list;
    var timediff = 0;
    var Info = {
        short_id: null,
        uid: null,
        ruid: null,
        roomid: null,
        rnd: null,
        area_id: null, // area_v2_id
        area_parent_id: null,
        old_area_id: null, // areaId
        csrf_token: function() {
            return getCookie('bili_jct');
        },
        today_feed: null,
        day_limit: null,
        silver: null,
        gold: null,
        mobile_verified: null,
        medal_list: null,
        medal_target_id: null,
        task_list: null,
        bag_list: null
    };
    var DEBUG = function(sign, data) {
        // var d = new Date();
        // d = '[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ']';
        // console.debug(d, sign + ':', data);
    };
    var API = {
        last_ajax: 0,
        cnt_frequently_ajax: 0,
        ajax: function(settings) {
            if (Date.now() - API.last_ajax < 20) {
                API.cnt_frequently_ajax++;
            } else {
                API.cnt_frequently_ajax = 0;
            }
            API.last_ajax = Date.now();
            if (API.cnt_frequently_ajax > 5) throw new Error('调用Bilibili API太快，可能出现了bug');
            // DEBUG('API.ajax: settings', settings);
            if (settings.xhrFields) {
                $.extend(settings.xhrFields, {
                    withCredentials: true
                });
            } else {
                settings.xhrFields = {
                    withCredentials: true
                };
            }
            $.extend(settings, {
                url: (settings.url.substr(0, 2) == '//' ? '' : '//api.live.bilibili.com/') + settings.url,
                type: settings.type || 'GET',
                crossDomain: true,
                dataType: settings.dataType || 'json'
            });
            return $.ajax(settings);
        },
        ajaxGetCaptchaKey: function() {
            return API.ajax({
                url: '//www.bilibili.com/plus/widget/ajaxGetCaptchaKey.php?js'
            });
        },
        msg: function(roomid, csrf_token) {
            return API.ajax({
                type: 'POST',
                url: 'ajax/msg',
                data: {
                    roomid: roomid,
                    csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                }
            });
        },
        ajaxCapsule: function(id, ts, platform, player_type) {
            return API.ajax({
                url: 'api/ajaxCapsule'
            });
        },
        player: function(id, ts, platform, player_type) { //获取直播流相关信息
            return API.ajax({
                url: 'api/player',
                data: {
                    id: id,
                    ts: ts, // HEX
                    platform: platform || 'pc',
                    player_type: player_type || 'web'
                },
                dataType: 'text'
            });
        },
        create: function(width, height) { // 生成一个验证码
            return API.ajax({
                url: 'captcha/v1/Captcha/create',
                data: {
                    width: width,
                    height: height,
                    _: ts_ms()
                }
            });
        },
        topList: function(roomid, page, ruid) {
            return API.ajax({
                url: 'guard/topList',
                data: {
                    roomid: roomid,
                    page: page,
                    ruid: ruid
                }
            });
        },
        getSuser: function() {
            return API.ajax({
                url: 'msg/getSuser'
            });
        },
        refresh: function() {
            return API.ajax({
                url: 'index/refresh?area=all'
            });
        },
        get_ip_addr: function() {
            return API.ajax({
                url: 'ip_service/v1/ip_service/get_ip_addr'
            });
        },
        ajaxGetMyMedalList: function() {
            return API.ajax({
                url: '//live.bilibili.com/i/ajaxGetMyMedalList'
            });
        },
        getuserinfo: function() {
            return API.ajax({
                url: '//live.bilibili.com/user/getuserinfo'
            });
        },
        MyInfo: function() {
            return API.ajax({
                url: '//space.bilibili.com/ajax/member/MyInfo'
            });
        },
        activity: {
            mobileActivity: function() {
                return API.ajax({
                    url: 'activity/v1/Common/mobileActivity'
                });
            },
            roomInfo: function(roomid, ruid) {
                return API.ajax({
                    url: 'activity/v1/Common/roomInfo',
                    data: {
                        roomid: roomid,
                        ruid: ruid
                    }
                });
            },
            welcomeInfo: function(roomid) {
                return API.ajax({
                    url: 'activity/v1/Common/welcomeInfo?roomid=' + roomid
                });
            },
            master_invite_task: function() {
                return API.ajax({
                    url: 'activity/v1/invite/master_invite_task'
                });
            },
            check: function(roomid) {
                return API.ajax({
                    url: 'activity/v1/Raffle/check?roomid=' + roomid
                });
            },
            join: function(roomid, raffleId) {
                return API.ajax({
                    url: 'activity/v1/Raffle/join',
                    data: {
                        roomid: roomid,
                        raffleId: raffleId
                    }
                });
            },
            notice: function(roomid, raffleId) {
                return API.ajax({
                    url: 'activity/v1/Raffle/notice',
                    data: {
                        roomid: roomid,
                        raffleId: raffleId
                    }
                });
            },
            master_limit_tasks: function() {
                return API.ajax({
                    url: 'activity/v1/task/master_limit_tasks'
                });
            },
            receive_award: function(task_id, csrf_token) {
                return API.ajax({
                    type: 'POST',
                    url: 'activity/v1/task/receive_award',
                    data: {
                        task_id: task_id,
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            },
            user_limit_tasks: function() {
                return API.ajax({
                    url: 'activity/v1/task/user_limit_tasks'
                });
            }
        },
        feed: {
            getList: function(page, page_size) {
                return API.ajax({
                    url: 'feed/v1/feed/getList',
                    data: {
                        page: page,
                        page_size: page_size,
                        _: ts_ms()
                    }
                });
            },
            heartBeat: function(_cb) {
                return API.ajax({
                    url: 'feed/v1/feed/heartBeat',
                    data: {
                        _cb: _cb
                    }
                });
            },
            GetUserFc: function(follow) { // follow: 主播uid==ruid
                return API.ajax({
                    url: 'feed/v1/Feed/GetUserFc?follow=' + follow
                });
            },
            IsUserFollow: function(follow) { // follow: 主播uid==ruid
                return API.ajax({
                    url: 'feed/v1/Feed/IsUserFollow?follow=' + follow
                });
            },
        },
        feed_svr: {
            notice: function(csrf_token) {
                return API.ajax({
                    type: 'POST',
                    url: 'feed_svr/v1/feed_svr/notice',
                    data: {
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            },
            my: function(page_size, csrf_token, live_status, type, offset) {
                return API.ajax({
                    type: 'POST',
                    url: 'feed_svr/v1/feed_svr/my',
                    data: {
                        live_status: live_status || 0,
                        type: type || 0,
                        page_size: page_size,
                        offset: offset || 0,
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            }
        },
        FreeSilver: {
            getSurplus: function() {
                return API.ajax({
                    url: 'FreeSilver/getSurplus'
                });
            },
            getAward: function(time_start, end_time, captcha) {
                return API.ajax({
                    url: 'FreeSilver/getAward',
                    data: {
                        time_start: time_start,
                        end_time: end_time,
                        captcha: captcha
                    }
                });
            },
            getCurrentTask: function() {
                return API.ajax({
                    url: 'FreeSilver/getCurrentTask'
                });
            },
            getCaptcha: function(ts, callback) {
                getBlobDataURL("//api.live.bilibili.com/freeSilver/getCaptcha?ts=" + ts, callback);
            }
        },
        gift: {
            bag_list: function() {
                return API.ajax({
                    url: 'gift/v2/gift/bag_list'
                });
            },
            send: function(uid, gift_id, ruid, gift_num, coin_type, biz_id, rnd, csrf_token, platform, biz_code, storm_beat_id) {
                return API.ajax({
                    type: 'POST',
                    url: 'gift/v2/gift/send',
                    data: {
                        uid: uid,
                        gift_id: gift_id,
                        ruid: ruid,
                        gift_num: gift_num,
                        coin_type: coin_type || 'silver',
                        bag_id: 0,
                        platform: platform || 'pc',
                        biz_code: biz_code || 'live',
                        biz_id: biz_id, //roomid
                        rnd: rnd,
                        storm_beat_id: storm_beat_id || 0,
                        // metadata: metadata,
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            },
            bag_send: function(uid, gift_id, ruid, gift_num, bag_id, biz_id, rnd, csrf_token, platform, biz_code, storm_beat_id) {
                return API.ajax({
                    type: 'POST',
                    url: 'gift/v2/live/bag_send',
                    data: {
                        uid: uid,
                        gift_id: gift_id,
                        ruid: ruid,
                        gift_num: gift_num,
                        bag_id: bag_id,
                        platform: platform || 'pc',
                        biz_code: biz_code || 'live',
                        biz_id: biz_id, //roomid
                        rnd: rnd,
                        storm_beat_id: storm_beat_id || 0,
                        // metadata: metadata,
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            },
            heart_gift_receive: function(roomid, area_v2_id) {
                return API.ajax({
                    url: 'gift/v2/live/heart_gift_receive',
                    data: {
                        roomid: roomid,
                        area_v2_id: area_v2_id
                    }
                });
            },
            heart_gift_status: function(roomid, area_v2_id) {
                return API.ajax({
                    url: 'gift/v2/live/heart_gift_status',
                    data: {
                        roomid: roomid,
                        area_v2_id: area_v2_id
                    }
                });
            },
            receive_daily_bag: function() {
                return API.ajax({
                    url: 'gift/v2/live/receive_daily_bag'
                });
            },
            room_gift_list: function(roomid, area_v2_id) {
                return API.ajax({
                    url: 'gift/v2/live/room_gift_list',
                    data: {
                        roomid: roomid,
                        area_v2_id: area_v2_id
                    }
                });
            },
            smalltv: {
                check: function(roomid) {
                    return API.ajax({
                        url: 'gift/v2/smalltv/check',
                        data: {
                            roomid: roomid
                        }
                    });
                },
                join: function(roomid, raffleId) {
                    return API.ajax({
                        url: 'gift/v2/smalltv/join',
                        data: {
                            roomid: roomid,
                            raffleId: raffleId
                        }
                    });
                },
                notice: function(roomid, raffleId) {
                    return API.ajax({
                        url: 'gift/v2/smalltv/notice',
                        data: {
                            roomid: roomid,
                            raffleId: raffleId
                        }
                    });
                }
            }
        },
        giftBag: {
            getSendGift: function() {
                return API.ajax({
                    url: 'giftBag/getSendGift'
                });
            },
            sendDaily: function() {
                return API.ajax({
                    url: 'giftBag/sendDaily'
                });
            }
        },
        i: {
            ajaxGetAchieve: function(page, pageSize, type, status, category, keywords) {
                return API.ajax({
                    url: 'i/api/ajaxGetAchieve',
                    data: {
                        type: type || 'normal', // or'legend'
                        status: status || 0,
                        category: category || 'all',
                        keywords: keywords,
                        page: page,
                        pageSize: pageSize || 6
                    }
                });
            },
            ajaxCancelWear: function() {
                return API.ajax({
                    url: 'i/ajaxCancelWear'
                });
            },
            ajaxWearFansMedal: function(medal_id) {
                return API.ajax({
                    url: 'i/ajaxWearFansMedal?medal_id=' + medal_id
                });
            },
            following: function(page, pageSize) {
                return API.ajax({
                    url: 'i/api/following',
                    data: {
                        page: page,
                        pageSize: pageSize
                    }
                });
            },
            guard: function(page, pageSize) {
                return API.ajax({
                    url: 'i/api/guard',
                    data: {
                        page: page,
                        pageSize: pageSize
                    }
                });
            },
            liveinfo: function() {
                return API.ajax({
                    url: 'i/api/liveinfo'
                });
            },
            medal: function(page, pageSize) {
                return API.ajax({
                    url: 'i/api/medal',
                    data: {
                        page: page,
                        pageSize: pageSize
                    }
                });
            },
            operation: function(page) {
                return API.ajax({
                    url: 'i/api/operation?page=' + page
                });
            },
            taskInfo: function() {
                return API.ajax({
                    url: 'i/api/taskInfo'
                });
            }
        },
        live: {
            getRoomKanBanModel: function(roomid) {
                return API.ajax({
                    url: 'live/getRoomKanBanModel?roomid' + roomid
                });
            },
            rankTab: function(roomid) {
                return API.ajax({
                    url: 'live/rankTab?roomid=' + roomid
                });
            },
            roomAdList: function() {
                return API.ajax({
                    url: 'live/roomAdList'
                });
            }
        },
        live_user: {
            get_anchor_in_room: function(roomid) {
                return API.ajax({
                    url: 'live_user/v1/UserInfo/get_anchor_in_room?roomid=' + roomid
                });
            },
            get_info_in_room: function(roomid) {
                return API.ajax({
                    url: 'live_user/v1/UserInfo/get_info_in_room?roomid=' + roomid
                });
            },
            get_weared_medal: function(uid, target_id, csrf_token, source) {
                return API.ajax({
                    type: 'POST',
                    url: 'live_user/v1/UserInfo/get_weared_medal',
                    data: {
                        source: source || 1,
                        uid: uid,
                        target_id: target_id, // roomid
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            }
        },
        lottery: {
            getRoomActivityByRoomid: function(roomid) {
                return API.ajax({
                    url: 'lottery/v1/box/getRoomActivityByRoomid?roomid=' + roomid
                });
            },
            check: function(roomid) {
                return API.ajax({
                    url: 'lottery/v1/Storm/check?roomid=' + roomid
                });
            },
            join: function(id, color, captcha_token, captcha_phrase, csrf_token) { // 参加节奏风暴
                return API.ajax({
                    type: 'POST',
                    url: 'lottery/v1/Storm/join',
                    data: {
                        id: id,
                        color: color, // HEX
                        captcha_token: captcha_token,
                        captcha_phrase: captcha_phrase,
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            }
        },
        rankdb: {
            roomInfo: function(ruid, roomid, areaId) {
                return API.ajax({
                    url: 'rankdb/v1/Common/roomInfo',
                    data: {
                        ruid: ruid,
                        roomid: roomid,
                        areaId: areaId
                    }
                });
            }
        },
        room: {
            get_info: function(room_id, from) {
                return API.ajax({
                    url: 'room/v1/Room/get_info',
                    data: {
                        room_id: room_id,
                        from: from || 'room'
                    }
                });
            },
            playUrl: function(cid, quality, platform) {
                return API.ajax({
                    url: 'room/v1/Room/playUrl',
                    data: {
                        cid: cid, // roomid
                        quality: quality || '0',
                        platform: platform || 'web'
                    }
                });
            },
            room_entry_action: function(room_id, csrf_token, platform) {
                return API.ajax({
                    type: 'POST',
                    url: 'room/v1/Room/room_entry_action',
                    data: {
                        room_id: room_id,
                        platform: platform || 'pc',
                        csrf_token: typeof csrf_token == 'function' ? csrf_token() : csrf_token
                    }
                });
            },
            room_init: function(id) {
                return API.ajax({
                    url: 'room/v1/Room/room_init?id=' + id
                });
            }
        },
        sign: {
            doSign: function() {
                return API.ajax({
                    url: 'sign/doSign'
                });
            },
            GetSignInfo: function() {
                return API.ajax({
                    url: 'sign/GetSignInfo'
                });
            },
            getLastMonthSignDays: function() {
                return API.ajax({
                    url: 'sign/getLastMonthSignDays'
                });
            }
        },
        user: {
            getWear: function(uid) {
                return API.ajax({
                    url: 'user/v1/user_title/getWear?uid=' + uid
                });
            },
            userOnlineHeart: function() {
                return API.ajax({
                    type: 'POST',
                    url: 'User/userOnlineHeart'
                });
            },
            getUserInfo: function(ts) { // ms
                return API.ajax({
                    url: 'User/getUserInfo?ts=' + ts
                });
            }
        },
        YearWelfare: {
            checkFirstCharge: function() {
                return API.ajax({
                    url: 'YearWelfare/checkFirstCharge'
                });
            },
            inviteUserList: function() {
                return API.ajax({
                    url: 'YearWelfare/inviteUserList/1'
                });
            }
        }
    };

    function ts_s() {
        return Math.floor(ts_ms() / 1000);
    }

    function ts_ms() {
        return Date.now() + timediff;
    }

    function getCookie(name) {
        var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        if ((arr = document.cookie.match(reg))) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }

    function setCookie(name, value, seconds) {
        seconds = seconds || 0;
        var expires = '';
        if (parseInt(seconds, 10) !== 0) {
            var date = new Date();
            date.setTime(date.getTime() + (seconds * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + escape(value) + expires + '; path=/';
    }

    function getBlobDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.withCredentials = true;
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.send();
    }

    /*
    验证码识别算法来自互联网，作者未知
    该算法已被简单修改
    */
    function getChar(t) {
        if (t.sum <= 50) return '-';
        if (t.sum > 120 && t.sum < 135) return '+';
        if (t.sum > 155 && t.sum < 162) return 1;
        if (t.sum > 189 && t.sum < 195) return 7;
        if (t.sum > 228 && t.sum < 237) return 4;
        if (t.sum > 250 && t.sum < 260) return 2;
        if (t.sum > 286 && t.sum < 296) return 3;
        if (t.sum > 303 && t.sum < 313) return 5;
        if (t.sum > 335 && t.sum < 342) return 8;
        if (t.sum > 343 && t.sum < 350) {
            if (t.first > 24 && t.last > 24) return 0;
            if (t.first < 24 && t.last > 24) return 9;
            if (t.first > 24 && t.last < 24) return 6;
        }
    }

    function calcImg() {
        /*
         * 1.验证码图片->二维点阵
         * 2.二维点阵->横向一维压缩
         * 3.分析并计算
         */
        var ctx = DOM.treasure.canvas[0].getContext("2d");
        ctx.drawImage(DOM.treasure.image[0], 0, 0, 120, 40);
        var pixels = ctx.getImageData(0, 0, 120, 40).data;
        var pix = [];
        var i = 0;
        var j = 0;
        var n = 0;
        for (i = 1; i <= 40; i++) {
            pix[i] = [];
            for (j = 1; j <= 120; j++) {
                var c = 1;
                if (pixels[n] - (-pixels[n + 1]) - (-pixels[n + 2]) > 200) {
                    c = 0;
                }
                n += 4;
                pix[i][j] = c;
            }
        }
        //二维点阵pix[40][120]
        var line = [];
        line[0] = 0;
        for (i = 1; i <= 120; i++) {
            line[i] = 0;
            for (j = 1; j <= 40; j++) {
                line[i] += pix[j][i];
            }
        }
        //一维line[120]
        var temp = [];
        n = 0;
        for (i = 1; i <= 120; i++) {
            if (line[i] > 0 && line[i - 1] === 0) {
                n++;
                temp[n] = {};
                temp[n].first = line[i];
                temp[n].sum = 0;
            }
            if (line[i] > 0) {
                temp[n].sum += line[i];
            }
            if (line[i - 1] > 0 && line[i] === 0) {
                temp[n].last = line[i - 1];
            }
        }
        if (n == 4) {
            var result = 0;
            var a = getChar(temp[1]) * 10 - (-getChar(temp[2]));
            var b = getChar(temp[4]);
            if (getChar(temp[3]) == '+') {
                result = a - (-b);
            } else {
                result = a - b;
            }
            DEBUG('TaskAward: calcImg: 识别验证码: ' + getChar(temp[1]) + getChar(temp[2]) + ' ' + getChar(temp[3]) + ' ' + getChar(temp[4]) + ' = ' + result);
            return result;
        } else {
            DEBUG('TaskAward: calcImg: 识别验证码失败');
            return null;
        }
    }

    /* TODO
    function recognizeCaptcha() {
        var ctx = DOM.storm.canvas[0].getContext('2d');
        ctx.drawImage(DOM.storm.image[0], 0, 0, 112, 32);
        return OCRAD(ctx.getImageData(0, 0, 112, 32));
    }
    */

    var liveQuickLogin = function() {
        if (!getCookie('DedeUserID') && !getCookie('LIVE_LOGIN_DATA')) {
            try {
                if (!window.biliQuickLogin) {
                    $.getScript('https://static-s.bilibili.com/account/bili_quick_login.js', function(response, status) {
                        if (status == 'success') login();
                    });
                } else {
                    login();
                }
            } catch (tryErr) {
                throw new Error(tryErr);
            }
        }

        function login() {
            if (window.biliQuickLogin) {
                window.biliQuickLogin(function() {
                    window.location.reload();
                });
                throw 'Bilibili Live: 您还未登陆.';
            } else {
                throw 'Bilibili Live: 快速登录脚本加载失败.';
            }
        }
    };

    function giftIDtoFeed(gift_id) {
        for (var i = gift_list.length - 1; i >= 0; i--) {
            if (gift_list[i].id === gift_id) {
                return Math.floor(gift_list[i].price / 100);
            }
        }
        return null;
    }

    function toast(e, n, r) {
        var t = Toast.element;
        if (!CONFIG.SHOW_TOAST || !t) return;
        if ('boolean' == typeof n) n = 'info';
        var o = document.createDocumentFragment(),
            a = document.createElement('div');
        if ('success' !== (n = n || 'info') && 'caution' !== n && 'error' !== n && 'info' !== n)
            throw new Error(i + ' 在使用 Link Toast 时必须指定正确的类型: success || caution || error || info');
        if (a.innerHTML = '<span class="toast-text">' + e + '</span>',
            a.className = 'link-toast ' + n + ' ' + (r ? 'fixed' : ''), !t.className && !t.attributes)
            throw new Error(i + ' 传入 element 不是有效节点.');
        var c = t.getBoundingClientRect(),
            s = c.left,
            u = c.top,
            l = c.width,
            f = c.height,
            p = document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft;
        // a.style.left = s + l + p + 'px';
        a.style.left = s + p + 'px';
        var d = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
        // a.style.top = u + f + d + Toast.count * 40 + 'px';
        a.style.top = u + d + Toast.count * 40 + 'px';
        setTimeout((function() {
            a.className += ' out';
            setTimeout((function() {
                Toast.count--;
                Toast.list.unshift();
                Toast.list.forEach(function(v) {
                    v.style.top = (parseInt(v.style.top, 10) - 40) + 'px';
                });
                a.parentNode.removeChild(a);
            }), 200);
        }), 4e3);
        o.appendChild(a);
        document.body.appendChild(o);
        var h = document.body.offsetWidth,
            v = a.getBoundingClientRect().left,
            m = a.offsetWidth;
        if (h - m - v < 0) a.style.left = h - m - 10 + p + 'px';
        Toast.count++;
        Toast.list.push(a);
    }

    function execUntilSucceed(callback) {
        setTimeout(function() {
            if (!callback()) {
                execUntilSucceed(callback);
            }
        }, 200);
    }

    function toInt(v) {
        return parseInt(v, 10);
    }

    function removeBlankChar(str) {
        return str.replace(/(\s|\u00A0)+/, '');
    }

    function recurLoadConfig(cfg) {
        for (var item in cfg) {
            var e = $('#' + NAME + '_config_' + item);
            if (e[0]) {
                switch (typeof cfg[item]) {
                    case 'string':
                    case 'number':
                        e.val(cfg[item]);
                        break;
                    case 'boolean':
                        e.attr('checked', cfg[item]);
                        break;
                    case 'object':
                        if (Array.isArray(cfg[item])) e.val(cfg[item].join(','));
                        else recurLoadConfig(cfg[item]);
                        break;
                }
            }
        }
    }

    function recurSaveConfig(config) {
        var cfg = config;
        if (typeof cfg != 'object') return cfg;
        for (var item in cfg) {
            var e = $('#' + NAME + '_config_' + item);
            if (e[0]) {
                switch (typeof cfg[item]) {
                    case 'string':
                        cfg[item] = e.val() || '';
                        break;
                    case 'number':
                        cfg[item] = parseInt(e.val(), 10) || 0;
                        break;
                    case 'boolean':
                        cfg[item] = e.is(':checked');
                        break;
                    case 'object':
                        if (Array.isArray(cfg[item])) {
                            cfg[item] = removeBlankChar(e.val()).split(',').map(toInt) || [];
                        } else {
                            cfg[item] = recurSaveConfig(cfg[item]);
                        }
                        break;
                }
            }
        }
        return cfg;
    }

    function loadConfig() {
        // CONFIG = JSON.parse(GM_getValue('CONFIG', JSON.stringify(CONFIG)));
        try {
            CONFIG = JSON.parse(localStorage.getItem(NAME + '_CONFIG')) || CONFIG_DEFAULT;
            if (typeof CONFIG != 'object') {
                CONFIG = CONFIG_DEFAULT;
                localStorage.setItem(NAME + '_CONFIG', JSON.stringify(CONFIG_DEFAULT));
            }
        } catch (e) {
            console.log('Bilibili直播间挂机助手读取配置失败');
            // localStorage.removeItem(NAME + '_CONFIG');
            // localStorage.removeItem('Bilibili-LiveRoom-HangHelper_CONFIG');
            CONFIG = CONFIG_DEFAULT;
            localStorage.setItem(NAME + '_CONFIG', JSON.stringify(CONFIG_DEFAULT));
        }
        DEBUG('loadConfig: CONFIG', CONFIG);
        if (DOM.config.div) {
            recurLoadConfig(CONFIG);
        }
    }

    function saveConfig() {
        if (DOM.config.div) {
            CONFIG = recurSaveConfig(CONFIG_DEFAULT);
        }
        // GM_setValue('CONFIG', CONFIG);
        localStorage.setItem(NAME + '_CONFIG', JSON.stringify(CONFIG));
        DEBUG('saveConfig: CONFIG', CONFIG);
    }

    /*
    window.BilibiliLive.ANCHOR_UID
    window.BilibiliLive.COLORFUL_LOGGER
    window.BilibiliLive.INIT_TIME
    window.BilibiliLive.RND === window.DANMU_RND
    window.BilibiliLive.ROOMID
    window.BilibiliLive.SHORT_ROOMID
    window.BilibiliLive.UID
    window.captcha_key
    window.$b
    */

    function Init() {
        // liveQuickLogin();
        InitConfigGui();
        loadConfig();
        DEBUG('CONFIG', CONFIG);
        execUntilSucceed(function() {
            if (window.BilibiliLive) {
                timediff = window.BilibiliLive.INIT_TIME - Date.now();
                DEBUG('Init: BilibiliLive', window.BilibiliLive);
                if (parseInt(window.BilibiliLive.UID, 10) !== 0) {
                    Info.short_id = window.BilibiliLive.SHORT_ROOMID;
                    Info.uid = window.BilibiliLive.UID;
                    Info.roomid = window.BilibiliLive.ROOMID;
                    Info.ruid = window.BilibiliLive.ANCHOR_UID;
                    Info.rnd = window.BilibiliLive.RND;
                    room_id_list[Info.short_id] = Info.roomid;
                    if (CONFIG.USE_AWARD) {
                        execUntilSucceed(function() {
                            var _treasure_box = $('#gift-control-vm div.treasure-box.p-relative');
                            if (_treasure_box[0]) {
                                _treasure_box.attr('id', 'old_treasure_box');
                                _treasure_box.hide();
                                DOM.treasure.div = $('<div id="' + NAME + '_treasure_div" class="treasure-box p-relative"></div>');
                                DOM.treasure.div_tip = $('<div id="' + NAME + '_treasure_div_tip" class="t-center b-box none-select">自动<br>领取中</div>');
                                DOM.treasure.div_timer = $('<div id="' + NAME + '_treasure_div_timer" class="t-center b-box none-select">0</div>');
                                DOM.treasure.image = $('<img id="' + NAME + '_treasure_image" style="display:none">');
                                DOM.treasure.canvas = $('<canvas id="' + NAME + '_treasure_canvas" style="display:none" height="40" width="120"></canvas>');
                                var css_text = 'max-width: 40px;padding: 2px 3px;margin-top: 3px;font-size: 12px;color: #fff;background-color: rgba(0,0,0,.5);border-radius: 10px;';
                                DOM.treasure.div_tip[0].style = css_text;
                                DOM.treasure.div_timer[0].style = css_text;
                                DOM.treasure.div.append(DOM.treasure.div_tip);
                                DOM.treasure.div.append(DOM.treasure.image);
                                DOM.treasure.div.append(DOM.treasure.canvas);
                                DOM.treasure.div_tip.after(DOM.treasure.div_timer);
                                _treasure_box.after(DOM.treasure.div);
                                interval_treasure_timer = setInterval(function() {
                                    var t = parseInt(DOM.treasure.div_timer.text(), 10);
                                    if (t > 0) DOM.treasure.div_timer.text((t - 1) + 's');
                                    else DOM.treasure.div_timer.hide();
                                }, 1e3);
                                return true;
                            }
                        });
                    }
                    /* TODO
                    if (CONFIG.USE_LOTTERY) {
                        DOM.storm.div = $('<div id="' + NAME + '_storm_div" style="display:none"></div>');
                        DOM.storm.image = $('<img id="' + NAME + '_storm_image" style="display:none">');
                        DOM.storm.canvas = $('<canvas id="' + NAME + '_storm_canvas" style="display:none"></canvas>');
                        DOM.storm.div.append(DOM.storm.image);
                        DOM.storm.div.append(DOM.storm.canvas);
                        document.body.appendChild(DOM.storm.div[0]);
                    }
                    */
                    if (CONFIG.USE_GIFT && (CONFIG.GIFT_CONFIG.SHORT_ROOMID === 0 || CONFIG.GIFT_CONFIG.SHORT_ROOMID == Info.short_id)) {
                        API.live_user.get_weared_medal(Info.uid, Info.roomid, Info.csrf_token).done(function(response) {
                            DEBUG('Init: get_weared_medal', response);
                            if (response.code === 0) {
                                Info.medal_target_id = response.data.target_id;
                                Info.today_feed = parseInt(response.data.today_feed, 10);
                                Info.day_limit = response.data.day_limit;
                                Info.old_area_id = response.data.area;
                                Info.area_id = response.data.area_v2_id;
                                Info.area_parent_id = response.data.area_v2_parent_id;
                                API.gift.room_gift_list(Info.roomid, Info.area_id).done(function(response) {
                                    // DEBUG('Init: room_gift_list', response);
                                    if (response.code === 0) {
                                        gift_list = response.data;
                                    }
                                });
                            }
                        });
                        API.live_user.get_info_in_room(Info.roomid).done(function(response) {
                            DEBUG('Init: get_info_in_room', response);
                            if (response.code === 0) {
                                Info.silver = response.data.wallet.silver;
                                Info.gold = response.data.wallet.gold;
                                Info.mobile_verified = response.data.info.mobile_verified;
                            }
                        });
                    }
                    setTimeout(function() {
                        DEBUG('Init: Info', Info);
                        Toast.element = $('<div id="' + NAME + '_div_toast"></div>');
                        Toast.element.appendTo($('#rank-list-vm'));
                        Toast.element = Toast.element[0];
                        var str = [];
                        if (CONFIG.USE_SIGN) str.push('自动签到');
                        if (CONFIG.USE_AWARD) str.push('自动领取瓜子');
                        if (CONFIG.USE_LOTTERY) str.push('自动参加抽奖');
                        if (CONFIG.USE_TASK) str.push('自动完成任务');
                        if (CONFIG.USE_GIFT) str.push('自动送礼');
                        if (str.length) str = str.join('，');
                        else str = '无';
                        toast('助手已启用功能：' + str, 'info');
                        TaskStart();
                    }, 3e3);
                } else {
                    // 未登录
                    toast('你还没有登录，助手无法使用！', 'caution');
                }
                return true;
            }
        });
    }

    function InitConfigGui() {
        var CONFIG_NAMELIST = {
            USE_SIGN: '自动签到',
            USE_AWARD: '自动领取瓜子',
            USE_LOTTERY: '自动参加抽奖',
            USE_TASK: '自动完成任务',
            USE_GIFT: '自动送礼物',
            GIFT_CONFIG: '送礼设置',
            SHORT_ROOMID: '房间号',
            SHORT_ROOMID_placeholder: '为0则自动检测勋章',
            SEND_GIFT: '默认礼物类型',
            SEND_GIFT_placeholder: "为空则取决于'允许礼物类型'",
            ALLOW_GIFT: '允许礼物类型',
            ALLOW_GIFT_placeholder: '为空则允许所有',
            CHANGE_MEDAL: '允许切换勋章',
            SEND_TODAY: '送出包裹中今天到期的礼物',
            SHOW_TOAST: '显示浮动提示'
        };

        function itemToName(item) {
            return CONFIG_NAMELIST[item];
        }

        function recur(cfg, element) {
            for (var item in cfg) {
                var e;
                switch (typeof cfg[item]) {
                    case 'string':
                    case 'number':
                        e = $('<div title="' + itemToName(item) + '" style="padding: 2px 0;"></div>');
                        e[0].innerHTML = '<label style="display: inline-block;max-width: 100%;" title="' + itemToName(item) + '">' + itemToName(item) + '<input id="' + NAME + '_config_' + item + '" type="text" style="line-height: normal;box-sizing: border-box;padding: 0;" placeholder="' + itemToName(item + '_placeholder') + '"></input></label>';
                        element.append(e);
                        break;
                    case 'boolean':
                        e = $('<div title="' + itemToName(item) + '" style="padding: 2px 0;"></div>');
                        e[0].innerHTML = '<label style="display: inline-block;max-width: 100%;" title="' + itemToName(item) + '"><input id="' + NAME + '_config_' + item + '" type="checkbox" style="line-height: normal;box-sizing: border-box;padding: 0;">' + itemToName(item) + '</input></label>';
                        element.append(e);
                        break;
                    case 'object':
                        if (Array.isArray(cfg[item])) {
                            e = $('<div title="' + itemToName(item) + '" style="padding: 2px 0;"></div>');
                            e[0].innerHTML = '<label style="display: inline-block;max-width: 100%;" title="' + itemToName(item) + '">' + itemToName(item) + '<input id="' + NAME + '_config_' + item + '" type="text" style="line-height: normal;box-sizing: border-box;padding: 0;" placeholder="' + itemToName(item + '_placeholder') + '"></input></label>';
                            element.append(e);
                        } else {
                            e = $('<div id="' + NAME + '_config_' + item + '" title="' + itemToName(item) + '" style="padding: 0 0 0 16px;"></div>');
                            e[0].innerHTML = '<h3 style="margin: 0;">' + itemToName(item) + '</h3>';
                            element.append(e);
                            recur(cfg[item], e);
                        }
                        break;
                }
            }
        }

        execUntilSucceed(function() {
            if ($('#sidebar-vm div.side-bar-cntr')[0]) {
                DOM.config.div = $('<div></div>');
                DOM.config.div[0].style = 'display: none;position: fixed;height: 200px; width: 300px;-webkit-transform: translate3d(0,50%,0);transform: translate3d(0,50%,0);border-radius: 8px;-webkit-box-shadow: 0 6px 12px 0 rgba(106,115,133,.22);box-shadow: 0 6px 12px 0 rgba(106,115,133,.22);border: 1px solid #e9eaec;z-index: 10000;background-color: #fff;';
                DOM.config.div.append('<div style="border-bottom: 1px solid #E6E6E6;color: #333;font: 700 14px/36px SimSun;height: 36px;line-height: 36px;margin: 0;padding: 0;overflow: hidden;background-color: #f8f8f8;"><span style="float: left;margin-left: 10px;">Bilibili直播间挂机助手 - 设置</span></div>');
                var div_content = $('<div style="height: 100%;overflow-y: auto;margin: 0;padding: 0;"></div>');
                DOM.config.div.append($('<div style="background: #FFF;padding: 12px;text-align: left;margin: 0;"></div>').append($('<div style="margin: 0;padding: 0;"></div>').append(div_content)));
                recur(CONFIG_DEFAULT, div_content);
                document.body.appendChild(DOM.config.div[0]);
                DOM.config.div_button = $('<div id="' + NAME + '_config_div_button" role="button" class="side-bar-btn"></div>');
                DOM.config.div_button_p = $('<p class="size-bar-text" style="margin: 4px 0 0;font-size: 12px;line-height: 16px;color: #0080c6;">挂机助手设置</p>');
                DOM.config.div_button.append(DOM.config.div_button_p);
                DOM.config.div_button[0].style = 'width: 56px;height: 32px;-webkit-box-sizing: border-box;box-sizing: border-box;margin: 4px 0;cursor: pointer;text-align: center;padding: 0 0;';
                var div_side_bar = $('<div class="side-bar-cntr"></div>');
                div_side_bar[0].style = 'height: 40px;overflow: hidden;position: fixed;right: 0;bottom: 10%;padding: 0px 4px;background-color: #fff;z-index: 10;border-radius: 12px 0 0 12px;-webkit-box-shadow: 0 0 20px 0 rgba(0,85,255,.1);box-shadow: 0 0 20px 0 rgba(0,85,255,.1);-webkit-transition: height .4s cubic-bezier(.22,.58,.12,.98);-o-transition: height cubic-bezier(.22,.58,.12,.98) .4s;transition: height .4s cubic-bezier(.22,.58,.12,.98);border: 1px solid #e9eaec;';
                div_side_bar.append(DOM.config.div_button);
                $('#sidebar-vm div.side-bar-cntr').after(div_side_bar);
                DOM.config.div[0].style.left = div_side_bar[0].getBoundingClientRect().left - 300 + 'px';
                DOM.config.div[0].style.top = div_side_bar[0].getBoundingClientRect().top - 300 + 'px';
                DOM.config.div_button.click(function() {
                    if (!DOM.config.div_showed) {
                        loadConfig();
                        DOM.config.div.show();
                        DOM.config.div_button_p.text('点击保存设置');
                        DOM.config.div_button_p.css('color', '#ff8e29');
                    } else {
                        saveConfig();
                        DOM.config.div.hide();
                        DOM.config.div_button_p.text('挂机助手设置');
                        DOM.config.div_button_p.css('color', '#0080c6');
                    }
                    DOM.config.div_showed = !DOM.config.div_showed;
                });
                return true;
            }
        });
    }

    /*
    function TaskLogWatcher(callback) {
        var logs_last_length = 0;
        setInterval(function() {
            if (logs_last_length !== window.Yb.length) {
                var logs_new = window.Yb.slice(logs_last_length, window.Yb.length);
                if (logs_new && logs_new.length) {
                    logs_last_length = window.Yb.length;
                    callback(logs_new);
                }
            }
        }, 1000);
    }
    */

    function SmallTV(room_id) {
        API.gift.smalltv.check(room_id).done(function(response) { // 检查是否有小电视抽奖
            DEBUG('TaskLottery: smalltv.check', response);
            if (response.code === 0) {
                response.data.forEach(function(v) {
                    var time = v.time;
                    if (v.status === 1) { // 可以参加
                        API.gift.smalltv.join(room_id, v.raffleId).done(function(response) {
                            DEBUG('TaskLottery: smalltv.join', response);
                            if (response.code === 0) {
                                setTimeout(function() {
                                    SmallTVNotice(room_id, response.data.raffleId);
                                }, time * 1e3 + 30e3);
                                toast('已参加直播间【' + room_id + '】的小电视抽奖', 'success');
                            }
                        });
                    } else if (v.status === 2 && v.time > 0) { // 已参加且未开奖
                        setTimeout(function() {
                            SmallTVNotice(room_id, response.data.raffleId);
                        }, time * 1e3 + 30e3);
                        toast('已参加直播间【' + room_id + '】的小电视抽奖', 'success');
                    }

                });
            } else if (response.code === -400) {
                // 没有需要提示的小电视
            }
        });
    }

    function Raffle(room_id) {
        API.activity.check(room_id).done(function(response) { // 检查是否有活动抽奖
            DEBUG('TaskLottery: activity.check', response);
            if (response.code === 0) {
                response.data.forEach(function(v) {
                    var time = v.time;
                    if (v.status === 1) { // 可以参加
                        API.activity.join(room_id, v.raffleId).done(function(response) {
                            DEBUG('TaskLottery: activity.join', response);
                            if (response.code === 0) {
                                // 加入成功
                                setTimeout(function() {
                                    RaffleNotice(room_id, response.data.raffleId);
                                }, time * 1e3 + 30e3);
                                toast('已参加直播间【' + room_id + '】的活动抽奖', 'success');
                            } else if (response.code === 65531) {
                                // 65531: 非当前直播间或短ID直播间试图参加抽奖
                            }
                        });
                    } else if (v.status === 2 && v.time > 0) { // 已参加且未开奖
                        setTimeout(function() {
                            RaffleNotice(room_id, response.data.raffleId);
                        }, time * 1e3 + 30e3);
                        toast('已参加直播间【' + room_id + '】的活动抽奖', 'success');
                    }
                });
            }
        });
    }

    function SmallTVNotice(room_id, raffleId, cnt) {
        if (cnt > 5) return;
        API.gift.smalltv.notice(room_id, raffleId).done(function(response) {
            DEBUG('TaskLottery: smalltv.notice', response);
            if (response.code === 0) {
                if (response.data.status === 1) {
                    // 非常抱歉，您错过了此次抽奖，下次记得早点来哦
                } else if (response.data.status === 2) {
                    if (response.data.gift_id == '-1' && !response.data.gift_name) {
                        toast(response.msg, 'info');
                    } else {
                        toast('直播间【' + room_id + '】小电视抽奖结果：' + response.data.gift_name + '*' + response.data.gift_num, 'info');
                    }
                } else if (response.data.status === 3) {
                    // 还未开奖
                    setTimeout(function() {
                        SmallTVNotice(room_id, raffleId, cnt);
                    }, 6e3);
                } else {
                    toast(response.msg, 'error');
                }
            } else {
                // 其他情况
                setTimeout(function() {
                    SmallTVNotice(room_id, raffleId, cnt + 1);
                }, 6e3);
            }
        });
    }

    function RaffleNotice(room_id, raffleId, cnt) {
        if (cnt > 5) return;
        API.activity.notice(room_id, raffleId).done(function(response) {
            DEBUG('TaskLottery: activity.notice', response);
            if (response.code === 0) {
                if (response.data.gift_id == '-1') {
                    toast(response.msg, 'info');
                } else {
                    toast('直播间【' + room_id + '】活动抽奖结果：' + response.data.gift_name + '*' + response.data.gift_num, 'info');
                }
            } else if (response.msg == '参数错误！') {
                // 参数错误！
            } else if (response.msg == '尚未开奖，请耐心等待！') {
                // 尚未开奖，请耐心等待！
                setTimeout(function() {
                    RaffleNotice(room_id, raffleId, cnt);
                }, 6e3);
            } else {
                // 其他情况
                setTimeout(function() {
                    RaffleNotice(room_id, raffleId, cnt + 1);
                }, 6e3);
            }
        });
    }

    /*
    function Storm(cnt) {
        if (cnt > 5) return;
        API.create(112, 32).done(function(response) {
            if (response.code === 0) {
                DOM.storm.image[0].onload = function() {
                    // TODO
                    var phrase = recognizeCaptcha();
                    // 暂时不清楚验证码与phrase的关系，猜测是对验证码计算sha1
                    API.lottery.join(id, color, response.data.token, phrase, Info.csrf_token).done(function(response) {
                        if (response.code === 0) {
                            toast('节奏风暴抽奖结果：' + response.data.gift_name + '*' + response.data.gift_num, 'info');
                        } else {
                            setTimeout(function() {
                                Storm(cnt + 1);
                            }, 1e3);
                        }
                    });
                };
                DOM.storm.image[0].src = response.data.image;
            }
        });
    }
    */

    function Award(callback, cnt) {
        if (cnt > 5) {
            callback();
            return;
        }
        API.FreeSilver.getCaptcha(ts_ms(), function(dataURL) {
            DOM.treasure.image[0].onload = function() {
                var captcha = calcImg();
                if (captcha) {
                    // 验证码识别成功
                    API.FreeSilver.getAward(ts_s(), ts_s(), captcha).done(function(response) {
                        DEBUG('TaskAward: getAward', response);
                        if (response.code === 0) {
                            // 领取瓜子成功
                            toast('领取了 ' + response.data.awardSilver + ' 银瓜子', 'success');
                            callback();
                        } else if (response.code === -903) {
                            // -903: 已经领取过这个宝箱
                            toast('已经领取过这个宝箱', 'caution');
                            callback();
                        } else if (response.code === -902 || response.code === -901) {
                            // -902: 验证码错误, -901: 验证码过期
                            setTimeout(function() {
                                Award(callback, cnt + 1);
                            }, 1e3);
                        } else {
                            // 其他错误
                            setTimeout(function() {
                                Award(callback, cnt + 1);
                            }, 3e3);
                        }
                    });
                } else {
                    // 验证码识别失败
                    setTimeout(function() {
                        Award(callback, cnt);
                    }, 500);
                }
            };
            DOM.treasure.image[0].src = dataURL;
        });
    }

    function TaskAward_newTask() {
        API.FreeSilver.getCurrentTask().done(function(response) {
            DEBUG('TaskAward: getCurrentTask', response);
            if (response.code === 0) {
                // 获取任务成功
                if (parseInt(response.data.minute, 10) !== 0) {
                    setTimeout(TaskAward, response.data.minute * 60e3 + 3e3);
                    TaskAward_Running = true;
                    execUntilSucceed(function() {
                        if (DOM.treasure.div_timer) {
                            DOM.treasure.div_timer.text((response.data.minute * 60 + 3) + 's');
                            DOM.treasure.div_timer.show();
                            return true;
                        }
                    });
                    execUntilSucceed(function() {
                        if (DOM.treasure.div_tip) {
                            DOM.treasure.div_tip.html('次数<br>' + response.data.times + '/' + response.data.max_times + '<br>银瓜子<br>' + response.data.silver);
                            return true;
                        }
                    });
                }
            } else if (response.code === -10017) {
                // 今天所有的宝箱已经领完!
                toast(response.msg, 'info');
                clearInterval(interval_treasure_timer);
                execUntilSucceed(function() {
                    if (DOM.treasure.div_timer) {
                        DOM.treasure.div_timer.hide();
                        return true;
                    }
                });
                execUntilSucceed(function() {
                    if (DOM.treasure.div_tip) {
                        DOM.treasure.div_tip.html('今日<br>已领完');
                        return true;
                    }
                });
            } else {
                toast(response.msg, 'info');
            }
        });
    }

    function TaskAward() {
        if (TaskAward_Running) Award(TaskAward_newTask, 0);
        else TaskAward_newTask();
    }

    function Lottery() {
        var lottery_list = [],
            lottery_list_temp = [],
            overlap_index = Infinity;
        $('div.chat-item.system-msg div.msg-content a.link').each(function(index, el) {
            var matched = el.pathname.match(/^\/(\d+).*/);
            if (matched && matched[1]) lottery_list_temp.push(parseInt(matched[1], 10));
        });
        $.each(lottery_list_temp, function(i, v) {
            if (i === 0) {
                var index = lottery_list_last.indexOf(v);
                if (index > -1) {
                    overlap_index = lottery_list_last.length - index;
                } else {
                    overlap_index = 0;
                    lottery_list.push(v);
                }
            } else if (i >= overlap_index) {
                lottery_list.push(v);
            }
        });
        DEBUG('TaskLottery: Lottery: last', lottery_list_last.toString());
        lottery_list_last = lottery_list_temp;
        lottery_list_temp = lottery_list;
        lottery_list = [];
        lottery_list_temp.forEach(function(v) {
            if (lottery_list.indexOf(v) === -1) lottery_list.push(v);
        });
        DEBUG('TaskLottery: Lottery: list', lottery_list.toString());
        // 根据可抽奖的房间数自动调整检测周期
        if (lottery_list.length > 10) {
            lottery_check_time = 3;
        } else if (lottery_list.length > 8) {
            lottery_check_time = 6;
        } else if (lottery_list.length > 5) {
            lottery_check_time = 10;
        } else if (lottery_list.length > 1) {
            lottery_check_time = 15;
        } else {
            lottery_check_time = 20;
        }
        lottery_list.forEach(function(short_id) {
            if (short_id > 0) {
                var room_id = room_id_list[short_id];
                if (room_id > 0) {
                    SmallTV(room_id);
                    Raffle(room_id);
                } else {
                    API.room.room_init(short_id).done(function(response) {
                        DEBUG('TaskLottery: room_init', response);
                        if (response.code === 0) {
                            room_id = response.data.room_id;
                            if (response.data.short_id > 0 && response.data.short_id != short_id) room_id_list[response.data.short_id] = room_id;
                            room_id_list[short_id] = room_id;
                            SmallTV(room_id);
                            Raffle(room_id);
                        }
                    });
                }
            }
        });
        setTimeout(Lottery, lottery_check_time * 1e3);
    }

    function TaskSign() {
        API.sign.GetSignInfo().done(function(response) {
            DEBUG('TaskSign: GetSignInfo', response);
            if (response.code === 0) {
                if (response.data.status === 0) {
                    // 未签到
                    API.sign.doSign().done(function(response) {
                        DEBUG('TaskSign: doSign', response);
                        if (response.code === 0) {
                            // 签到成功
                            toast(response.data.text, 'success');
                        } else {
                            toast(response.data.text, 'error');
                        }
                    });
                } else if (response.data.status === 1) {
                    // 已签到
                    toast('今日已签到：' + response.data.text, 'success');
                }
            }
        });
    }

    function TaskLottery() {
        setTimeout(Lottery, 4e3);
    }

    function TaskReceiveAward(task_id) {
        API.activity.receive_award(task_id, Info.csrf_token).done(function(response) {
            DEBUG('TaskTask: receive_award', response);
            if (response.code === 0) {
                // 完成任务
                toast('完成任务：' + task_id, 'success');
            }
        });
    }

    function Task() {
        toast('检查任务完成情况', 'info');
        API.i.taskInfo().done(function(response) {
            DEBUG('TaskTask: taskInfo', response);
            if (response.code === 0) {
                for (var key in response.data) {
                    if (response.data[key].task_id && response.data[key].status) {
                        // 当前对象是任务且任务可完成
                        TaskReceiveAward(response.data[key].task_id);
                    }
                }
            }
        });
        API.activity.user_limit_tasks().done(function(response) {
            DEBUG('TaskTask: user_limit_tasks', response);
            if (response.code === 0) {
                for (var key in response.data) {
                    if (response.data[key].task_id && response.data[key].status) {
                        // 当前对象是任务且任务可完成
                        TaskReceiveAward(response.data[key].task_id);
                    }
                }
            }
        });
        API.activity.master_limit_tasks().done(function(response) {
            DEBUG('TaskTask: master_limit_tasks', response);
            if (response.code === 0) {
                for (var key in response.data) {
                    if (response.data[key].task_id && response.data[key].status) {
                        // 当前对象是任务且任务可完成
                        TaskReceiveAward(response.data[key].task_id);
                    }
                }
            }
        });
        setTimeout(Task, 3600e3);
    }

    function TaskTask() {
        setTimeout(Task, 6e3);
    }

    function Gift() {
        API.live_user.get_weared_medal(Info.uid, Info.roomid, Info.csrf_token).done(function(response) {
            if (response.code === 0) {
                Info.medal_target_id = response.data.target_id;
                if (Info.medal_target_id !== Info.ruid) {
                    setTimeout(TaskGift, 1e3);
                    return;
                }
                Info.today_feed = parseInt(response.data.today_feed, 10);
                Info.day_limit = response.data.day_limit;
                var remain_feed = Info.day_limit - Info.today_feed;
                if (remain_feed > 0) {
                    toast('今日亲密度未满，送礼开始', 'info');
                    API.gift.bag_list().done(function(response) {
                        DEBUG('TaskGift: bag_list', response);
                        if (response.code === 0) {
                            Info.bag_list = response.data.list;
                            $.each(Info.bag_list, function(i, v) {
                                if ((CONFIG.GIFT_CONFIG.ALLOW_GIFT.indexOf(v.gift_id) > -1 || !CONFIG.GIFT_CONFIG.ALLOW_GIFT[0]) && // 检查ALLOW_GIFT
                                    (((CONFIG.GIFT_CONFIG.SEND_GIFT.indexOf(v.gift_id) > -1 || !CONFIG.GIFT_CONFIG.SEND_GIFT[0]) && remain_feed > 0) || // 检查SEND_GIFT和今日亲密度
                                        (CONFIG.GIFT_CONFIG.SEND_TODAY && v.expire_at > ts_s() && v.expire_at - ts_s() < 86400))) { // 检查SEND_TODAY和礼物到期时间
                                    var feed_single = giftIDtoFeed(v.gift_id);
                                    if (feed_single > 0) {
                                        var feed_num = Math.floor(remain_feed / feed_single);
                                        if (feed_num > v.gift_num) feed_num = v.gift_num;
                                        if (feed_num > 0) {
                                            API.gift.bag_send(Info.uid, v.gift_id, Info.ruid, feed_num, v.bag_id, Info.roomid, Info.rnd, Info.csrf_token).done(function(response) {
                                                DEBUG('TaskGift: bag_send', response);
                                                if (response.code === 0) {
                                                    // 送礼成功
                                                    Info.rnd = response.data.rnd;
                                                    toast('包裹送礼成功，送出' + feed_num + '个' + v.gift_name, 'success');
                                                } else {
                                                    toast('包裹送礼异常，' + response.msg, 'error');
                                                }
                                            });
                                            remain_feed -= feed_num * feed_single;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            });
                            if (remain_feed > 0) {
                                toast('送礼结束，1小时后再次送礼', 'success');
                                setTimeout(Gift, 3600e3);
                            } else {
                                toast('送礼结束，今日亲密度已满', 'success');
                            }
                        } else {
                            toast('获取包裹礼物异常，' + response.msg, 'error');
                        }
                    });
                }
            } else {
                toast('获取亲密度异常，' + response.msg, 'error');
            }
        });
    }

    function TaskGift() {
        if (!(CONFIG.GIFT_CONFIG.SHORT_ROOMID === 0 || CONFIG.GIFT_CONFIG.SHORT_ROOMID == Info.short_id)) return;
        if (Info.medal_target_id !== Info.ruid) {
            if (!CONFIG.GIFT_CONFIG.CHANGE_MEDAL) {
                toast('已佩戴的勋章不是当前主播勋章，送礼功能停止', 'caution');
                return;
            }
            API.i.medal(1, 25).done(function(response) {
                DEBUG('TaskGift: medal', response);
                if (response.code === 0) {
                    Info.medal_list = response.data.fansMedalList;
                    $.each(Info.medal_list, function(index, v) {
                        if (v.target_id === Info.ruid) {
                            API.i.ajaxWearFansMedal(v.medal_id).done(function(response) {
                                DEBUG('TaskGift: ajaxWearFansMedal', response);
                                toast('已自动切换为当前主播勋章', 'success');
                                toast('请注意送礼设置，30秒后开始送礼', 'caution');
                                setTimeout(Gift, 30e3);
                            });
                            return false;
                        }
                    });
                }
            });
        } else {
            toast('请注意送礼设置，30秒后开始送礼', 'caution');
            setTimeout(Gift, 30e3);
        }
    }

    function TaskStart() {
        if (CONFIG.USE_SIGN) TaskSign();
        if (CONFIG.USE_AWARD) TaskAward();
        if (CONFIG.USE_LOTTERY) TaskLottery();
        if (CONFIG.USE_TASK) TaskTask();
        if (CONFIG.USE_GIFT) TaskGift();
    }

    $(document).ready(function() {
        console.log('Bilibili直播间挂机助手已加载');
        Init();
    });

})();