var member = {
    pages : {
        page:1,
        limit:20
    },
    load:function(){
        $('#member-team').change(function(){
            var team_id = $(this).val();
            member.gen_manager_opt('member-manager', {team_id:team_id || 0}, function(){
                $('#member-manager').prepend('<option value="0">请选择</option>');
                $('#member-manager').val('0');
            })
        });
        $('#member-depart').change(function(){
            var depart_id = $(this).val();
            member.gen_team_opt('member-team', {depart_id:depart_id || 0}, function(){
                $('#member-team').prepend('<option value="0">请选择</option>');
                $('#member-team').val('0');
            })
        })
        $('#member-agent').change(function(){
            var agent_id = $(this).val();
            member.gen_depart_opt('member-depart', {agent_id:agent_id || 0}, function(){
                $('#member-depart').prepend('<option value="0">请选择</option>');
                $('#member-depart').val('0');
            })
        });
        this.gen_agent_opt('member-agent', function(){
            $('#member-agent').prepend('<option value="0">请选择</option>');
            $('#member-agent').val('0');
        });
    },
    gen_agent_opt: function(id, callback){
        var $id = $('#'+id)
        util.ajax('get', '/user/get_member_agent', {}, function(datas, status){
            var opts = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(opts.join(''));
            callback && callback();
            $id.change();
        })
    },
    gen_depart_opt: function(id, data, callback){
        var $id = $('#'+id);
        util.ajax('get', '/user/get_member_depart',data, function(datas, status){
            var opts = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(opts.join(''));
            callback && callback();
            $id.change();
        })
    },
    gen_team_opt: function(id, data, callback){
        var $id = $('#'+id);
        util.ajax('get', '/user/get_member_team', data, function(datas, status){
            var opts = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(opts.join(''));
            callback && callback();
            $id.change();
        })
    },
    gen_manager_opt: function(id, data, callback){
        var $id = $('#'+id);
        util.ajax('get', '/user/get_member_manager', data, function(datas, status){
            var opts = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(opts.join(''));
            callback && callback();
        })
    },
    flash: function(mbs, total){
        var mb_list = [];
        for (var i in mbs){
            var mb = mbs[i], deny = mb.deny == 0 ? '<a class="ok"  data-id="'+mb.id+'" data-type="0"><i class="icon-ok"></i></a>' : '<a  data-id="'+mb.id+'"  data-type="0" class="ban"><i class="icon-ban-circle"></i></a>';
            var deny_chat = mb.deny_chat == 0 ? '<a  data-id="'+mb.id+'" class="ok"  data-type="1"><i class="icon-ok"></i></a>' : '<a  data-id="'+mb.id+'"  data-type="1" class="ban"><i class="icon-ban-circle"></i></a>';
            var dsec = mb.deny_sec ? member.formatSeconds(mb.deny_sec) : '';
            var limit_deny = '<a  data-id="'+mb.id+'" class="limit"><i class="icon-time"></i><br>'+dsec+'</a>'
            var code = '<tr>', manager = mb.manager || '未分配', ip = mb.ip || '';
            code+='<td>'+mb.id+'</td><td>'+mb.username+'</td><td>'+mb.nick+'</td><td>'+mb.phone+'</td><td>'+mb.qq+'</td><td>'+mb.level+'</td><td>'+mb.agent+'</td><td>'+mb.depart+'</td><td>'+mb.team+'</td><td>'+manager+'</td>';
            code += '<td>'+mb.create_time+'</td><td>'+mb.last_time+'</td><td>'+ip+'</td><td>'+mb.online_time+'</td><td>'+deny+'</td><td>'+deny_chat+'</td><td>'+limit_deny+'</td>';
            code += '<td class="text-left" data-id="'+mb.id+'"><a href="javascript:;" class="mb-edit"><i class="icon-pencil"></i></a><a href="javascript:;" class="mb-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
            mb_list.push(code);
        }
        $('#mb-list').html(mb_list.join(''));
        page_list = util.paging(total, member.pages, 'member-left', 'member-right');
        $('#member-page').html(page_list.join(''));
        member.op();
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">用户名</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-username" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">昵称</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-nick" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">手机号码</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-phone" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">QQ号</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-qq" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">等级</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-level" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">归属公司</label><div class="col-lg-9">';
        code += '<select id="mb-agent" class="form-control"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">归属部门</label><div class="col-lg-9">';
        code += '<select id="mb-depart" class="form-control"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">归属团队</label><div class="col-lg-9">';
        code += '<select id="mb-team" class="form-control"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">客户经理</label><div class="col-lg-9">';
        code += '<select id="mb-manager" class="form-control"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">禁止发言</label><div class="col-lg-9">';
        code += '<label class="radio-custom"><input type="radio" name="mb-chat" value="1"> 是</label> &nbsp;&nbsp;&nbsp;&nbsp;';
        code += '<label class="radio-custom"><input type="radio" name="mb-chat" value="0"> 否</label></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">禁止登录</label><div class="col-lg-9">';
        code += '<label class="radio-custom"><input type="radio" name="mb-deny" value="1"> 是</label> &nbsp;&nbsp;&nbsp;&nbsp;';
        code += '<label class="radio-custom"><input type="radio" name="mb-deny" value="0"> 否</label></div></div>';
        code += '</section>';
        return code;
    },
    gen_limit_code: function(){
        var code = '<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-3 control-label">禁言到期时间</label><div class="col-lg-8">';
        code += '<input type="text" readonly id="mb-limit-deny" data-required="true" class="form-control parsley-validated" onclick="laydate({format: \'YYYY/MM/DD hh:mm:ss\',istime: true, elem:\'#mb-limit-deny\', min: laydate.now()})"';
        code +='></div></div><div class="form-group"><label class="col-lg-3 control-label">剩余禁言时间</label>';
        code += '<label id="mb-deny-sec"  class="col-lg-3 control-label" style="text-align:left"></label></div>';
        code +='<div class="form-group"><label class="col-lg-3 control-label">立即解禁</label><div class="col-lg-8">';
        code += '<a href="#" id="mb-deny-cancel" class="btn btn-white btn-small">立即解禁</a></div></div></section>';
        return code;
    },
    gen_all_deny_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">时间段1</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time1" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段2</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time2" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段3</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time3" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段4</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time4" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段5</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time5" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段6</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time6" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段7</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time7" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段8</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time8" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段9</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time9" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">时间段10</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-time10" placeholder="格式：hh:mm-hh:mm" data-required="true" class="form-control parsley-validated"></div></div>';
        code += '</section>';
        return code;
    },
    get: function(){
        var data = {
            agent_id: $('#member-agent').val() || 0,
            depart_id:$('#member-depart').val() || 0,
            team_id: $('#member-team').val() || 0,
            manager_id:$('#member-manager').val() || 0,
            username: $('#member-user').val() || '',
            nickname: $('#member-nick').val() || '',
            phone: $('#member-phone').val() || '',
            qq: $('#member-qq').val() || ''
        };
        for (var i in data){
            if (data[i]){
                $.extend(data, member.pages);
                util.ajax('get', '/user/search_members', data, function(datas, status){
                     member.flash(datas.data.members, datas.data.total);
                });
                return;
            }
        }
        util.ajax('get', '/user/get_members', member.pages, function(datas, status){
            member.flash(datas.data.members, datas.data.total);
        });
        return;
    },
    get_deny_all: function(){
        $('#deny-all-time').text('禁言时间段:');
        util.ajax('get', '/user/get_deny_all', {}, function(datas, status){
            $('#deny-all-time').text('禁言时间段:'+datas.data.timestr.split('|').join(' | '));
        })
    },
    set_deny_all: function(){
        var timestr = [];
        for (var i = 1; i<=10; i++){
            var str = util.get_val('mb-time'+i);
            if (!str) continue;
            timestr.push(str.replace(' ', ''));
        }
        var data = {period: timestr.join('|')};
        util.ajax('get', '/user/deny_all_chat', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('设置成功');
            member.get_deny_all();
        })
    },
    del: function(id){
        util.ajax('get', '/user/del_member',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            member.get();
        })
    },
    update: function(id){
        var data = {
            id      : id,
            username: $('#mb-username').val(),
            nick    : $('#mb-nick').val(),
            phone   : $('#mb-phone').val(),
            qq      : $('#mb-qq').val(),
            level   : $('#mb-level').val(),
            manager : $('#mb-manager').val(),
            agent   : $('#mb-agent').val(),
            deny    : $("input[name=mb-deny]:checked").val(),
            deny_chat:$("input[name=mb-chat]:checked").val()
        };
        util.ajax('post', '/user/save_member', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新 <strong style="color:red">'+data.username+'</strong>信息 成功');
            member.get();
        })
    },
    limit_chat: function(id){
        var dstr = $('#mb-limit-deny').val();
        if(!dstr){
            util.alert('请选择禁言到期时间');
            return;
        }
        var set_date = new Date(dstr), now_date = new Date();        
        var sec = set_date.getTime() - now_date.getTime();
        sec = parseInt(sec / 1000);
        if(sec < 0){
            util.alert('限制发言时间设置不能小于当前时间' );
            return;
        }
        var data = {userid:id, deny_sec: sec};
        util.ajax('get', '/user/deny_chat', data, function(datas,status){
            $('#cancel-btn').click();
            member.get();
            util.alert('设置用户禁止发言成功，限制时长为 <strong style="color:red">'+member.formatSeconds(sec)+'</strong>');
        })
    },
    op: function(){
        $('#deny-timestr').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = member.gen_all_deny_code();
            util.dialog('设置禁言时间段', code, function(){
                member.set_deny_all();
            }, function(){
                util.ajax('get', '/user/get_deny_all', {}, function(datas, status){
                    var times = datas.data.timestr.split('|');
                    for (var i = 1; i <= times.length; i++){
                        $('#mb-time'+i).val(times[i-1]);
                    }
                }) 
            });
            
        });
        $('.mb-edit').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = member.gen_edit_code();
            var id = $(this).parent().attr('data-id');
            console.log(id);
            util.dialog('更新会员信息', code, function(){
                member.update(id);
            }, function(){
                util.ajax('get', '/user/get_one_member', {id:id}, function(datas, status){
                    var mb = datas.data.member;
                    $('#mb-username').val(mb.username);
                    $('#mb-nick').val(mb.nick);
                    $('#mb-phone').val(mb.phone);
                    $('#mb-qq').val(mb.qq);
                    $('#mb-level').val(mb.level);
                    $("input[name=mb-deny][value="+mb.deny+"]").attr("checked",'checked');
                    $("input[name=mb-chat][value="+mb.deny_chat+"]").attr("checked",'checked');
                    $('#mb-team').change(function(){
                        var team_id = $(this).val();
                        member.gen_manager_opt('mb-manager', {team_id:team_id || 0}, function(){
                            $('#mb-manager').prepend('<option value="0">请选择</option>');
                            $('#mb-manager').val(mb.manager);
                        })
                    });
                    $('#mb-depart').change(function(){
                        var depart_id = $(this).val();
                        member.gen_team_opt('mb-team', {depart_id:depart_id || 0}, function(){
                            $('#mb-team').prepend('<option value="0">请选择</option>');
                            $('#mb-team').val(mb.team);
                        })
                    })
                    $('#mb-agent').change(function(){
                        var agent_id = $(this).val();
                        member.gen_depart_opt('mb-depart', {agent_id:agent_id || 0}, function(){
                            $('#mb-depart').prepend('<option value="0">请选择</option>');
                            $('#mb-depart').val(mb.depart);
                        })
                    });
                    member.gen_agent_opt('mb-agent', function(){
                        $('#mb-agent').val(mb.agent);
                        $('#mb-agent').change();
                    });

                });
            });
        });
        $('.mb-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var code = '您在进行删除<strong>一个会员信息</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除会员', code, function(){
                member.del(id);
            });
        });
        $('#member-left').click(function(){
            if(member.pages.page <= 1)
                return;
            member.pages.page--;
            member.get();
        })
        $('#member-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(member.pages.page >= maxnum)
                return;
            member.pages.page++;
            member.get();
        });
        $('#member-page li a').click(function(){
            if($(this).attr('id') == 'member-right' || $(this).attr('id') == 'member-left')
                return;
            var page = $(this).text();
            member.pages.page = page;
            member.get();
        });
        $('#member-search').click(function(){
            member.pages.page = 1;
            member.get();
        });
        $('.ok').click(function(){
            var id = $(this).attr('data-id'), type = $(this).attr('data-type');
            var data = {id:id, type:type, deny:1};
            util.ajax('get', '/user/update_deny', data, function(datas,stats){
                member.get();
            })
        });
        $('.ban').click(function(){
            var id = $(this).attr('data-id'), type = $(this).attr('data-type');
            var data = {id:id, type:type, deny:0};
            util.ajax('get', '/user/update_deny', data, function(datas,stats){
                member.get();
            })
        });
        $('.limit').click(function(){
            var id = $(this).attr('data-id'), code = member.gen_limit_code();
            util.dialog('禁言时间设置', code, function(){
                member.limit_chat(id);
            }, function(){
                util.ajax('get', '/user/deny_sec', {userid:id}, function(datas, status){
                    var shijiancha = datas.data.deny_sec;
                    member.get();
                    $('#mb-deny-sec').html(member.formatSeconds(shijiancha));
                });
                $('#mb-deny-cancel').click(function(){
                    util.ajax('get', '/user/undeny_chat', {userid:id}, function(datas, status){
                        $('#cancel-btn').click();
                        member.get();
                        util.alert('取消用户禁止发言成功');
                        return;
                    })
                });
            })
        });
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
    init: function(){
        this.get();
        this.get_deny_all();
        this.load();
    }
};

$(document).ready(function(){
    member.init();
});
