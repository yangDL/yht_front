var robot = {
    pages : {
        page:1,
        limit:20
    },
    flash: function(mbs, total){
        var mb_list = [];
        for (var i in mbs){
            var mb = mbs[i];
            var code = '<tr>';
            code += '<td>'+mb.id+'</td><td>'+mb.nickname+'</td><td>'+mb.level+'</td><td>'+mb.online_time+'</td><td>'+mb.offline_time+'</td>';
            code += '<td class="text-left" data-id="'+mb.id+'"><a href="javascript:;" class="mb-edit"><i class="icon-pencil"></i></a>';
            code += '<a href="javascript:;" class="mb-rm"><i class="icon-remove text-danger"></i></a></td></tr>';
            mb_list.push(code);
        }
        $('#mb-list').html(mb_list.join(''));
        page_list = util.paging(total, robot.pages, 'robot-left', 'robot-right');
        $('#robot-page').html(page_list.join(''));
        robot.op();
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code +='<div class="form-group"><label class="col-lg-2 control-label">昵称</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-nick" data-required="true" class="form-control parsley-validated"></div></div>';

        code +='<div class="form-group"><label class="col-lg-2 control-label">等级</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-level" data-required="true" class="form-control parsley-validated"></div></div>';
        
        code +='<div class="form-group"><label class="col-lg-2 control-label">上线时间</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-online" placeholder=" 格式为 hh:mm:ss" class="form-control parsley-validated"></div></div>';
        
        code +='<div class="form-group"><label class="col-lg-2 control-label">下线时间</label><div class="col-lg-9">';
        code += '<input type="text" id="mb-offline"  placeholder=" 格式为 hh:mm:ss" class="form-control parsley-validated"></div></div>';

        code += '</section>';
        return code;
    },

    get: function(){
        util.ajax('get', '/user/robot_list', robot.pages, function(datas, status){
            robot.flash(datas.data.list, datas.data.total);
        })
    },
    del: function(id){
        util.ajax('get', '/user/delete_robot',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除机器人成功');
            robot.get();
        })
    },
    add: function(){
        var data = {
            nickname: $('#mb-nick').val(),
            level   : $('#mb-level').val(),
            online_time  : $('#mb-online').val(),
            offline_time : $('#mb-offline').val()
        };
        if (!data.nickname || !data.level || !data.online_time || !data.offline_time){
            util.alert('请完善信息再更新');
            return;
        }
        util.ajax('get', '/user/add_robot', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增机器人 <strong style="color:red">'+data.nickname+'</strong>信息 成功');
            robot.get();
        })
    },
    update: function(id){
        var data = {
            id:id,
            nickname: $('#mb-nick').val(),
            level   : $('#mb-level').val(),
            online_time  : $('#mb-online').val(),
            offline_time : $('#mb-offline').val()
        };
        if (!data.level || !data.online_time || !data.offline_time){
            util.alert('请完善信息再更新');
            return;
        }
        util.ajax('get', '/user/modify_robot_time', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新机器人 <strong style="color:red">'+data.nickname+'</strong>信息 成功');
            robot.get();
        })
    },
    op: function(){
        $('#add-robot').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = robot.gen_edit_code();
            util.dialog('新增机器人信息', code, function(){
                robot.add();
            });
        })

        $('.mb-edit').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = robot.gen_edit_code();
            var id = $(this).parent().attr('data-id'), $tds = $(this).parent().parent().children('td');
            util.dialog('更新机器人信息', code, function(){
                robot.update(id);
            }, function(){
                $('#mb-nick').val($tds.eq(1).text());
                $('#mb-level').val($tds.eq(2).text());
                $('#mb-online').val($tds.eq(3).text());
                $('#mb-offline').val($tds.eq(4).text());
            });
        });
        $('.mb-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), $tds = $(this).parent().parent().children('td');
            var code = '您即将删除一个机器人<strong style="color:red">'+$tds.eq(1).text()+'</strong>，删除无法恢复，确定继续';
            util.dialog('删除机器人信息', code, function(){
                robot.del(id);
            });
        
        });
        $('#all-update').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = robot.gen_edit_code();
            util.dialog('更新所有机器人信息', code, function(){
                robot.update(-1);
            }, function(){
                $('#mb-nick').parent().parent().hide();
            });    
        });
        $('#robot-left').click(function(){
            if(robot.pages.page <= 1)
                return;
            robot.pages.page--;
            robot.get();
        })
        $('#robot-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(robot.pages.page >= maxnum)
                return;
            robot.pages.page++;
            robot.get();
        });
        $('#robot-page li a').click(function(){
            if($(this).attr('id') == 'robot-right' || $(this).attr('id') == 'robot-left')
                return;
            var page = $(this).text();
            robot.pages.page = page;
            robot.get();
        });
     
    },
    
    init: function(){
        this.get();
    }
};

$(document).ready(function(){
    robot.init();
});
