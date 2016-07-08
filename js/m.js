var cache = {
    remove: function(key){
        window.localStorage.removeItem(key);
    },
    set: function(key, value, duration) {
        var data = {
            value: value,
            expiryTime: !duration || isNaN(duration) ? 0 : this._getCurrentTimeStamp() + parseInt(duration)
        };
        window.localStorage[key] = JSON.stringify(data);
    },
    get: function(key) {
        var data = window.localStorage[key];
        if (!data || data === "null") {
            return null;
        }
        var now = this._getCurrentTimeStamp();
        var obj;
        try {
            obj = JSON.parse(data);
        } catch (e) {
            return null;
        }
        if (obj.expiryTime === 0 || obj.expiryTime > now) {
            return obj.value;
        }
        return null;
    },
    _getCurrentTimeStamp: function() {
        return Date.parse(new Date()) / 1000;
    }
};
//var addr = '192.168.0.109:9000'; 
var addr = '114.55.67.11:81';
var util = {
    pre_url : 'http://'+addr,
    is_phone: function(str){
        if(!str) return false;
        var reg = /^(1[35678][0-9]{9})$/;
        return reg.test(str);
    },
    query_string: function(key){
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) return unescape(r[2]); return null; 
    },
    loading: function() {
        $('#html').css('overflow-y', 'hidden');
        $('.zdc').css('display', 'block');
    },
    loaded: function() {
        $('.sk-loading').hide();
        //$('.zdc').hide();
        $('html').css('overflow-y', 'auto');
    },
    dialog: function(title, body, callback, othercall){
        $('#dialog .modal-dialog').css({'margin-left':($(window).width()-300)/2});
        $('#dialog .modal-title1').html(title);
        $('#dialog .modal-body').html(body);
        $('#dialog').modal('show');
        othercall && othercall(); 
        $('#modal-btn').off();
        !callback ? $('.modal-footer').hide() : $('.modal-footer').show();
        $('#modal-btn').click(function(){
            callback();
        })  
    },
    alert: function(msg){
        $('.modal-dialog').css('margin-top', '10%');
        $('#tip .modal-body').html(msg);
        $('#tip').modal('show');
    },
    get_val: function(id){
        var value = $('#'+id).val();
        if(!value)
            $('#'+id).next().show();
        else
            $('#'+id).next().hide();
        return value;
    },
    ajax: function(method, url, data, callback, need_user){
        if(need_user !== false){
            if ('get' == method.toLowerCase()){
                var _data = {'userid':yihaoT.user.userid, 'token':yihaoT.user.token};
                data = $.extend(data, _data);
            }else{
                if(url.indexOf('?') == -1)
                    url = url +'?userid='+yihaoT.user.userid+'&token='+yihaoT.user.token;
                else{
                    url = url +'&userid='+yihaoT.user.userid+'&token='+yihaoT.user.token;
                }
            }  
        }
        $.ajax({
            type:method,
            url :util.pre_url + url,
            data:data,
            //contentType: "application/json",
            dataType: "json",
            //beforeSend: function() {util.loading();},
            //complete: function() {util.loaded();},
            success: function(datas, status){
                if(datas.code == -9){
                    util.alert('该账号已在其他地方登录，请重新登录。');
                    yihaoT.logout();
                    return;
                }else if(datas.code == 0){
                    callback(datas, status);
                }else{
                    $('#yzm-btn').attr('disabled', 'false');
                    util.alert(datas.msg);
                }
            },
            error: function(status) {
                console.log('url:'+url + 'err:' + JSON.stringify(status));
                util.alert("无法连接网络，请check网络连接和服务器");
                return false;
            }
        });
    },
    load: function(){
        Date.prototype.Format = function(fmt)   
        { 
          var o = {   
            "M+" : this.getMonth()+1,                 
            "d+" : this.getDate(),                    
            "H+" : this.getHours(),                      
            "m+" : this.getMinutes(),                 
            "s+" : this.getSeconds(),                 
            "S"  : this.getMilliseconds() 
          };   
          if(/(y+)/.test(fmt))   
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
          for(var k in o)   
            if(new RegExp("("+ k +")").test(fmt))   
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
          return fmt;
        }
    }
};

var yihaoT = {
    user:{},
    set_id:0,
    yzm_time:0,
    source:0,
    login_succ: function(user){
        yihaoT.user = user;
        cache.set('yihaoTong::user', yihaoT.user);
        chat.close();
        chat.connect();
        var code = '<div class="user-img"><img src="'+yihaoT.user.basic.avatar+'"></div><div class="user-info">';
        code += '<div class="user-info-name"><span>'+yihaoT.user.basic.nickname +'</span></div>';
        code += '<a onclick="yihaoT.logout()">退出</a></div>';
        $('.experience').html('<span class="glyphicon glyphicon-time" aria-hidden="true"></span>我的等级：'+yihaoT.user.basic.level);
        $('.user').html(code);
        
        code ='<img src="img/load.gif"><p>正在连接聊天室...</p>';
        $('.chat-load').html(code);
        yihaoT.get_video();
        //$('.lg-play p').hide();
    },
    scroll_bar: function(selector){
        var bars = '.jspHorizontalBar, .jspVerticalBar';
        $(selector).bind('jsp-initialised', function (event, isScrollable) {
            $(this).find(bars).hide();
        }).jScrollPane().hover(
            function () {
                $(this).find(bars).stop().fadeTo('fast', 0.9);
            },
            function () {
                $(this).find(bars).stop().fadeTo('fast', 0);
            }
        );
    },
    logout: function(){
        QC.Login.signOut();
        cache.remove('yihaoTong::user');
        yihaoT.user = {};  
        chat.close();
        chat.connect();
        var code = '<div class="login-btn"><button type="button" class="btn btn-success" id="to-login">登录</button> ';
        code += '<button type="button" class="btn btn-default" id="to-register">注册</button></div>';
        $('.user').html(code);
        
        $('#to-login').on('click', function(){
            yihaoT.gen_login();
        });
        $('#to-register').on('click', function(){
            yihaoT.gen_register();
        });
        
    },
    alert_blur: function(){
        QC.Login({btnId:"qq_login_btn"}, function(res, opts){
            QC.Login.getMe(function(open_id, accessToken){
                var data = {
                    nickname: res.nickname,
                    avatar: res.figureurl_qq_1,
                    openid: open_id,
                    source: yihaoT.source
                };
                util.ajax('get', '/user/qqlogin', data, function(datas, data){
                    yihaoT.login_succ(datas.data);
                    $('#cancel-btn').click();
                })
            });
        });
        //QC.Login({btnId:'qq_login_btn'});
        $('.alert-box input').blur(function(){
            if(!$(this).val())
                $(this).next().show();
            else
                $(this).next().hide();
        });
    },
    gen_login: function(){
        var code = $('#login-form').html();
        $('#dialog .modal-dialog').width(300);
        util.dialog('登录', code, function(){
            var name = util.get_val('loginuser');
            var pwd = util.get_val('loginpwd');
            if (!name || !pwd){
                return;
            }
            util.ajax('get', '/user/login', {username:name, password:hex_md5(pwd)}, function(datas, status){
                yihaoT.login_succ(datas.data);
                $('#cancel-btn').click();
            });
        }, yihaoT.alert_blur);
    },
    remain_time: function(){
        yihaoT.yzm_time--;
        if(yihaoT.yzm_time <= 0){
            yihaoT.yzm_time = 300;
            $('#yzm-btn').html('获取验证码');
            $(this).attr('disabled', 'false');
            clearInterval(yihaoT.set_id);
            return;
        }
        return parseInt(yihaoT.yzm_time / 60) +':'+ parseInt(yihaoT.yzm_time % 60);
    },
    get_yzm: function(){
        $('#yzm-btn').on('click', function(){
            var telephone = util.get_val('telephone');
            if (!telephone) return;
            $(this).attr('disabled', 'true');
            util.ajax('get', '/user/getcode', {telephone:telephone}, function(datas, status){
                alert('验证码已发送至: '+telephone+' 请查收');
                yihaoT.set_id = setInterval("$('#yzm-btn').html(yihaoT.remain_time);", 1000);
                return;
            }, false);
        })
    },
    register: function(regs){
        regs.password = hex_md5(regs.password);
        util.ajax('get', '/user/checkcode', {telephone:regs.telephone, code:regs.yzm}, function(datas, status){   
            util.ajax('post', '/user/register?source='+yihaoT.source, regs, function(datas, status){
                yihaoT.login_succ(datas.data);
                $('#cancel-btn').click();
            })
        }, false);
    },
    gen_register: function(){
        yihaoT.yzm_time = 300;
        yihaoT.set_id && clearInterval(yihaoT.set_id); 
        var code = $('#register-form').html();
        $('#dialog .modal-dialog').width(300);
        util.dialog('注册', code, function(){
            var datas = {
                username : util.get_val('username'),
                qq       : util.get_val('register-qq'),
                nickname : util.get_val('nickname'),
                password : util.get_val('pwd'),
                pwd2     : util.get_val('pwd2'),
                telephone: util.get_val('telephone'),
                yzm      : util.get_val('yzm')
            };
            for(var i in datas){
                if(!datas[i]) return;
            }
            if (datas.password != datas.pwd2){
                $('#pwd2').val('');
                util.get_val('pwd2');
                return;
            }
            if(datas.password.length <= 6){
                util.alert('密码长度需6位及以上');
                return;
            }
            yihaoT.register(datas);
        }, function(){
            yihaoT.alert_blur();
            yihaoT.get_yzm();
        });
    },
    get_config: function(){
        yihaoT.source = util.query_string('source') || 0;
        $.ajax({
            type:'get',
            url :util.pre_url + '/info/config',
            data:{source:yihaoT.source},
            success: function(datas, status){
                if(datas.code == 0){
                    var config = datas.data;
                    $('.logo').html('<img src="'+config.logo+'">');
                }
            },
            error: function(status) {
                util.alert("无法连接网络，请check网络连接和服务器");
                return false;
            }
        });
    },
    get_video: function(){
        util.ajax('get', '/info/videoconfig', {}, function(datas, status){
            var config = datas.data;
            $('.bbs-content marquee').html(config.announcement);
            yihaoT.live_plugin(config.video_url);
        });
    },
    live_plugin: function(video_url){
		// console.log('video:' + video_url);
		// video_url = 'http://www.yhtvideo.com/live/hls/yht2016.m3u8';		
        jwplayer('play-box').setup({
            base: './jwplayer/',
            skin: {name: 'five'},
            hlshtml: true,
            aspectratio: '16:9',
            image: './jwplayer/noboardcast.jpg',
            file:  video_url,
            repeat: true,
            autostart: true,
            width: '100%',
            height: '100%',
            abouttext: '易号通(厦门)石油化工有限公司',
            aboutlink: 'http://www.yht134.com',
            hlslabels: {
                1350: '超清',
                900: '高清',
                450: '标清',
                240: '3G'
            },
            p2pConfig: {
                streamrootKey: 'a50f6e38-ddf4-4f6a-a3df-4240f010f5cc'
            },
            hlsjsConfig: {}
        });
        // jwplayer('play-box').on('complete', function() {
        //     jwplayer('play-box').load({
        //         file: video_url
        //     });
        // });
        // jwplayer('play-box').on('error', function() {
        //     jwplayer('play-box').load({
        //         file: 'http://www.yhtvideo.com/yht.mp4'
        //     });
        // });
    },
    reg_tip: function(){
        if(!yihaoT.user.userid && $('#dialog').css('display') == 'none'){
            yihaoT.limit_watch();
            $('#to-register').click();
        }
    },
    limit_watch: function(){
        if(!yihaoT.user.userid){
            var last = cache.get('yihaoTong::watch::ts');
            if(!last){
                cache.set('yihaoTong::watch::ts', cache._getCurrentTimeStamp());
                return;
            }
            var now = cache._getCurrentTimeStamp();
            if((now - last) >= 259200){
                yihaoT.live_plugin(null);
                //$('.lg-play p').show();
            }
        }
    },
    load: function(){
        var self = this;
        yihaoT.get_config();
        yihaoT.get_video();
 
        $('#to-login').on('click', function(){
            yihaoT.gen_login();
        });
        $('#to-register').on('click', function(){
            yihaoT.gen_register();
        });

        var user = cache.get('yihaoTong::user');
        setInterval('yihaoT.reg_tip();',1000*60*3);
        !user ? console.log('未登录') : yihaoT.login_succ(user);
        !chat.sock && chat.connect();
        $('#dialog').on('shown.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height(), w = dia.width();
            dia.animate({'margin-top':($(window).height()-h)/2}, 500);
        });
        $('#dialog').on('hidden.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height();
            dia.css({'margin-top':0});
        });
    },
    init: function(){
        this.load();
    }
};
$(document).ready(function(){
    util.load();
    yihaoT.init();
})
