if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
}

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
        $('#dialog .modal-title1').html(title);
        $('#dialog .modal-body').html(body);
        $('#dialog').modal('show');
        othercall && othercall(); 
        $('#modal-btn').off();
        !callback ? $('#dialog .modal-footer').hide() : $('#dialog .modal-footer').show();
        $('#modal-btn').click(function(){
            callback();
        })  
    },
    alert: function(msg){
        $('#tip .modal-dialog').css('margin-top', '10%');
        $('#tip .modal-body').html(msg);
        $('#tip').modal('show');
        setTimeout("$('#tip').modal('hide');", 2000);
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
            console.log(url);
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
                }else if(datas.code == -100){
                    chat.close();
                    $('body').html('<strong style="color:red">ip被禁</strong>');
                    return;
                }
                else if(datas.code == 0){
                    callback(datas, status);
                }else{
                    util.alert(datas.msg);
                }
            },
            error: function(status) {
                $('.yzm-btn').attr('disabled', false);
                console.log('url:'+url + 'err:' + JSON.stringify(status));
                util.alert("无法连接网络进行ajax请求，请检查:<br>"+
                            "1、网络畅通，能正常进行网络访问<br>"+
                            "2、如果低版本浏览器请进行升级<br>"+
                            "3、IE9版本需设置：“工具->Internet 选项->安全->自定义级别”将“其他”选项中的“通过域访问数据源”选中为“启用”或者“提示”");
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
    },
    add_favorite: function(url, title){
        if(document.all){
            window.external.addFavorite(url, title);
        }else if(window.sidebar){
            window.sidebar.addPanel(title, url, "");
        }else{
            alert("你的浏览器不支持这个功能，请使用Ctrl+D进行添加");
        }
    }
};

var yihaoT = {
    user:{},
    set_id:0,
    yzm_time:0,
    source:{c:1},
    login_succ: function(user){
        yihaoT.user = user;
        cache.set('yihaoTong::user', yihaoT.user);
        chat.close();
        chat.connect();
        var code = '<div class="user-img"><img src="'+yihaoT.user.basic.avatar+'"></div><div class="user-info">';
        code += '<div class="user-info-name"><span>'+yihaoT.user.basic.nickname +'</span><a onclick="yihaoT.logout()">退出</a></div>';
        code += '<div class="user-op"><a onclick="yihaoT.change_user()">修改资料</a></div></div>';
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
    change_user: function(){
        var code = $('#change-user').html();
        $('#dialog .modal-dialog').width(550);
        util.dialog('个人资料', code, null, function(){           
            var users = yihaoT.user.basic;
            $('#cu-username').val(users.username);
            $('#cu-username').prop("disabled", true);
            $('#cu-nick').val(users.nickname);
            $('#cu-qq').val(users.qq);
            $('#cu-phone').val(users.telphone);
            $('#change-base').click(function(){
                var users = {
                    nickname: $('#cu-nick').val(),
                    qq:$('#cu-qq').val(),
                    telephone:yihaoT.user.basic.telephone,
                    email:yihaoT.user.basic.email
                };
                if(!users.nickname || !users.qq){
                    util.alert('昵称和qq号不能为空');
                    return;
                }
                
                var reg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$/i;
                if(!reg.test(users.nickname)){
                    util.alert('昵称不合法，仅允许汉字、字母和数字组成。请勿带上特殊字符');
                    return;
                }
                util.ajax('get', '/user/ModifyInfo', users, function(datas, status){
                    util.alert('修改信息成功!');
                    yihaoT.user.basic.nickname = users.nickname;
                    yihaoT.user.basic.qq = users.qq;
                    cache.set('yihaoTong::user', yihaoT.user);
                    yihaoT.login_succ(yihaoT.user);
                })
            });
            $('#change-phone').click(function(){
                var users = {
                    nickname: yihaoT.user.basic.nickname,
                    qq:yihaoT.user.basic.qq,
                    telephone:$('#cu-phone').val(),
                    code:$('#cu-yzm').val(),
                    email:yihaoT.user.basic.email
                };
                if(!users.telephone || !users.code){
                    util.alert('手机号和验证码不能为空');
                    return;
                }
                util.ajax('get', '/user/checkcode', {telephone:users.telephone, code:users.code}, function(datas, status){   
                    util.ajax('get', '/user/ModifyInfo', users, function(datas, status){
                        util.alert('手机更新成功!');
                        yihaoT.user.basic.telphone = users.telephone;
                        cache.set('yihaoTong::user', yihaoT.user);
                        yihaoT.login_succ(yihaoT.user);
                    })
                });
            });
            $('#change-pwd').click(function(){
                var pwd = $('#cu-pwd').val(), pwd2 = $('#cu-pwd2').val();
                if(pwd != pwd2){
                    util.alert('两次密码不一致');
                    return;
                }
                if(!pwd) return;
                if(pwd.length < 6){
                    util.alert('密码长度至少6位');
                    return;
                }
                util.ajax('get', '/user/modifypassword', {password:hex_md5(pwd)}, function(datas,status){
                    yihaoT.logout();
                    $('#to-login').click();
                })
            })
        })
    },
    qq_user: function(){
        var code = $('#qq-user').html();
        $('#qq-content').modal('show');
        var user = yihaoT.user.basic;
        $('#qu-nick').val(user.nickname);
        $('#qu-qq').val(user.qq);
        $('#qu-phone').val(user.telphone);
        $('#qq-cont-btn').click(function(){
            var users = {
                nickname: $('#qu-nick').val(),
                qq:       $('#qu-qq').val(),
                telephone:$('#qu-phone').val(),
                code:     $('#qu-yzm').val(),
                email:    yihaoT.user.basic.email
            };
            if(!users.nickname || !users.qq || !users.telephone || !users.code){
                util.alert('请完善信息后再提交');
                return;
            }
            var reg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$/i;
            if(!reg.test(users.nickname)){
                util.alert('昵称不合法，仅允许汉字、字母和数字组成。请勿带上特殊字符');
                return;
            }
            util.ajax('get', '/user/checkcode', {telephone:users.telephone, code:users.code}, function(datas, status){   
                util.ajax('get', '/user/ModifyInfo', users, function(datas, status){
                    util.alert('完善信息成功!');
                    yihaoT.user.basic.nickname = users.nickname;
                    yihaoT.user.basic.qq = users.qq;
                    yihaoT.user.basic.telphone = users.telephone;
                    yihaoT.login_succ(yihaoT.user);
                    $('#qq-content').modal('hide');
                })
            });
        })
    },
    alert_blur: function(){
        QC.Login({btnId:"qq_login_btn"}, function(res, opts){
            QC.Login.getMe(function(open_id, accessToken){
                var data = {
                    nickname: res.nickname,
                    avatar: res.figureurl_qq_1,
                    openid: open_id,
                };
                data = $.extend(data, yihaoT.source);
                console.log('QQ user login~');
                util.ajax('get', '/user/qqlogin', data, function(datas, data){
                    yihaoT.user = datas.data;
                    $('#cancel-btn').click();
                    if(yihaoT.user && yihaoT.user.basic && yihaoT.user.basic.qq && yihaoT.user.basic.telphone){
                        yihaoT.login_succ(datas.data);
                    }else{
                        yihaoT.qq_user();
                    }
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
        $('#dialog .modal-dialog').width(412);
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
            $('.yzm-btn').html('获取验证码');
            $(this).attr('disabled', 'false');
            clearInterval(yihaoT.set_id);
            return;
        }
        return parseInt(yihaoT.yzm_time / 60) +':'+ parseInt(yihaoT.yzm_time % 60);
    },
    get_yzm: function(id){
        var telephone = util.get_val(id);
        if (!telephone) return;
        if(yihaoT.user && yihaoT.user.basic && yihaoT.user.basic.telphone == telephone){
            util.alert('手机号相同不需获取验证码');
            return;
        }
        //$('.yzm-btn').attr('disabled', 'true');
        util.ajax('get', '/user/getcode', {telephone:telephone}, function(datas, status){
            alert('验证码已发送至: '+telephone+' 请查收');
            //yihaoT.set_id = setInterval("$('.yzm-btn').html(yihaoT.remain_time);", 1000);
            return;
        }, false);
    },
    register: function(regs){
        regs.password = hex_md5(regs.password);
        regs = $.extend(regs, yihaoT.source);
        util.ajax('get', '/user/checkcode', {telephone:regs.telephone, code:regs.yzm}, function(datas, status){   
            util.ajax('post', '/user/register', regs, function(datas, status){
                yihaoT.login_succ(datas.data);
                $('#cancel-btn').click();
            }, false);
        }, false);
    },
    gen_register: function(){
        yihaoT.yzm_time = 300;
        yihaoT.set_id && clearInterval(yihaoT.set_id); 
        var code = $('#register-form').html();
        $('#dialog .modal-dialog').width(412);
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
            var reg= /^[a-zA-Z0-9_@.]*$/i;
            if(!reg.test(datas.username)){
                util.alert('用户名不合法、用户名仅允许字母数字和"_@."三个字符组成');
                return;
            }
            reg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$/i;
            if(!reg.test(datas.nickname)){
                util.alert('昵称不合法，仅允许汉字、字母和数字组成。请勿带上特殊字符');
                return;
            }

            if (datas.password != datas.pwd2){
                $('#pwd2').val('');
                util.get_val('pwd2');
                return;
            }
            if(datas.password.length < 6){
                util.alert('密码长度需6位及以上');
                return;
            }
            yihaoT.register(datas);
        }, function(){
            yihaoT.alert_blur();
        });
    },
    get_config: function(){
        if (util.query_string('m')){
            yihaoT.source = {m: util.query_string('m')};
        }else if(util.query_string('d')){
            yihaoT.source = {d: util.query_string('d')};
        }else if(util.query_string('c')){
            yihaoT.source = {c: util.query_string('c')};
        }
        $.ajax({
            type:'get',
            url :util.pre_url + '/info/config',
            data:yihaoT.source,
            success: function(datas, status){
                if(datas.code == 0){
                    var config = datas.data;
                    $('.logo').html('<img src="'+config.logo+'">');
                    $('#wxpub-code').attr('src',config.qrcode);
                    $('.phone-call').append(config.cs_telephone);
                    $('.phone-num').append(config.cs_telephone);
                    $('#help-center').attr('href', config.help_url);
                    $('#help-staff').attr('href', config.support_url);
                    $('#official-url').attr('href', config.website_url);
                    var qqs = [], qqs2 = [];
                    for(var i in config.qq){
                        var qq = config.qq[i];
                        var code = '<li><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&amp;uin='+qq+'&amp;site=qq&amp;menu=yes">QQ交谈</a></li>';
                        qqs.push(code);
                        code = '<li><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&amp;uin='+qq+'&amp;site=qq&amp;menu=yes">';
                        code += '<img border="0" src="http://wpa.qq.com/imgd?IDKEY=70f2f7489e10b28391331b4537f3a2645533215288ae4c80&pic=51" alt="点击这里给我发消息" title="点击这里给我发消息"></a></li>';
                        qqs2.push(code);
                    }
                    $('#qq').html(qqs.join(''));
                    $('.connect-qq').html(qqs2.join(''));
                    $('#share-code').html('<li><img src="'+config.sharecode+'"></li><li role="separator" class="divider"></li><li><a>扫描二维码分享</a></li>');
                    if(config.alert_backgroud){
                        var code = '<button type="button" class="ad-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
                        code += '<img id="ad-img-id" src="'+config.alert_backgroud+'" style="width:100%; height:100%"/><div class="ad-qq">'+$('.connect-qq').html()+'</div>';
                        $('#advert .modal-body').html(code);
                        $('#ad-img-id').load(function(){
                            $('#advert').modal('show');
                        })
                    }
                    if(config.support_url){
                        $('#load-qq').attr('href', 'tencent://Message/?Uin='+config.support_url+'&websiteName=zhibo.yht134.com&Menu=yes');
                        $(function() {
                            // FF聊天ws错误
                            var ff = /Firefox/i.test(navigator.userAgent);
                            if (!ff) {
                                $('#staff').click();
                            }
                        });
                    }

                    var unreg_watchtime = config.unreg_watchtime || 72;
                    var unreg_alerttime = config.unreg_alerttime || 3;
                    //console.log('unreg_watchtime: ' + unreg_watchtime);
                    //console.log('unreg_alerttime: ' + unreg_alerttime);

                    var now = new Date();
                    var fl = Cookies.get('fl');
                    if(typeof fl === "undefined" || Date.parse(fl) > now)
                    {
                        Cookies.set('fl', now);
                    }
                    else
                    {
                        var fld = new Date(fl);
                        var esp = now.getTime() - fld.getTime();
                        //console.log('first in: ' + esp);

                        if(unreg_watchtime * 60 * 60 * 1000 > esp)
                        {
                        	setInterval('yihaoT.reg_tip();',1000*60*unreg_alerttime);
                        }
                    }
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
            $('.techer-cover').html('<img src="'+config.avatar+'">');
            $('.class-info h3').html(config.title);
            $('.techer-name span').html(config.teacher_name);
            yihaoT.live_plugin(config.video_url);
        });
    },
    live_plugin: function(video_url){
		//console.log('video:' + video_url);
		//video_url = 'http://www.yhtvideo.com/live/hls/yht2016.m3u8';
        jwplayer('play-box').setup({
            base: './jwplayer/',
            skin: {name: 'five'},
            hlshtml: true,
            aspectratio: '16:9',
            image: './jwplayer/noboardcast.jpg',
            file:  video_url,
			primary: 'flash',
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
		// 	jwplayer('play-box').load({
		// 		file: video_url
		// 	});
		// });
		// jwplayer('play-box').on('error', function() {
		// 	jwplayer('play-box').load({
		// 		file: 'http://www.yhtvideo.com/yht.mp4'
		// 	});
		// });
    },
    get_announcement: function(){
        util.ajax('get', '/info/announcements', {}, function(datas, status){
            var notices = [];
            for(var i in datas.data){
                var obj = datas.data[i];
                var code = '<div class="notice"><h3><span>'+obj.title+'</span></h3><div class="news-content">'+obj.content+'</div></div>';
                notices.push(code);
            }
            $('.news').html(notices.join(''));
            yihaoT.scroll_bar('.center-content');
        });
    },
	set_container: function(){
	    var wh = $(window).height();	
		
		$('.online-list').css({'height':wh-117});
		var lw = 130 + $('.online-users').width(), rw = $('.right-bar').width()+10; 	
        $('.center').css({
            'width':$('body').width() - (lw+rw),
            'height':wh - 80, 
            'margin-left':lw
        });
        $(' .chat-box').height($('.center').height() - 50);
        $('#chat .chat-msg').height($('.chat-box').height() - 160);
        $('.lg-play').css({'height':( $('.lg-play').width()*9 / 16)});
		yihaoT.scroll_bar('.center-content');
		yihaoT.scroll_bar('.left-bar');
		yihaoT.scroll_bar('.chat-msg');
		yihaoT.scroll_bar('.user-box');
		$('.chat-msg .jspPane').css({'top':$('.chat-msg').height() - $('.msg-list').height() - 20})
	},
	gen_teacher_desc: function(teachers){
	    var indicators = [], inner = [];
	    for (var i in teachers){
	        if(i == 0){
                indicators.push('<li data-target="#carousel-teachers" data-slide-to="0" class="active"></li>');
                inner.push('<div class="item active"><img src="'+teachers[i]+'"></div>');
	        }
	        else{
                indicators.push('<li data-target="#carousel-teachers" data-slide-to="'+i+'"></li>');
                inner.push('<div class="item"><img src="'+teachers[i]+'"></div>');
	        }
	    }
	    $('.carousel-indicators').html(indicators.join(''));
	    $('.carousel-inner').html(inner.join(''));
	    var code = '<div id="carousel-teachers" class="carousel slide" data-ride="carousel">'+$('#carousel-example').html()+'</div>';
	    //console.log('window.width：' +　$(window).width());
        if($(window).width() > 1440)
        {
            $('.modal-dialog').width(750);
        }

        sub.dialog('分析师 | 主持人 介绍', code);
	},
	change_skin: function(){
	    
        util.ajax('get', '/info/BackgroudImgs', {}, function(datas, status){
            var ul = [];
            for(var i in datas.data){
                var obj = datas.data[i];
                var code = '<img width="100" height="55" src="'+obj.url+'">';
                ul.push(code);
            }
            var code ='<div class="bg-list"></div>';
            $('#sub-box .modal-dialog').width(600);
            sub.dialog('更换背景', code, function(){
                $('.bg-list').html(ul.join(''));
                $('.bg-list img').click(function(){
                    var img = $(this).attr('src');
                    $('body').css({'background-image':'url('+img+')'});
                    cache.set('yihaoTong::bg::img', img);
                })
            });
        }, false);
	},
	connect_us: function(){
	    $('#sub-box .modal-dialog').width(380);
	    var code = $('.connect-style').html();
	    sub.dialog('联系我们', code); 
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
	save_url: function(){
	    var aLink = document.createElement('a');
        var blob = new Blob(['[{000214A0-0000-0000-C000-000000000046}] Prop3=19,2 [InternetShortcut] IDList= URL=http://zhibo.yht134.com/']);
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
        aLink.download = '易号财经.url';
        aLink.href = URL.createObjectURL(blob);
        aLink.dispatchEvent(evt);
	},
	load: function(){
	    var self = this;
	    yihaoT.get_config();
	    yihaoT.get_video();
	    yihaoT.get_announcement();

		$(window).resize(function(){
            self.set_container();

            if($('.user-box .user-list').width() > 145)
            {
                $('.user-box .li-nickname').width($('.user-box .user-list').width()-105);
            }
            if($('.manager-box .user-list').width() > 145)
            {
                $('.manager-box .li-nickname').width($('.manager-box .user-list').width()-105);
            }

            $('.lg-play').css({'height':( $('.lg-play').width()*9 / 16)});          
        });

        var user = cache.get('yihaoTong::user');
        !user ? yihaoT.logout() : yihaoT.login_succ(user);        

        var bg = cache.get('yihaoTong::bg::img');
        bg && $('body').css({'background-image':'url('+bg+')'});
        
        $('#to-login').on('click', function(){
            yihaoT.gen_login();
        });
        $('#to-register').on('click', function(){
            yihaoT.gen_register();
        });
        $('#teacher-btn').click(function(){
            util.ajax('get', '/info/teachers', {}, function(datas, status){
                yihaoT.gen_teacher_desc(datas.data);
            });
        });

        $('#bg-skin').click(function(){
            yihaoT.change_skin();    
        });

        $('#download-url').click(function(){
            var code = $('#download-desc').html(); 
            // if($(window).width() > 1440)
            // {
            //     $('#sub-box .modal-dialog').width(600);
            // }
            $('#sub-box .modal-dialog').width(980);

            sub.dialog('下载软件', code);
        });

        $('#connect-us').click(yihaoT.connect_us);

        !chat.sock && chat.connect();
	},
	init: function(){
        //this.qq_login();
	    this.load();
	    sub.load();
        bar.load();
	}
};

var sub = {
    dialog: function(title, body, callback){
        $('#sub-box .modal-title').html(title);
        $('#sub-box .modal-body').html(body);
        $('#sub-box').modal('show');
        callback && callback();
        
    },
    load: function(){
        $('#close-sub').click(function(){
            $('.sub-box').animate({'margin-left':'-'+$('.sub-box').width()+'px'}, 200);
            setTimeout('yihaoT.set_container();', 200);
        });
        
    },
    gen_tab: function(obj){
    	var id = $(obj), name = id.attr('data-name');
    	$('.sub-box-title').html(name);
    	eval('sub.'+id.attr('id')+'();');
    },
    deal_li_click: function(){
        $('.deal-list ul li').click(function(){
            var p = $(this).children('.deal-content');
            if(p.next().is(':hidden')){
                p.animate({'height':'30px'}, 200);
                p.css({'width':'80%'});
                p.next().show();
            }else{  
                p.next().hide();
                p.css({'width':'100%', 'height':'100%'});
                var height = p.css('height');
                p.css({'height':'30px'});
                p.animate({'height':height}, 200);
            }
        });
    },
    calendar: function(){
        $('#sub-box .modal-dialog').width(700);
        var code = '<div class="iframe cdata"><iframe frameborder="0" src="http://www.jin10.com/jin10.com.html"></iframe></div>';
        sub.dialog('财经数据', code);
    },
    enom: function(){
        $('#sub-box .modal-dialog').width(1081);
        var code = '<div class="iframe crili"><iframe frameborder="0" src="http://rili.jin10.com"></iframe><div class="iframe-hide"></div></div>';
        sub.dialog('财经日历', code);
        
    },
    bill: function(){
        $('#bill-table table tbody').html('');
        $('#sub-box .modal-dialog').width(1100);
        $('#sub-box .modal-body').css({'max-height':$('.left-bar').height()-20});
        util.ajax('get', '/info/CallingBillList', {}, function(datas, status){
            var bills = datas.data, trlist = [];
            for (var i in bills){
                var obj = bills[i], code = '', st = obj.sale_time;
                if(st.indexOf('0000') != -1){st = '-';}
                code += '<tr><td>'+obj.product_name+'</td><td>'+obj.id+'</td><td>'+obj.create_time+'</td><td>'+obj.name+'</td>';
                code += '<td>'+obj.positions+'</td><td>'+obj.opening_price/100+'</td><td>'+obj.stop_price/100+'</td><td>'+obj.limited_price/100+'</td>';
                code += '<td>'+st+'</td><td>'+obj.sale_price/100+'</td><td>'+obj.profit /100+'</td><td>'+obj.userid+'</td>';
                trlist.push(code);
            }
            $('#bill-table table tbody').html(trlist.join());
            sub.dialog('喊单提醒', $('#bill-table').html());
        })
    },
    deal: function(){
        $('#sub-box .modal-dialog').width(600);
        $('#sub-box .modal-body').css({'max-height':$('.left-bar').height()-20});
        util.ajax('get', '/info/transactiontips', {}, function(datas, status){
            var ul = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                var code = '<li><h4>'+obj.title+'<span>'+obj.create_time+'</span></h4><div class="deal-content">'+obj.content+'</div>';
                code += '<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></li>';
                ul.push(code);
            }
            var code = '<div class="sub-content"><div class="deal-list"><ul>'+ul.join('')+'</ul></div></div>'
            sub.dialog('交易提示', code, sub.deal_li_click);
        });
    },
    share: function(){
        $('#sub-box .modal-dialog').width(600);
        $('#sub-box .modal-body').css({'max-height':$('.left-bar').height()-20});
        util.ajax('get', '/info/sharedfilelist', {}, function(datas, status){
            var ul = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                var code = '<li><h4>'+obj.title+'</h4><div class="share-content"><span>'+obj.create_time+'</span><a class="btn btn-default" href="'+obj.filepath+'">';
                code += '<span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>下载文件</a></div></li>';
                ul.push(code);
            }
            var code = '<div class="sub-content"><div class="share-list"><ul>'+ul.join('')+'</ul></div></div>'
            sub.dialog('共享文件', code);
        });
    },
    vote_opt: function(id, opt){
        return opt ? '<a href="javascript:;" class="vote-opt" opt-id="'+id+'">'+opt+'</a>' : '';
    },
    vote: function(){
        $('#sub-box .modal-dialog').width(600);
        $('#sub-box .modal-body').css({'max-height':$('.left-bar').height()-20});
        util.ajax('get', '/info/votelist', {}, function(datas, status){
            var ul = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                var content = sub.vote_opt(1, obj.options1)+sub.vote_opt(2, obj.options2)+sub.vote_opt(3, obj.options3);
                content += sub.vote_opt(4, obj.options4) + sub.vote_opt(5, obj.options5)
                var code = '<li><h4>'+obj.title+'<span>'+obj.createTime+'</span></h4><div class="vote-content" vote-id="'+obj.id+'">'+content+'</div></li>';
                ul.push(code);
            }
            var code = '<div class="sub-content"><div class="vote-list"><ul>'+ul.join('')+'</ul></div></div>'
            sub.dialog('交易提示', code, function(){
                $('a.vote-opt').click(function(){
                    if(!yihaoT.user.userid){
                        $('#sub-box .close').click();
                        $('#to-login').click();
                        return;
                    }
                    var data = {
                        vote_id:    $(this).parent().attr('vote-id'),
                        options_id: $(this).attr('opt-id')
                    }
                    util.ajax('get', '/info/vote', data, function(datas, status){
                        util.alert('投票成功，一个账号多次投票只统计一次哦');
                    })
                })
            });
        });         
    },
    course: function(){
        $('#course-table table tbody').html('');
        $('#sub-box .modal-dialog').width(1100);
        $('#sub-box .modal-body').css({'max-height':$('.left-bar').height()-20});
         util.ajax('get', '/info/timetable', {}, function(datas, status){
            var trs = [];
            for (var i in datas.data){
                var code = '', tr = datas.data[i];
                code += '<tr><td>'+tr.tech_time+'</td><td>'+tr.monday+'</td><td>'+tr.tuesday+'</td><td>'+tr.wednesday+'</td>';
                code += '<td>'+tr.thursday+'</td><td>'+tr.friday+'</td><td>'+tr.saturday+'</td><td>'+tr.sunday+'</td>';
                trs.push(code);
            }
            $('#course-table table tbody').html(trs.join(''));
            sub.dialog('喊单提醒', $('#course-table').html());
        })
    }
};

var bar = {
    load: function(){
        $('.icon-list li a').each(function(){
            var self = this;
            $(this).click(function(){
                var self = this;
                sub.gen_tab(self);
                $('.sub-box').animate({'margin-left': '1px'}, 200);
                setTimeout('yihaoT.set_container();', 200);
            })
        });
        $('#sub-box').on('show.bs.modal', function (e) {
            var dia = $('#sub-box .modal-dialog');
            dia.css({'visibility': 'hidden'})
        });
        $('#sub-box').on('shown.bs.modal', function (e) {
            var dia = $('#sub-box .modal-dialog'), h = dia.height();
            dia.css({'visibility': 'visible'})
            dia.animate({'margin-top':($(window).height()-h)/2}, 500);
        });
        $('#sub-box').on('hidden.bs.modal', function (e) {
            var dia = $('#sub-box .modal-dialog'), h = dia.height();
            dia.css({'margin-top':0});
        });
        
        $('#advert').on('shown.bs.modal', function (e) {
            var dia = $('#advert .modal-dialog'), h = dia.height();
            dia.css({'visibility': 'visible'})
            dia.animate({'margin-top':($(window).height()-h)/2}, 500);
            var ml = $('.ad-qq').width()/2;
            $('.ad-qq').css({'margin-left':'-'+ml+'px'});
        });
        
        $('#dialog').on('shown.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height();
            dia.animate({'margin-top':($(window).height()-h)/2}, 500);
        });
        $('#dialog').on('hidden.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height();
            dia.css({'margin-top':0});
        });
        
        $('#qq-content').on('shown.bs.modal', function (e) {
            var dia = $('#qq-content .modal-dialog'), h = dia.height();
            dia.animate({'margin-top':($(window).height()-h)/2}, 500);
        });
        $('#qq-content').on('hidden.bs.modal', function (e) {
            var dia = $('#qq-content .modal-dialog'), h = dia.height();
            dia.css({'margin-top':0});
        });
    }
}


$(document).ready(function(){
    jQuery.support.cors = true;
    yihaoT.set_container();
    util.load();
    yihaoT.init();
})

