var adminer = {
    pages : {
        page:1,
        limit:20
    },
    gen_edit_code: function(is_update){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">用户名</label><div class="col-lg-9">';
        code += '<input type="text" id="username" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">昵称</label><div class="col-lg-9">';
        code += '<input type="text" id="nickname" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">手机</label><div class="col-lg-9">';
        code += '<input type="text" id="phone" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">QQ号</label><div class="col-lg-9">';
        code += '<input type="text" id="qq" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">密码</label><div class="col-lg-9">';
        if(!is_update){
            code += '<input type="text" id="passwd" data-required="true" class="form-control parsley-validated"></div></div>';

            code +='<div class="form-group"><label class="col-lg-2 control-label">管理组</label><div class="col-lg-9">';
            code += '<select id="group" class="form-control"></select></div></div>';
            
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
            code += '<select id="agent" class="form-control"></select></div></div>';

            code += '<div class="form-group"><label class="col-lg-2 control-label">所属部门</label><div class="col-lg-9">';
            code += '<select id="department" class="form-control"></select></div></div>';

            code += '<div class="form-group"><label class="col-lg-2 control-label">所属团队</label><div class="col-lg-9">';
            code += '<select id="team" class="form-control"></select></div></div>';
        }else{
            code += '<input type="text" id="passwd" placeholder="不填不修改" data-required="true" class="form-control parsley-validated"></div></div>';
        }
        
        code +='<div class="form-group"><label class="col-lg-2 control-label">备注</label><div class="col-lg-9">';
        code += '<input type="text" id="desc" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">会员权限</label><div class="col-lg-9">';
        code += '<label class="radio-custom"><input type="checkbox" name="member-right" value="see"> 查看</label> &nbsp;&nbsp;&nbsp;&nbsp;';
        code += '<label class="radio-custom"><input type="checkbox" name="member-right" value="edit"> 编辑</label> &nbsp;&nbsp;&nbsp;&nbsp;';
        code += '<label class="radio-custom"><input type="checkbox" name="member-right" value="del"> 删除</label></div></div>';
        code += '</section>';
        return code;
    },
    get: function(){
        var data = {
            group_id : $('#member-group').val() || 0,
            agent_id : $('#member-agent').val() || 0,
            depart_id: $('#member-depart').val() || 0,
            manager_id:$('#member-manager').val() || 0,
            username : $('#member-user').val() || ''
        };
        data = $.extend(data, adminer.pages);
        util.ajax('get', '/admin/get_user', data, function(datas, status){
            var mbs = datas.data.admins, total = datas.data.total, mb_list = [];
            for (var i in mbs){
                var mb = mbs[i], mrs = [];
                if(mb.mr && mb.mr[0] == '1') mrs.push('查看');
                if(mb.mr && mb.mr[1] == '1') mrs.push('编辑');
                if(mb.mr && mb.mr[2] == '1') mrs.push('删除');              
                var code = '<tr>', mbagent = mb.agent || '', mbdepart = mb.depart || '', mbteam = mb.team || '', mr = mrs.join(' ');
                var cr = mb.cr == 1 ? '<a class="ok"  data-id="'+mb.id+'"><i class="icon-ok"></i></a>' : '<a data-id="'+mb.id+'" class="ban"><i class="icon-ban-circle text-danger"></i></a>';
                code += '<td>'+mb.id+'</td><td>'+mb.user+'</td><td>'+mb.nick+'</td><td>'+mb.group+'</td><td>'+mbagent+'</td><td>'+mbdepart+'</td>';
                code += '<td>'+mbteam+'</td><td>http://zhibo.yht134.com/?m='+mb.id+'</td><td>'+mb.create_time+'</td><td>'+mb.last_time+'</td><td>'+mb.ip+'</td>';
                code += '<td>'+cr+'</td><td>'+mr+'</td>';
                code += '<td>'+mb.desc+'</td><td class="text-left" data-id="'+mb.id+'"><a href="javascript:;" class="mb-edit"><i class="icon-pencil"></i></a>'
                code += '<a href="javascript:;" class="mb-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                mb_list.push(code);
            }
            $('#adminer-list').html(mb_list.join(''));
            page_list = util.paging(total, adminer.pages, 'adminer-left', 'adminer-right');
            $('#adminer-page').html(page_list.join(''));
            adminer.op();
        })
    },
    
    del: function(id){
        if(util.user && util.user.admin_id == id){
            util.alert('自己不能删除自己的帐号，请重新确认');
            return;
        }
        util.ajax('get', '/admin/delete_user',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            adminer.get();
        })
    },
    update: function(id){
        var member_rights = [];
        $("input:checkbox[name='member-right']").each(function(){
            $(this).attr('checked') == 'checked' ? member_rights.push('1') : member_rights.push('0');
        });
        var data = {
            id:id,
            username: $('#username').val(),
            nickname: $('#nickname').val(),
            password: $('#passwd').val() || '',
            group_id: $('#group').val(),
            description: $('#desc').val() || '无',
            telephone:$('#phone').val(),
            qq:$('#qq').val(),
            member_right: member_rights.join('')
        };
        if(data.password) data.password = hex_md5(data.password);
        util.ajax('post', '/admin/modify_user', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新 <strong style="color:red">'+data.username+'</strong>信息 成功');
            adminer.get();
            if(util.user && util.user.admin_id == data.id && data.password){
                cache.remove('yihaoTong::admin::user');
                location.href = 'signin.html';
            }
        })
    },
    add: function(){
        var member_rights = [];
        $("input:checkbox[name='member-right']").each(function(){
            $(this).attr('checked') == 'checked' ? member_rights.push('1') : member_rights.push('0');
        });
        var data = {
            username: $('#username').val(),
            nickname: $('#nickname').val(),
            password: $('#passwd').val(),
            group_id: $('#group').val(),
            agent_id: $('#agent').val() || 0,
            depart_id: $('#department').val() || 0,
            team_id: $('#team').val() || 0,
            description: $('#desc').val() || '无',
            telephone:$('#phone').val(),
            qq:$('#qq').val(),
            member_right: member_rights.join('')
        };
        data.password = hex_md5(data.password);
        util.ajax('post', '/admin/add_user', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增  <strong style="color:red">'+data.username+'</strong> 管理员帐号 成功');
            adminer.get();
        })
    },
    gen_team_opt: function(id, data, callback){
        var $id = $('#'+id);
        util.ajax('get', '/admin/get_team_opt', data, function(datas,status){
            var trs = [];
            for(var i in datas.data){
                var obj = datas.data[i];
                trs.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(trs.join(''));
            callback && callback();
        })
    },
    gen_depart_opt: function(id, data, callback){
        console.log('call depart');
        $id = $('#'+id);
        util.ajax('get', '/admin/get_department', data, function(datas, status){
            var trs = [];
            for (var i in datas.data){
                var obj = datas.data[i];
                trs.push('<option value="'+obj.id+'">'+obj.name+'</option>');
            }
            $id.html(trs.join(''));
            callback && callback();
            $id.change();
        });
    },
    gen_agent_opt: function(id, callback){
        var $id = $('#'+id);
        util.ajax('get', '/admin/list_opt', {}, function(datas,status){
            var agents = datas.data.agents;
            var alist = [];
            for (var i in agents)
                alist.push('<option value="'+agents[i].id+'">'+agents[i].name+'</option>');
            $id.html(alist.join(''));
            callback && callback();
            $id.change();
        });
    },
    gen_group_opt: function(id, callback){
        var $id = $('#'+id);
        util.ajax('get', '/admin/list_groups', {}, function(datas,status){
            var groups = datas.data;
            var glist = [];
            for (var i in groups)
                glist.push('<option value="'+groups[i].id+'">'+groups[i].name+'</option>');
            $id.html(glist.join(''));
            callback && callback();
            $id.change();
        });
    },
    op: function(){
        $('#adminer-add').unbind('click').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = adminer.gen_edit_code();
            util.dialog('新增管理员信息', code, function(){
                adminer.add();
            }, function(){
                $('#agent').change(function(){
                    var group_id = $('#group').val();
                    if (group_id == 3 || group_id == 4){
                        var data = {company_id:$('#agent').val()||0};
                        adminer.gen_depart_opt('department', data);
                    }
                });
                $('#department').change(function(){
                    if ($('#group').val() == 4){
                        var data = {
                            company_id:$('#agent').val()||0, 
                            department_id:$('#department').val()||0
                        };
                        adminer.gen_team_opt('team', data);
                    }
                });
                $('#group').change(function(){
                    var group_id = $(this).val();
                    var opt = '<option value="0">无需选择</option>'
                    if (group_id == 1 || group_id == 5){//系统管理员 讲师
                        $('#agent').html(opt);
                        $('#department').html(opt);
                        $('#team').html(opt);
                    }else if(group_id == 2){ //总监
                        adminer.gen_agent_opt('agent');
                        $('#department').html(opt);
                        $('#team').html(opt);
                    }else if(group_id == 3){//经理
                        adminer.gen_agent_opt('agent');
                        $('#team').html(opt);
                    }else if(group_id == 4){//经纪人
                        adminer.gen_agent_opt('agent');
                    }
                });
                adminer.gen_group_opt('group');
            });
        });
        $('.mb-edit').unbind('click').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = adminer.gen_edit_code(true);
            var id = $(this).parent().attr('data-id'), $tr = $(this).parent().parent();
            util.dialog('更新管理员信息', code, function(){
                adminer.update(id);
            }, function(){
                util.ajax('get', '/admin/get_one_user', {id:id}, function(datas, status){
                    var user = datas.data.user, groups = datas.data.groups, glist = [];
                    for (var i in groups)
                        glist.push('<option value="'+groups[i].id+'">'+groups[i].name+'</option>');
                    $('#username').val(user.user);
                    $('#nickname').val(user.nick);
                    $('#group').html(glist.join('')).val(user.group);
                    $('#desc').val(user.desc);
                    $('#phone').val(user.telephone);
                    $('#qq').val(user.qq);
                    $("input:checkbox[name='member-right']").eq(0).attr('checked', user.member_right[0]=='1');
                    $("input:checkbox[name='member-right']").eq(1).attr('checked', user.member_right[1]=='1');
                    $("input:checkbox[name='member-right']").eq(2).attr('checked', user.member_right[2]=='1');
                });
            });
        });
        $('.mb-rm').unbind('click').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var code = '您在进行删除<strong>一个管理员信息</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除管理员', code, function(){
                adminer.del(id);
            });
        });
        $('.ok').unbind('click').click(function(){
            var data = {
                id: $(this).attr('data-id'),
                right: 0,
            };
            util.ajax('get', '/admin/change_cr', data, function(datas, status){
                util.alert('修改编辑公司信息权限成功');
                adminer.get();
            })
        });
        $('.ban').unbind('click').click(function(){
            var data = {
                id: $(this).attr('data-id'),
                right: 1,
            };
            util.ajax('get', '/admin/change_cr', data, function(datas, status){
                util.alert('修改编辑公司信息权限成功');
                adminer.get();
            })
        });
        $('#adminer-left').click(function(){
            if(adminer.pages.page <= 1)
                return;
            adminer.pages.page--;
            adminer.get();
        })
        $('#adminer-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(adminer.pages.page >= maxnum)
                return;
            adminer.pages.page++;
            adminer.get();
        });
        $('#adminer-page li a').click(function(){
            if($(this).attr('id') == 'adminer-right' || $(this).attr('id') == 'adminer-left')
                return;
            var page = $(this).text();
            adminer.pages.page = page;
            adminer.get();
        });
        $('#member-search').unbind('click').click(function(){
            adminer.pages.page = 1;
            adminer.get();
        });
    },
    load: function(){
        $('#member-agent').change(function(){
            var group_id = $('#member-group').val();
            if (group_id == 3 || group_id == 4){
                var data = {company_id:$('#member-agent').val()||0};
                adminer.gen_depart_opt('member-depart', data, function(){
                    $('#member-depart').prepend('<option value="0">请选择</option>');
                    $('#member-depart').val('0');
                });
            }
        });
        $('#member-depart').change(function(){
            if ($('#member-group').val() == 4){
                var data = {
                    company_id:$('#member-agent').val()||0, 
                    department_id:$('#member-depart').val()||0
                };
                adminer.gen_team_opt('member-manager', data, function(){
                    $('#member-manager').prepend('<option value="0">请选择</option>');
                    $('#member-manager').val('0');
                });
            }
        });
        $('#member-group').change(function(){
            var group_id = $(this).val();
            var opt = '<option value="0">请选择</option>'
            if (group_id == 1 || group_id == 5){//系统管理员 讲师
                $('#member-agent').html(opt);
                $('#member-depart').html(opt);
                $('#member-manager').html(opt);
            }else if(group_id == 2){ //总监
                adminer.gen_agent_opt('member-agent', function(){
                    $('#member-agent').prepend('<option value="0">请选择</option>');
                    $('#member-agent').val('0');
                });
                $('#member-depart').html(opt);
                $('#member-manager').html(opt);
            }else if(group_id == 3){//经理
                adminer.gen_agent_opt('member-agent', function(){
                    $('#member-agent').prepend('<option value="0">请选择</option>');
                    $('#member-agent').val('0');
                });
                $('#member-manager').html(opt);
            }else if(group_id == 4){//经纪人
                adminer.gen_agent_opt('member-agent', function(){
                    $('#member-agent').prepend('<option value="0">请选择</option>');
                    $('#member-agent').val('0');
                });
            }
        })
        this.gen_group_opt('member-group', function(){
            $('#member-group').prepend('<option value="0">请选择</option>');
            $('#member-group').val('0');
        });
    },
    init: function(){
        this.load();
        this.get();
    }
};

$(document).ready(function(){
    adminer.init();
});
