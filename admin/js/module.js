var course = {
    gen_edit_code: function(editor_name){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">上课时间</label><div class="col-lg-9">';
        code += '<input type="text" id="course_time" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期一</label><div class="col-lg-9">';
        code += '<input type="text" id="monday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期二</label><div class="col-lg-9">';
        code += '<input type="text" id="tuesday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期三</label><div class="col-lg-9">';
        code += '<input type="text" id="wednesday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期四</label><div class="col-lg-9">';
        code += '<input type="text" id="thursday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期五</label><div class="col-lg-9">';
        code += '<input type="text" id="friday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期六</label><div class="col-lg-9">';
        code += '<input type="text" id="saturday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">星期日</label><div class="col-lg-9">';
        code += '<input type="text" id="sunday" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">排序</label><div class="col-lg-9">';
        code += '<input type="text" id="order-key" data-required="true" class="form-control parsley-validated"></div></div></section>';
        return code;
    },
    add: function(){
        var data = {
            tech_time:$('#course_time').val(),
            monday:$('#monday').val(),
            tuesday:$('#tuesday').val(),
            wednesday: $('#wednesday').val(),
            thursday: $('#thursday').val(),
            friday: $('#friday').val(),
            saturday: $('#saturday').val(),
            sunday: $('#sunday').val(),
            order_key: $('#order-key').val()
        };
        util.ajax('post', '/info/add_timetable', data, function(data, status){
            $('#cancel-btn').click();
            util.alert('新增课程表成功');
            course.get();
        })
    },
    update: function(id){
        var data = {
            id:id,
            tech_time:$('#course_time').val(),
            monday:$('#monday').val(),
            tuesday:$('#tuesday').val(),
            wednesday: $('#wednesday').val(),
            thursday: $('#thursday').val(),
            friday: $('#friday').val(),
            saturday: $('#saturday').val(),
            sunday: $('#sunday').val(),
            order_key: $('#order-key').val()
        };
        util.ajax('post', '/info/save_timetable', data, function(data, status){
            $('#cancel-btn').click();
            util.alert('更新课程表成功');
            course.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/delete_timetable',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除课程表成功');
            course.get();
        });
    },
    get: function(){
        util.ajax('get', '/info/get_timetable', {}, function(datas, status){
            var courses = datas.data, course_list = [];
            for (var i in courses){
                var obj = courses[i];
                var code ='<tr>';
                code += '<td>'+obj.id+'</td><td>'+obj.tech_time+'</td><td>'+obj.monday+'</td><td>'+obj.tuesday+'</td><td>'+obj.wednesday+'</td>';
                code += '<td>'+obj.thursday+'</td><td>'+obj.friday+'</td><td>'+obj.saturday+'</td><td>'+obj.sunday+'</td>';
                code += '<td>'+obj.order_key+'</td>';
                code += '<td class="text-left" data-id="'+obj.id+'"><a href="javascript:;" class="course-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="javascript:;" class="course-rm"><i class="icon-remove icon-large text-danger text"></i></a></td>';
                code += '<tr>';
                course_list.push(code);
            }
            $('#course-list').html(course_list.join(''));
            course.op();
        })
    },
    op: function(){
        $('#course-add').click(function(){
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var code = course.gen_edit_code();
            util.dialog('新增课程表', code, function(){
                course.add();
            });
        });
        $('.course-edit').click(function(){
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var id = $(this).parent().attr('data-id');
            var code = course.gen_edit_code();
            util.dialog('更新课程表', code, function(){
                course.update(id);
            }, function(){
                util.ajax('get', '/info/get_one_timetable', {id:id}, function(datas,status){
                    var obj = datas.data;
                    $('#course_time').val(obj.tech_time);
                    $('#monday').val(obj.monday);
                    $('#tuesday').val(obj.tuesday);
                    $('#wednesday').val(obj.wednesday);
                    $('#thursday').val(obj.thursday);
                    $('#friday').val(obj.friday);
                    $('#saturday').val(obj.saturday);
                    $('#sunday').val(obj.sunday);
                    $('#order-key').val(obj.order_key);
                })
            });
        });
        $('.course-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var code = '您在进行删除<strong>一行课程表纪录</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除公告信息', code, function(){
                course.del(id);
            })
        });
    },
    init: function(){
        this.get();
    } 
};

var exchange = {
    pages : {
        page:1,
        limit:20
    },
    create_editor: function(name){
        var editor = new wangEditor(name);
        editor.config.uploadImgUrl = util.img_url;
        editor.config.uploadImgFileName = 'img_file';
        editor.config.uploadParams = {};

        editor.config.menus = [
            'source','|','bold','underline','italic','strikethrough','eraser','forecolor','bgcolor','|',
            'quote','fontfamily','fontsize','head','unorderlist','orderlist','alignleft','aligncenter',
            'alignright','|','link','unlink','table','|','img','insertcode','|','undo','redo','fullscreen'
        ];
        editor.create();
    },
    gen_edit_code: function(editor_name){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">标题</label><div class="col-lg-9">';
        code += '<input type="text" id="exchange-title" placeholder="标题" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label"> </label><div class="col-lg-9">';
        code += '<div class="container"><div id="'+editor_name+'" style="height:600px"></div></div></div></div></section>';
        return code;
    },
    get: function(){
        util.ajax('get', '/info/get_exchange_tip', exchange.pages, function(datas, status){
            var tips = datas.data.tips, total = datas.data.total, tip_list = [];
            for (var i in tips){
                var tip = tips[i];
                var code ='<tr><td>'+tip.title+'</td><td>'+tip.create_time+'</td><td>'+tip.name+'</td>';
                code += '<td data-id="'+tip.id+'"><a href="javascript:;" class="exchange-edit">';
                code += '<i class="icon-pencil"></i></a><a href="javascript:;" class="exchange-rm">';
                code += '<i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                tip_list.push(code);
            }
            $('#exchange-list').html(tip_list.join(''));
            page_list = util.paging(total, exchange.pages, 'exchange-left', 'exchange-right');
            $('#exchange-page').html(page_list.join(''));
            exchange.op();
        })
    },
    add: function(title, content){
        var data = {
            title:title,
            content:content,
            admin_id:1
        };
        util.ajax('post', '/info/add_exchange_tip', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增交易提示《'+title+'》成功');
            exchange.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/del_exchange_tip',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            exchange.get();
        })
    },
    update: function(id, title, content){
        var data = {
            id:id,
            title:title,
            content:content
        };
        util.ajax('post', '/info/save_exchange_tip', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新交易提示《'+title+'》成功');
            exchange.get();
        })
    },
    op: function(){
        $('#exchange-add').click(function(){
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var code = exchange.gen_edit_code('editor-exchange');
            util.dialog('新增交易提示', code, function(){
                var title = $('#exchange-title').val(), content = $('#editor-exchange').html();
                exchange.add(title, content);
            }, function(){
                exchange.create_editor('editor-exchange');
            });
        });
        $('.exchange-edit').click(function(){
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var code = exchange.gen_edit_code('editor-exchange');
            var id = $(this).parent().attr('data-id');
            util.dialog('新增交易提示', code, function(){
                var title = $('#exchange-title').val(), content = $('#editor-exchange').html();
                exchange.update(id, title, content);
            }, function(){
                exchange.create_editor('editor-exchange');
                util.ajax('get', '/info/get_one_exchange_tip', {id:id}, function(datas, status){
                    var tip = datas.data;
                    $('#exchange-title').val(tip.title);
                    $('#editor-exchange').html(tip.content);
                });
            });
        });
        $('.exchange-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var code = '您在进行删除<strong>一条交易提示</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除交易提示', code, function(){
                exchange.del(id);
            });
        });
        $('#exchange-left').click(function(){
            if(exchange.pages.page <= 1)
                return;
            exchange.pages.page--;
            exchange.get();
        })
        $('#exchange-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(exchange.pages.page >= maxnum)
                return;
            exchange.pages.page++;
            exchange.get();
        });
        $('#exchange-page li a').click(function(){
            if($(this).attr('id') == 'exchange-right' || $(this).attr('id') == 'exchange-left')
                return;
            var page = $(this).text();
            exchange.pages.page = page;
            exchange.get();
        })
    },
    init: function(){
        this.get();
    }
};

