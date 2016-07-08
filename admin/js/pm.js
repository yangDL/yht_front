var pm = {   
    current_userid: 0,
    current_user_avatar: '',
    current_user_nickname: '',
    timer_refresh_list: null,
    timer_refresh_message: null,
    first_load: true,
    get: function(){
        util.load();

        this.load_list();
        this.timer_refresh_list = setInterval(function(){ 
            pm.load_list();
        }, 5000);
    },
    load_list: function(){

        util.ajax('get', '/admin/get_chat_users',{ }, function(datas, status){
            if(datas.code == 0) {

                // <li class="new">
                //     <div>
                //         <img class="avatar" src="http://i1.dpfile.com/s/img/uc/peach120c120.png">
                //         <span class="username">会员昵称</span>
                //         <span class="time">06:02</span> 
                //     </div>
                // </li>

                var html = '';
                var data = datas.data;
                $.each(data, function(i, item) {

                    if(pm.current_userid == 0)
                    {
                        pm.current_userid = item.userid;
                        pm.current_user_avatar = item.avatar;
                        pm.current_user_nickname = item.nickname;
                    }

                    html += '<li data-id="' + item.userid + '" data-avatar="' + item.avatar + '" data-nickname="' + item.nickname + '" class="new">';
                    html += '    <div>';
                    html += '        <img class="avatar" src="' + item.avatar  + '">';
                    html += '        <span class="username">' + item.nickname  + '</span>';
                    html += '        <span class="time">' + item.create_time  + '</span> ';
                    html += '    </div>';
                    html += '</li>';

                });

                $('#pm_list_body ul').html('');
                $('#pm_list_body ul').append(html);
                $('#pm_list_body ul li').click(function(){

                    var userid = $(this).attr('data-id');

                    pm.current_userid = userid;
                    pm.current_user_avatar = $(this).attr('data-avatar');
                    pm.current_user_nickname = $(this).attr('data-nickname');

                    pm.load_message(userid);
                    pm.load_userinfo(userid);

                    if(pm.timer_refresh_message)
                    {
                        clearInterval(pm.timer_refresh_message);
                    }

                    pm.timer_refresh_message = setInterval(function(){ 
                        pm.load_message(userid);
                    }, 3000);
                });

                if(pm.first_load)
                {
                    pm.first_load = false;
                    $('#pm_list_body ul li').first().click();
                }

            } else {
                util.alert("系统错误 代码：" + datas.code + ' ' + datas.msg);
            }
        });

    },
    load_message: function(userid){
        console.log('load_message');
        
        util.ajax('get', '/admin/get_chat_msg',{ userid: this.current_userid }, function(datas, status){
            if(datas.code == 0) {

                // <div class="other-msg">
                //     <div class="msg-user">
                //         <img src="http://i1.dpfile.com/s/img/uc/kiwi120c120.png">
                //         <p>
                //             <span class="chat-time">2016-07-04 16:12:37</span><span class="nickname">YHTQHB001</span>
                //         </p>
                //     </div>
                //     <div class="msg-box">
                //         <div class="msg-arrow"></div>
                //         <div class="msg">哇塞 讲的好详细！</div>
                //     </div>
                // </div>

                var html = '';
                var data = datas.data;
                $.each(data, function(i, item) {

                    if(item.type == 1)
                    {
                        html += '<div class="other-msg">';
                        html += '    <div class="msg-user">';
                        html += '        <img src="' + pm.current_user_avatar + '">';
                        html += '        <p>';
                        html += '            <span class="chat-time">' + item.create_time + '</span><span class="nickname">' + pm.current_user_nickname + '</span>';
                        html += '        </p>';
                        html += '    </div>';
                        html += '    <div class="msg-box">';
                        html += '        <div class="msg-arrow"></div>';
                        html += '        <div class="msg">' + item.content + '</div>';
                        html += '    </div>';
                        html += '</div>';
                    }
                    else
                    {
                        html += '<div class="self-msg">';
                        html += '    <div class="msg-user">';
                        html += '        <p>';
                        html += '            <span class="chat-time">' + item.create_time + '</span>';
                        html += '        </p>';
                        html += '    </div>';
                        html += '    <div class="msg-box">';
                        html += '        <div class="msg-arrow"></div>';
                        html += '        <div class="msg">' + item.content + '</div>';
                        html += '    </div>';
                        html += '</div>';
                    }

                });

                $('#pm_chat_body .msg-list').html('');
                $('#pm_chat_body .msg-list').append(html);

                $('#pm_chat_body .send-box').show();
                $('#pm_chat_body #send').unbind('click').click(function(){
                    
                    var content = $('#pm_chat_body .send-textarea').html().replace(/<(?!img).*?>/ig, "");
                    if(!content){
                        util.alert('提示：消息不能为空哦~');
                        return;
                    }
                    
                    util.ajax('post', '/admin/send_chat_msg', { userid: pm.current_userid, content: escape(content) }, function(datas, status){
                        if(datas.code == 0) {

                            $('#pm_chat_body .send-textarea').html('');

                            var html2 = '';
                            html2 += '<div class="self-msg">';
                            html2 += '    <div class="msg-box">';
                            html2 += '        <div class="msg-arrow"></div>';
                            html2 += '        <div class="msg">' + escape(content) + '</div>';
                            html2 += '    </div>';
                            html2 += '</div>';

                            $('#pm_chat_body .msg-list').append(html2);
                        }
                        else {
                            util.alert("系统错误 代码：" + datas.code + ' ' + datas.msg);
                        }
                    });

                });


            } else {
                util.alert("系统错误 代码：" + datas.code + ' ' + datas.msg);
            }
        });
    },
    load_userinfo: function(userid){
        console.log('load_userinfo');

        util.ajax('get', '/user/get_one_member',{ id: this.current_userid }, function(datas, status){

            if(datas.code == 0) {

                $('#pm_userinfo_body .uinfo_username').text('');
                $('#pm_userinfo_body .uinfo_nickname').text('');
                $('#pm_userinfo_body .uinfo_phone').text('');
                $('#pm_userinfo_body .uinfo_qq').text('');
                $('#pm_userinfo_body .uinfo_ag_1').text('');
                $('#pm_userinfo_body .uinfo_ag_2').text('');
                $('#pm_userinfo_body .uinfo_ag_3').text('');
                $('#pm_userinfo_body .uinfo_regip').text('');
                $('#pm_userinfo_body .uinfo_lasttime').text('');
                $('#pm_userinfo_body .uinfo_lastip').text('');
                $('#pm_userinfo_body .uinfo_onlinetime').text('');

                var data = datas.data;
                $('#pm_userinfo_body .uinfo_username').text(data.member.username);
                $('#pm_userinfo_body .uinfo_nickname').text(data.member.nick);
                $('#pm_userinfo_body .uinfo_phone').text(data.member.phone);
                $('#pm_userinfo_body .uinfo_qq').text(data.member.qq);
                $('#pm_userinfo_body .uinfo_ag_1').text(data.agents[0].name);
                $('#pm_userinfo_body .uinfo_ag_2').text(data.agents[1].name);
                $('#pm_userinfo_body .uinfo_ag_3').text(data.agents[2].name);
                $('#pm_userinfo_body .uinfo_regip').text(data.member.create_time);
                $('#pm_userinfo_body .uinfo_lasttime').text(data.member.last_time);
                $('#pm_userinfo_body .uinfo_lastip').text(data.member.last_ip);
                $('#pm_userinfo_body .uinfo_onlinetime').text(data.member.online_times + ' 分钟');

            } else {
                util.alert("系统错误 代码：" + datas.code + ' ' + datas.msg);
            }
        });
    },    
    init: function(){
        this.get();
    }
};

$(document).ready(function(){
    pm.init();
});