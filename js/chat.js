var chat = {
    deny:0,
    limit_deny:0,
    sock: null,
    timeid: 0,
    page:{page_no:1, page_size:50},
    connect: function(){
        //WEB_SOCKET_DEBUG = true;
        WEB_SOCKET_SWF_LOCATION = "js/WebSocketMain.swf";
        chat.sock = new WebSocket('ws://'+addr+'/chat?userid='+yihaoT.user.userid+'&token='+yihaoT.user.token);
        chat.sock.onopen = function() {
            console.log('chat open:'+new Date().Format('yyyy-MM-dd HH:mm:ss'));
            $('.chat-load').hide();
            chat.update_total();
            if(chat.timeid){
                window.clearInterval(chat.timeid);
                chat.timeid = 0;
            }
            chat.timeid = setInterval('chat.update_total()', 30000);
            util.ajax('get', '/chat/lastmsg',{}, function(datas, status){
                chat.gen_near_history(datas.data);
            });
        }
        chat.sock.onclose = function(e) {
            var code = '';
            console.log('chat close:'+new Date().Format('yyyy-MM-dd HH:mm:ss'));
            console.log(e.code+':'+e.reason);
            if(yihaoT.user.userid){
                code = '<p>您已从聊天室断开</p><p>可能您在其他地方登录</p><a class="btn btn-default" id="chat-connect">重新连接</a>';
                $('.chat-load').html(code).show();
            }
            $('.face .clear-msg').click();
            $('#chat-connect').click(function(){
                var code = '<img src="img/load.gif"><p>正在连接聊天室...</p>';
                $('.chat-load').html(code);
                chat.connect();
            });
        }
        chat.sock.onmessage = function(e) {
            var msg = JSON.parse(e.data);
            if(msg.userid == yihaoT.user.userid){
                $('.load').hide();
            }else{
                var code = chat.gen_other_msg(msg);
                $(code).appendTo('.msg-list');
                yihaoT.scroll_bar('.chat-msg');
                $('.chat-msg .jspPane').css({'top':$('.chat-msg').height() - $('.msg-list').height() - 20})
            }
        }
    },
    close: function(){
        console.log('I close the web-socket');
        chat.sock && chat.sock.close();
    },
    update_total: function(){
        util.ajax('get', '/chat/total', {}, function(datas, status){
            chat.deny = datas.data.deny_chat;
            chat.limit_deny = datas.data.deny_sec;

            if(yihaoT.user.userid && yihaoT.user.manager) {
                $('#badge-manager').show();

                if($(window).width() >= 1300)
                {
                    $('.online-users h5').css('width', '49%');
                } else {
                    $('.online-users h5').css('width', '48%');
                } 

                $('#badge-member .badge').text(datas.data.members); 
                $('#badge-manager .badge').text(datas.data.managerOnline);

                var manager = yihaoT.user.manager;

                $('.manager-box .user-list #manager-nickname').text(manager.nickname);
                $('.manager-box .user-list #manager-phone').text(manager.telephone);
                $('.manager-box .user-list #manager-qq').text(manager.qq);
                $('.whisper-header-box #manager-nickname').text(manager.nickname + ' - 我的经纪人');
                $('.whisper-info-box #manager-phone').text(manager.telephone);
                $('.whisper-info-box #manager-qq').text(manager.qq);

                $('.whisper-info-box #whisper_launch_qq').attr('href', 'http://wpa.qq.com/msgrd?v=3&uin=' + manager.qq + '&site=qq&menu=yes');
                //BizQQWPA.addCustom({aty: '0', a: '0', nameAccount: manager.qq, selector: 'whisper_launch_qq'});

            } else {
                $('#badge-manager').hide();
                $('.online-users h5').css('width', '100%');

                $('#badge-member .badge').text(datas.data.members);

                $('#whisper-win').hide();
                $('#badge-member').click();
            }

            $('.data-online').html('在线人数：'+datas.data.total);
            util.ajax('get', '/chat/users', {}, function(datas, status){
                chat.gen_user_list(datas.data);
            });
        });
    },
    gen_user_list: function(users){
        var code = '';
        for (var i in users){
            var user = users[i];
            code += '<li class="online-li" title="'+user.nickname+'"><img src="'+user.avatar+'"><span class="li-nickname">'+user.nickname+'</span>';
            code += '<img class="level-img" src="level/LV'+user.level+'.png"></li>';
        }
        $('.user-box .user-list').html(code);
        yihaoT.scroll_bar('.user-box');
    },
    gen_near_history: function(datas){
        var msglist = [], $msglist = $('.msg-list');
        for(var i=datas.length - 1; i >=0; i--){
            var msg = datas[i], code = '';
            if(msg.userid == yihaoT.user.userid){
                code = chat.gen_self_msg(msg, false);
            }else{
                code = chat.gen_other_msg(msg);
            }
            msglist.push(code);
        }
        msglist.push('<div class="history-hr">以上最近消息</div>');
        $msglist.html( msglist.join(''));
        yihaoT.scroll_bar('.chat-msg');
        $('.chat-msg .jspPane').css({'top':$('.chat-msg').height() - $('.msg-list').height() - 20});
    },
    gen_all_history: function(datas){
        var msglist = [], historylist = $('.history-list');
        for(var i in datas){
            var msg = datas[i], code = '';
            if(msg.userid == yihaoT.user.userid){
                code = chat.gen_self_msg(msg, false);
            }else{
                code = chat.gen_other_msg(msg);
            }
            msglist.push(code);
        }
        historylist.append(msglist.join(''));
    },
    gen_other_msg: function(msg){
        var code = '<div class="other-msg"><div class="msg-user"><img src="'+msg.avatar+'"><p><span class="chat-time">';
        code += msg.CreateTime+'</span><span class="nickname">'+msg.nickname+'</span></p></div><div class="msg-box">';
        code += '<div class="msg-arrow"></div><div class="msg">'+unescape(msg.content)+'</div></div></div>';
        return code;
    },
    gen_private_msg: function(msg){
        var code = '<div class="other-msg"><div class="msg-user"><span class="nickname">'+msg.nickname+'</span>';
        code += '&nbsp;&nbsp;&nbsp;&nbsp;<span class="chat-time">'+msg.CreateTime+'</span></div><div class="msg-box">';
        code += '<div class="msg-arrow"></div><div class="msg">'+unescape(msg.content)+'</div></div></div>';
        return code;
    },      
    gen_self_msg: function(msg, isload){
        var user = yihaoT.user;
        var now = isload ? new Date().Format('yyyy-MM-dd HH:mm:ss') : msg.CreateTime;
        var code = '<div class="self-msg"><div class="msg-user"><img src="'+user.basic.avatar+'"><p><span class="chat-time">';
        code += now+'</span><span class="nickname">'+user.basic.nickname+'</span></p></div><div class="msg-box">';
        code += '<div class="msg-arrow"></div><div class="msg">'+unescape(msg.content)+'</div></div>';
        if(isload)
            code += '<div class="load"><img src="img/load.gif"></div></div>';
        else
            code += '</div>';
        return code;
    },
    gen_self_private_msg: function(msg, isload){
        var user = yihaoT.user;
        var now = isload ? new Date().Format('yyyy-MM-dd HH:mm:ss') : msg.CreateTime;
        var code = '<div class="self-msg"><div class="msg-user" style="text-align:right"><span class="chat-time">';
        code += now+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="nickname">'+user.basic.nickname+'</span></div><div class="msg-box">';
        code += '<div class="msg-arrow"></div><div class="msg">'+unescape(msg.content)+'</div></div>';
        code += '</div>';
        return code;
    },
    add_self_msg: function(content){
        var msg = {
            "userid":yihaoT.user.userid,
            "type":"room",
            "content":escape(content)
        };
        var code = chat.gen_self_msg(msg, true);
        $(code).appendTo('.msg-list');
        yihaoT.scroll_bar('.chat-msg');
        $('.chat-msg .jspPane').css({'top':$('.chat-msg').height() - $('.msg-list').height() - 20})
        chat.sock.send(JSON.stringify(msg));
    },
    add_self_private_msg: function(content){
        var msg = {
            "userid":yihaoT.user.userid,
            "type":"room",
            "content":escape(content)
        };

        //$('#whisper-win .chat-msg .jspPane').css({'top':$('#whisper-win .chat-msg').height() - $('#whisper-win .private-msg-list').height() - 20});
        //chat.sock.send(JSON.stringify(msg));

        util.ajax('post', '/chat/sendmanagermsg', { managerId: yihaoT.user.manager.id, content: escape(content) }, function(datas, status){
            if(datas.code == 0) {
                var code = chat.gen_self_private_msg(msg, true);
                $(code).appendTo('#whisper-win .private-msg-list');
                yihaoT.scroll_bar('#whisper-win .chat-msg');
            }
            else {

            }
        })

        // dev only
        // var code = chat.gen_private_msg({ nickname: yihaoT.user.manager.nickname, CreateTime: '', content: '聊天服务器维护中，暂时请通过QQ联系我哦。' });
        // $(code).appendTo('#whisper-win .private-msg-list');
        // yihaoT.scroll_bar('#whisper-win .chat-msg');
    },
    get_history: function(page){
        var _data = {'userid':yihaoT.user.userid, 'token':yihaoT.user.token}
        data = $.extend(page, _data);
        $.ajax({
            type:'get',
            url :util.pre_url + '/chat/historymsg',
            data:data,
            success: function(datas, status){
                if(datas.code == 0){
                    chat.gen_all_history(datas.data.msg);
                    if(datas.data.msg.length > 0){
                        chat.page.page_no++;
                    }
                }
            },
            error: function(status) {
                util.alert("无法连接网络，请check网络连接和服务器");
                return false;
            }
        });
    },
    heart_beat: function(){
        var msg = {
            "userid":yihaoT.user.userid || 0,
            "type":"hb",
            "content":'~'
        };
        chat.sock.send(JSON.stringify(msg));
    },
    load: function(){
        $('#send').on('click', function(){
            !chat.sock && chat.connect();
            var texts = $('.send-textarea');
            if(!yihaoT.user.userid){
                $('#send-tip').html('提示：登录后才能发言哦~');
                setTimeout('$("#send-tip").html("");', 2000);
                $('#to-login').click();
                return;
            }
            if(chat.deny != 0){
                $('#send-tip').html('提示：您已被禁言、请联系客服~');
                setTimeout('$("#send-tip").html("");', 2000);
                return;
            }
            if(chat.limit_deny != 0){
                $('#send-tip').html('提示：您被限制发言'+chat.formatSeconds(chat.limit_deny)+'、请联系客服');
                setTimeout('$("#send-tip").html("");', 2000);
                return;
            }
            var content = $('.send-textarea').html().replace(/<(?!img).*?>/ig, "");
            if(!content){
                $('#send-tip').html('提示：消息不能为空哦~');
                setTimeout('$("#send-tip").html("");', 1000);
                return;
            }
            texts.html('');
            texts.focus();
            chat.add_self_msg(content);
        });
        $('.send-textarea').keydown(function(event){
            if($(this).is(':focus') && event.keyCode == 13){
                $('#send').click();
            }
        })

        // chat
        $('.right-bar .face .biaoqing').click(function(event){
            if($('.right-bar .face-list').is(':hidden')){
                $(this).css({'background-position': '-20px -20px'});
                $('.right-bar .face-list').css({'top':event.clientY - 195 - 10, 'right':10});
                $('.right-bar .face-list').fadeIn(200);
                if(!$('.face-list').html()){
                    for(var i = 1; i <= 75; i++){
                        $('.right-bar .face-list').append('<li><img src="./face/'+i+'.gif" /></li>');
                    }
                    $('.right-bar .face-list li').click(function(){
                        $('.right-bar .send-textarea').append($(this).html());
                        $('.right-bar .send-textarea').focus();
                    });
                }
            }else{
                $(this).css({'background-position': '0px -20px'});
                $('.right-bar .face-list').fadeOut(200);
            }
        });
        $('.right-bar .face .clear-msg').click(function(){
            $('.right-bar .msg-list').html('');
        });
        $('.right-bar .face .history-msg').click(function(){
            if($('.right-bar .history-box').height()<10){
                chat.get_history(chat.page);
                $(this).css({'color':'#00a0ff'});
                $('.right-bar  .history-box').animate({'height':400}, 200);
            }else{
                $(this).css({'color':'#A0A0A0'});
                $('.right-bar .history-box').animate({'height':0}, 200);
            }
        });
        $('.right-bar .history-list').scroll(function(){
            if($(this).scrollTop()+$(this).height()+10 == $(this)[0].scrollHeight)
                chat.get_history(chat.page);
        });

        // whisper
        $('#whisper-win .face .biaoqing').click(function(event){
            if($('#whisper-win .face-list').is(':hidden')){
                $(this).css({'background-position': '-20px -20px'});
                
                $('#whisper-win .face-list').css({'top':$(this).offset().top - 180 - 10, 'left': $(this).offset().left - 10 });
                $('#whisper-win .face-list').fadeIn(200);
                if(!$('#whisper-win .face-list').html()){
                    for(var i = 1; i <= 75; i++){
                        $('#whisper-win .face-list').append('<li><img src="./face/'+i+'.gif" /></li>');
                    }
                    $('#whisper-win .face-list li').click(function(){
                        $('#whisper-win .private-send-textarea').append($(this).html());
                        $('#whisper-win .private-send-textarea').focus();
                    });
                }
            }else{
                $(this).css({'background-position': '0px -20px'});
                $('#whisper-win .face-list').fadeOut(200);
            }
        });
        $('#whisper-win .face .clear-msg').click(function(){
            $('#whisper-win .private-msg-list').html('');
        });

        $('#badge-member').click(function(){
            $(this).addClass('active');
            $('#badge-manager').removeClass('active');

            $('.user-box').show();
            $('.manager-box').hide();
        });
        $('#badge-manager').click(function(){
            $(this).addClass('active');
            $('#badge-member').removeClass('active');

            $('.manager-box').show();
            $('.user-box').hide();
        });

        $('#badge-manager').click(function(){
            $('#whisper-win').fadeIn(300);
            yihaoT.scroll_bar('#whisper-win .chat-msg');

            chat.load_pm();
        });
        $('.manager-box .user-list li').click(function(){
            $('#whisper-win').fadeIn(300);
            yihaoT.scroll_bar('#whisper-win .chat-msg');

            chat.load_pm();
        });
        $('#whisper-win .whisper-header-box .manager-x').click(function(){
            $('#whisper-win').fadeOut(300);

            chat.unload_pm();
        });

        $('#whisper-win #private-send').click(function(){
            var texts = $('.private-send-textarea');

            if(!yihaoT.user.userid){
                $('#whisper-win #send-tip').html('提示：登录后才能发言哦~');
                setTimeout('$("#whisper-win #send-tip").html("");', 2000);
                $('#to-login').click();
                return;
            }
            var content = $('.private-send-textarea').html().replace(/<(?!img).*?>/ig, "");
            if(!content){
                $('#whisper-win #send-tip').html('提示：消息不能为空哦~');
                setTimeout('$("#whisper-win #send-tip").html("");', 1000);
                return;
            }
            texts.html('');
            texts.focus();
            chat.add_self_private_msg(content); 
        });
        $('.private-send-textarea').keydown(function(event){
            if($(this).is(':focus') && event.keyCode == 13){
                $('#whisper-win #private-send').click();
            }
        });
        
        setInterval('chat.heart_beat();', 60*1000);
    },
    timer_load_pm: null,
    unload_pm: function() {
        if(this.timer_load_pm)
        {
            clearInterval(this.timer_load_pm);
        }
    },
    load_pm: function() {

        this.timer_load_pm = this.setIntervalAndExecute(function(){ 

            util.ajax('get', '/chat/getmanagermsg',{ userid: yihaoT.user.manager.id  }, function(datas, status) {
                if(datas.code == 0) {

                    var html = '';
                    var data = datas.data;

                    if(data.length == 0)
                    {
                        html += chat.gen_private_msg({ nickname: yihaoT.user.manager.nickname, CreateTime: '', content: '易号财经直播室欢迎你的到来, 如有需要帮助请联系我!' });     
                    }

                    $.each(data, function(i, item) {

                        if(item.type == 1)
                        {
                            var msg = {
                                "userid":yihaoT.user.userid,
                                "type":"room",
                                "content":escape(item.content),
                                "CreateTime": item.create_time
                            };

                            html += chat.gen_self_private_msg(msg, false);
                        }
                        else
                        {
                            html += chat.gen_private_msg({ nickname: yihaoT.user.manager.nickname, CreateTime: item.create_time, content: item.content });
                        }
                    });

                    $('#whisper-win .private-msg-list').html('');
                    $('#whisper-win .private-msg-list').append(html);

                    yihaoT.scroll_bar('#whisper-win .chat-msg');

                } else {
                    
                }
            });
            
        }, 5000);
    },
    setIntervalAndExecute: function(fn, t) {
        fn();
        return (setInterval(fn, t));
    },
    formatSeconds: function(value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if(theTime > 60) {
            theTime1 = parseInt(theTime/60);
            theTime = parseInt(theTime%60);
                if(theTime1 > 60) {
                theTime2 = parseInt(theTime1/60);
                theTime1 = parseInt(theTime1%60);
                }
        }
            var result = ""+parseInt(theTime)+"秒";
            if(theTime1 > 0) {
            result = ""+parseInt(theTime1)+"分"+result;
            }
            if(theTime2 > 0) {
            result = ""+parseInt(theTime2)+"小时"+result;
            }
        return result;
    },
};

$(document).ready(function(){
    chat.load();
    $(document).click(function(e){
        e = window.event || e;
        var obj = e.srcElement || e.target;
        if(!$(obj).is(".biaoqing")) {
            $(".biaoqing").css({'background-position': '0px -20px'});
            $('.face-list').fadeOut(200);
        }
    })
})
