var agent = {
    pages: {
        page:1,
        limit:20
    },
    create_editor: function(name){
        var editor = new wangEditor(name);
        editor.config.uploadImgUrl = util.img_url;
        editor.config.uploadImgFileName = 'img_file';
        editor.config.uploadParams = {};
        editor.config.menus = ['source','|','img'];
        editor.config.uploadImgFns.onload = function(resultText, xhr){
            this.$txt.html('<img src="'+resultText+'" style="height:100px;">');
        }
        editor.create();
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">代理名称</label><div class="col-lg-9">';
        code += '<input type="text" id="agent-name" placeholder="代理名称" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">所属代码</label><div class="col-lg-9">';
        code += '<input type="text" id="agent-qk" placeholder="所属代码" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">所属域名</label><div class="col-lg-9">';
        code += '<input type="text" id="agent-hk" placeholder="所属域名" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            name: $('#agent-name').val(), 
            qk : $('#agent-qk').val(),
            hk : $('#agent-hk').val()
        };
        util.ajax('get', '/config/save_agent', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新代理 '+data.name+' 信息成功');
            agent.get();
        })
    },
    del: function(id){
        util.ajax('get', '/config/del_agent', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            agent.get();
        });
    },
    add: function(){
        var data = {
            name: $('#agent-name').val(), 
            qk : $('#agent-qk').val(),
            hk : $('#agent-hk').val()
        };
        util.ajax('get','/config/add_agent', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增代理 '+data.name+' 信息成功');
            agent.get();
        })
    },
    get: function(){
        util.ajax('get', '/config/get_agent', agent.pages, function(datas, status){
            var ns = datas.data.agents, total = datas.data.total, trlist = [];
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.name+'</td><td>http://zhibo.yht134.com/?c='+obj.id+'</td><td>'+obj.hk+'</td>';
                code += '<td><a href="company.html?agent_id='+obj.id+'&agent_name='+escape(obj.name)+'" target="_blank">前往编辑</a></td>';
                code += '<td><a href="department.html?agent_id='+obj.id+'&agent_name='+escape(obj.name)+'">下级部门列表</a></td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="agent-edit"><i class="icon-pencil"></i></a><a href="#" class="agent-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#agent-list').html(trlist.join(''));
            
            page_list = util.paging(total, agent.pages, 'agent-left', 'agent-right');
            $('#agent-page').html(page_list.join(''));
            agent.op();
        })
    },
    op: function(){
        $('#add-agent').click(function(){
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var code= agent.gen_edit_code('editor-agent');
            util.dialog('新增教师信息', code, function(){
                agent.add();
            });
        })
        $('.agent-edit').click(function(){ 
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var id = $(this).parent().attr('data-id'), code= agent.gen_edit_code('editor-agent');
            var $tr = $(this).parent().parent();
            
            util.dialog('编辑教师信息', code, function(){
                agent.update(id);
            }, function(){
                $('#agent-name').val($tr.children().eq(0).text());
                $('#agent-qk').val($tr.children().eq(1).text());
                $('#agent-hk').val($tr.children().eq(2).text());
            });
            
        });
        $('.agent-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除讲师 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除公告信息', code, function(){
                agent.del(id);
            })
        });
        $('#agent-left').click(function(){
            if(agent.pages.page <= 1)
                return;
            agent.pages.page--;
            agent.get();
        });
        $('#agent-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(agent.pages.page >= maxnum)
                return;
            agent.pages.page++;
            agent.get();
        });
        $('#agent-page li a').click(function(){
            if($(this).attr('id') == 'agent-right' || $(this).attr('id') == 'agent-left')
                return;
            var page = $(this).text();
            agent.pages.page = page;
            agent.get();
        })
    },
    init: function(){
        agent.get();
    }
};

var depart = {
    agent_id:0,
    load: function(){
        var qs = util.query_string('agent_id');
        if(util.user.group_id == 1 && qs){
            depart.agent_id = qs;
            $('.depart-title').html('<i class="icon-signal"></i><strong style="color: #00A0FF;">'+util.query_string('agent_name') + '</strong> 部门配置');
        }else{
            depart.agent_id = util.user.agent_id;
            $('.depart-title').html('<strong style="color: #00A0FF;">'+util.user.agent_name + '</strong> 部门配置');
        }  
    },
    gen_edit_code: function(is_update){
        var code ='<section class="form-horizontal">';

        if(!is_update) {
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
            code += '<select id="agent" class="form-control parsley-validated"></select></div></div>';
        }
        else {
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
            code += '<input type="text" disabled="disabled" class="form-control" id="agent-only"></div></div>';
        }

        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">部门名称</label><div class="col-lg-9">';
        code += '<input type="text" id="depart-name" placeholder="部门名称" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            company_id:depart.agent_id,
            name: $('#depart-name').val()
        };
        util.ajax('post', '/admin/save_department', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新部门 '+data.name+' 信息成功');
            depart.get();
        })
    },
    del: function(id){
        util.ajax('get', '/admin/delete_department', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            depart.get();
        });
    },
    add: function(){
        var data = {
            company_id: $('#agent').val(),          
            name: $('#depart-name').val()
        };
        util.ajax('post','/admin/add_department', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增部门 '+data.name+' 信息成功');
            depart.get();
        })
    },
    get: function(){
        util.ajax('get', '/admin/get_department', {company_id:depart.agent_id}, function(datas, status){
            var ns = datas.data, trlist = [];
            for(var i in ns){
                var obj = ns[i]; // index = parseInt(i) + 1;
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.name+'</td><td>'+obj.agent+'</td><td>http://zhibo.yht134.com/?d='+obj.id+'</td>';
                code += '<td><a href="manager.html?department_id='+obj.id+'&department_name='+escape(obj.name)+'">下级团队列表</a></td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="depart-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="depart-rm"><i class="icon-remove icon-large text-danger text"></i></a></td>';
                code += '</tr>';
                trlist.push(code);
            }
            $('#depart-list').html(trlist.join(''));
            depart.op();
        })
    },
    op: function(){
        $('#add-depart').click(function(){
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var code= depart.gen_edit_code(false);
            util.dialog('新增部门信息', code, function(){
                depart.add();
            }, function(){
                util.ajax('get', '/admin/get_company', {}, function(datas,status){
                    var opts = [];
                    for (var i in datas.data){
                        var obj = datas.data[i];
                        opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                    }
                    $('#agent').html(opts.join(''));
                })
            });
        })
        $('.depart-edit').click(function(){ 
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var id = $(this).parent().attr('data-id'), code= depart.gen_edit_code(true);
            var $tr = $(this).parent().parent();
            
            util.dialog('编辑部门信息', code, function(){
                depart.update(id);
            }, function(){
                $('#agent-only').val($('.depart-title strong').text());
                $('#depart-name').val($tr.children().eq(1).text());
            });
            
        });
        $('.depart-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().text();
            code = '您即将删除部门 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除部门信息', code, function(){
                depart.del(id);
            })
        });
    },
    init: function(){
        util.load();
        depart.load();
        depart.get();
    }
};

var manager = {
    agent_id:0,
    departs:[],
    load: function(){
        var qs = util.query_string('department_id');
        if(util.user.group_id == 1 && qs){
            
            manager.agent_id = qs;
            $('.manager-title').html('<i class="icon-signal"></i><strong style="color: #00A0FF;">'+util.query_string('department_name') + '</strong> 团队配置');
        }else{
            manager.agent_id = util.user.agent_id;
            $('.manager-title').html('<strong style="color: #00A0FF;">'+util.user.agent_name + '</strong> 团队配置');
        }
        console.log(manager.agent_id);
    },
    gen_edit_code: function(is_update){
        var code ='<section class="form-horizontal">';

        //code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
        //code += '<input type="text" disabled="disabled" class="form-control" value="'+$('.manager-title').text()+'"></div></div>';

        if(!is_update) {
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
            code += '<select id="agent" class="form-control parsley-validated"></select></div></div>';

            code += '<div class="form-group"><label class="col-lg-2 control-label">所属部门</label><div class="col-lg-9">';
            code += '<select id="department" class="form-control parsley-validated"></select></div></div>';
        }
        else {
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属公司</label><div class="col-lg-9">';
            code += '<input type="text" disabled="disabled" class="form-control" value="'+$('.manager-title strong').text()+'"></div></div>'; 
            
            code += '<div class="form-group"><label class="col-lg-2 control-label">所属部门</label><div class="col-lg-9">';
            code += '<select disabled="disabled" class="form-control" id="department"></select></div></div>';     
        }

        code += '<div class="form-group"><label class="col-lg-2 control-label">团队名称</label><div class="col-lg-9">';
        code += '<input type="text" id="manager-name" placeholder="团队名称" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            company_id:manager.agent_id,
            department_id: $('#department').val(),
            name: $('#manager-name').val()
        };
        util.ajax('post', '/admin/save_team', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新团队 '+data.name+' 信息成功');
            manager.get();
        })
    },
    del: function(id){
        util.ajax('get', '/admin/delete_team', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            manager.get();
        });
    },
    add: function(){
        var data = {
            company_id: $('#agent').val(),
            department_id: $('#department').val(),
            name: $('#manager-name').val()
        };
        util.ajax('post','/admin/add_team', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增团队 '+data.name+' 信息成功');
            manager.get();
        })
    },
    get: function(){
        util.ajax('get', '/admin/get_team', {company_id:manager.agent_id}, function(datas, status){
            var ns = datas.data, trlist = [];
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.name+'</td><td>'+obj.agent+'</td><td>'+obj.depart+'</td><td>http://zhibo.yht134.com/?t='+obj.id+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="manager-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="manager-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#manager-list').html(trlist.join(''));
            manager.op();
        })
    },
    op: function(){
        $('#add-manager').click(function(){
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var code= manager.gen_edit_code(false);
            util.dialog('新增团队信息', code, function(){
                manager.add();
            }, function(){
                $('#agent').change(function(){
                    util.ajax('get', '/admin/get_department', {company_id:$('#agent').val()}, function(datas, status){
                        var trs = [];
                        for (var i in datas.data){
                            var obj = datas.data[i];
                            trs.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                        }
                        $('#department').html(trs.join(''));
                    });
                });
                util.ajax('get', '/admin/get_company', {}, function(datas,status){
                    var opts = [];
                    for (var i in datas.data){
                        var obj = datas.data[i];
                        opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                    }
                    $('#agent').html(opts.join(''));
                    $('#agent').change();
                });
            });
        })
        $('.manager-edit').click(function(){ 
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var id = $(this).parent().attr('data-id'), code= manager.gen_edit_code(true);
            var $tr = $(this).parent().parent();
            util.dialog('编辑团队信息', code, function(){
                manager.update(id);
            }, function(){
                $('#manager-name').val($tr.children().eq(1).text());
                var trs = [];
                util.ajax('get', '/admin/get_department', {company_id:manager.agent_id}, function(datas, status){
                    var trs = [];
                    for (var i in datas.data){
                        var obj = datas.data[i];
                        if($tr.children().eq(3).text() == obj.name)
                            trs.push('<option value="'+obj.id+'" selected>'+obj.name+'</option>');
                        else
                            trs.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                    }
                    $('#department').html(trs.join(''));
                });
            });
            
        });
        $('.manager-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除团队 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除团队信息', code, function(){
                manager.del(id);
            })
        });
    },
    init: function(){
        util.load();
        manager.load();
        manager.get();
    }
};
