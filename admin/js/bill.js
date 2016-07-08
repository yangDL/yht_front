var bill = {
    pages: {
        page:1,
        limit:20
    },
    gen_edit_code: function(is_update){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">分析师</label><div class="col-lg-8">';
        code += '<select id="uid" class="form-control parsley-validated"></select></div></div>';
        code += '<div class="form-group"><label class="col-lg-2 control-label">商品名称</label><div class="col-lg-8">';
        code += '<select id="pid" class="form-control parsley-validated"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">类型</label><div class="col-lg-8">';
        code += '<select id="type" class="form-control parsley-validated"></select></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">仓位</label><div class="col-lg-8">';
        code += '<div class="input-group"><input id="pos" type="text" class="form-control"><span class="input-group-btn"><span class="btn btn-default" type="button">%</span></span></div>';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">开仓价</label><div class="col-lg-9">';
        code += '<input type="text" id="open-price" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">止损价</label><div class="col-lg-9">';
        code += '<input type="text" id="stop-price" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">止盈价</label><div class="col-lg-9">';
        code += '<input type="text" id="limit-price" data-required="true" class="form-control parsley-validated">';
        if(is_update){
            code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">平仓价</label><div class="col-lg-9">';
            code += '<input type="text" id="sale-price" data-required="true" class="form-control parsley-validated">';
            code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">获利点数</label><div class="col-lg-9">';
            code += '<input type="text" id="profit" data-required="true" class="form-control parsley-validated">';
        }
        code += '</div></div></section>';
        
        return code;
    },
    add: function(){
        var data = {
            uid : $('#uid').val(),                                                                                                        
            pid : $('#pid').val(),                                                                                                   
            type: $('#type').val(),                                                                                                   
            pos : $('#pos').val(),                                                                                                  
            open_price :  $('#open-price').val(),                                                                                             
            stop_price :  $('#stop-price').val(),                                                                                          
            limit_price:  $('#limit-price').val()
        };
        for(var i in data){
            if(!data[i]){
                util.alert('请完善信息后提交');
                return;
            }
        }
        util.ajax('post', '/info/add_bill', data, function(data, status){
            $('#cancel-btn').click();
            util.alert('新增喊单成功');
            bill.get();
        })
    },
    update: function(id){
        var data = {
            id:id,
            uid : $('#uid').val(),                                                                                                        
            pid : $('#pid').val(),                                                                                                   
            type: $('#type').val(),                                                                                                   
            pos : $('#pos').val(),                                                                                                  
            open_price :  $('#open-price').val() * 100,                                                                                             
            stop_price :  $('#stop-price').val() * 100,                                                                                          
            limit_price:  $('#limit-price').val() * 100,
            sale_price: $('#sale-price').val() * 100,
            profit: $('#profit').val() * 100
        };
        util.ajax('post', '/info/update_bill', data, function(data, status){
            $('#cancel-btn').click();
            util.alert('更新单号 '+id+' 喊单成功');
            bill.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/del_bill',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除单号: '+id+' 成功');
            bill.get();
        });
    },
    gen_option: function(datas){
        option_list = [];
        option_list.push('<option value="0">选择</option>');
        for (var i in datas){
            var obj = datas[i];
            option_list.push('<option value="'+obj.id+'">'+obj.name+'</option>');
        }
        return option_list.join('');
    },
    flash: function(bills, total){
        var bills_list = []; 
        for (var i in bills){
            var obj = bills[i];
            var code ='<tr>';
            code += '<td>'+obj.id+'</td><td>'+obj.product+'</td><td>'+obj.create_time+'</td><td>'+obj.type+'</td><td>'+obj.pos+'%</td>';
            code += '<td>'+obj.op+'</td><td>'+obj.sp+'</td><td>'+obj.lp+'</td><td>'+obj.sale_time+'</td><td>'+obj.sap+'</td>';
            code += '<td>'+obj.profit+'</td><td>'+obj.teacher+'</td>';
            code += '<td class="text-left" data-id="'+obj.id+'"><a href="javascript:;" class="bill-edit"><i class="icon-pencil"></i></a>';
            code += '<a href="javascript:;" class="bill-rm"><i class="icon-remove icon-large text-danger text"></i></a></td>';
            code += '</tr>';
            bills_list.push(code);
        }
        $('#bill-list').html(bills_list.join('')); 
        var page_list = util.paging(total, bill.pages, 'bill-left', 'bill-right');
        $('#bill-page').html(page_list.join(''));
        bill.op();
    },
    get: function(){
        util.ajax('get', '/info/get_bills', bill.pages, function(datas, status){
            var bills = datas.data.bills, total=datas.data.total, teachers = datas.data.teachers; 
            var types = datas.data.types, products = datas.data.products;
            $('#bill-teacher').html(bill.gen_option(teachers));
            $('#bill-name').html(bill.gen_option(products));
            $('#bill-type').html(bill.gen_option(types));
            bill.flash(bills, total);  
        })
    },
    op: function(){
        $('#bill-add').click(function(){
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var code = bill.gen_edit_code();
            util.dialog('新增喊单', code, function(){
                bill.add();
            }, function(){
                $('#uid').html($('#bill-teacher').html());
                $('#pid').html($('#bill-name').html());
                $('#type').html($('#bill-type').html());
            });
        });
        $('.bill-edit').click(function(){
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var id = $(this).parent().attr('data-id');
            var code = bill.gen_edit_code(true);
            util.dialog('更新喊单', code, function(){
                bill.update(id);
            }, function(){
                $('#uid').html($('#bill-teacher').html());
                $('#pid').html($('#bill-name').html());
                $('#type').html($('#bill-type').html());
                util.ajax('get', '/info/get_one_bill', {id:id}, function(datas,status){
                    var obj = datas.data;
                    $('#uid').val(obj.teacher);                                                                                                        
                    $('#pid').val(obj.product);                                                                                                   
                    $('#type').val(obj.type);                                                                                                   
                    $('#pos').val(obj.pos);                                                                                                
                    $('#open-price').val(obj.op);                                                                                             
                    $('#stop-price').val(obj.sp);                                                                                          
                    $('#limit-price').val(obj.lp);
                    $('#sale-price').val(obj.sap);
                    $('#profit').val(obj.profit);
                })
            });
        });
        $('.bill-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var code = '您在进行删除<strong>单号'+id+'的喊单</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除喊单信息', code, function(){
                bill.del(id);
            })
        });
        $('#bill-left').click(function(){
            if(bill.pages.page <= 1)
                return;
            bill.pages.page--;
            bill.get();
        });
        $('#bill-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(bill.pages.page >= maxnum)
                return;
            bill.pages.page++;
            bill.get();
        });
        $('#bill-page li a').click(function(){
            if($(this).attr('id') == 'bill-right' || $(this).attr('id') == 'bill-left')
                return;
            var page = $(this).text();
            bill.pages.page = page;
            bill.get();
        })
        $('#bill-search').click(function(){
            bill.pages.page = 1;
            var data = {
                uid : $('#bill-teacher').val(),
                pid : $('#bill-name').val(),
                type: $('#bill-type').val(), 
                begintime : $('#begin-time').val(),
                endtime : $('#end-time').val()
            };
            $.extend(data, bill.pages);
            util.ajax('get', '/info/search_bills', data, function(datas, status){
                bill.flash(datas.data.bills, datas.data.total);
            })
        })
    },
    init: function(){
        this.get();
    } 
};


var teacher = {
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
            this.$txt.html('<img src="'+resultText+'" style="width:500px;">');
        }
        editor.create();
    },
    gen_edit_code: function(editor_name){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">名称</label><div class="col-lg-9">';
        code += '<input type="text" id="teacher-name" placeholder="名称" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label"> </label><div class="col-lg-9">';
        code += '<div class="container"><div id="'+editor_name+'" style="height:400px"></div></div></div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            name: $('#teacher-name').val(), 
            url : $('#editor-teacher').find('img').eq(0).attr('src')
        };
        util.ajax('get', '/info/save_teacher', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新教师 '+data.name+' 信息成功');
            teacher.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/del_teacher', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            teacher.get();
        });
    },
    add: function(){
        var data = {
            name: $('#teacher-name').val(), 
            url : $('#editor-teacher').find('img').eq(0).attr('src')
        };
        util.ajax('get','/info/add_teacher', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增教师 '+data.name+' 信息成功');
            teacher.get();
        })
    },
    get: function(){
        util.ajax('get', '/info/get_teachers_msg', teacher.pages, function(datas, status){
            var ns = datas.data.teachers, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.name+'</td><td>'+obj.url+'</td><td>'+obj.create_time+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="teacher-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="teacher-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#teacher-list').html(trlist.join(''));
            
            page_list = util.paging(total, teacher.pages, 'teacher-left', 'teacher-right');
            $('#teacher-page').html(page_list.join(''));
            teacher.op();
        })
    },
    op: function(){
        $('#add-teacher').click(function(){
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var code= teacher.gen_edit_code('editor-teacher');
            util.dialog('新增教师信息', code, function(){
                teacher.add();
            }, function(){
                teacher.create_editor('editor-teacher');
            });
        })
        $('.teacher-edit').click(function(){ 
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var id = $(this).parent().attr('data-id'), code= teacher.gen_edit_code('editor-teacher');
            
            util.dialog('编辑教师信息', code, function(){
                teacher.update(id);
            }, function(){
                teacher.create_editor('editor-teacher');
                util.ajax('get', '/info/get_one_teacher', {id:id}, function(datas, status){
                    var obj = datas.data;
                    $('#teacher-name').val(obj.name);
                    $('#editor-teacher').html('<img src="'+obj.url+'" style="width:100%;">');
                });
            });
            
        });
        $('.teacher-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除讲师 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除公告信息', code, function(){
                teacher.del(id);
            })
        });
        $('#teacher-left').click(function(){
            if(teacher.pages.page <= 1)
                return;
            teacher.pages.page--;
            teacher.get();
        });
        $('#teacher-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(teacher.pages.page >= maxnum)
                return;
            teacher.pages.page++;
            teacher.get();
        });
        $('#teacher-page li a').click(function(){
            if($(this).attr('id') == 'teacher-right' || $(this).attr('id') == 'teacher-left')
                return;
            var page = $(this).text();
            teacher.pages.page = page;
            teacher.get();
        })
    },
    init: function(){
        teacher.get();
    }
};

var pro = {
    pages: {
        page:1,
        limit:10
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">商品名称</label><div class="col-lg-9">';
        code += '<input type="text" id="pro-name" placeholder="商品名称" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label">商品类型</label><div class="col-lg-9">';
        code += '<select id="pro-type" class="form-control parsley-validated"></select>';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            name: $('#pro-name').val(),
            type: $('#pro-type').val()
        };
        util.ajax('get', '/info/save_product', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新商品 '+data.name+' 信息成功');
            pro.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/del_product', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            pro.get();
        });
    },
    add: function(){
        var data = {
            name: $('#pro-name').val(),
            type: $('#pro-type').val()
        };
        util.ajax('get','/info/add_product', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增商品 '+data.name+' 信息成功');
            pro.get();
        })
    },
    get: function(){
        util.ajax('get', '/info/get_product', pro.pages, function(datas, status){
            var ns = datas.data.pros, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.name+'</td><td>'+obj.type+'</td><td>'+obj.create_time+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="pro-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="pro-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#pro-list').html(trlist.join(''));
            
            page_list = util.paging(total, pro.pages, 'pro-left', 'pro-right');
            $('#pro-page').html(page_list.join(''));
            pro.op();
        })
    },
    op: function(){
        $('#add-pro').click(function(){
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var code= pro.gen_edit_code();
            util.dialog('新增商品信息', code, function(){
                pro.add();
            }, function(){
                util.ajax('get', '/info/get_protype_opt', {}, function(datas, status){
                    var opts = [];
                    for (var i in datas.data){
                        var obj = datas.data[i];
                        opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                    }
                    $('#pro-type').html(opts.join(''));
                });
            });
        })
        $('.pro-edit').click(function(){ 
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var id = $(this).parent().attr('data-id'), code= pro.gen_edit_code();
            
            util.dialog('更新商品信息', code, function(){
                pro.update(id);
            }, function(){
                util.ajax('get', '/info/get_protype_opt', protype.pages, function(datas, status){
                    var opts = [];
                    for (var i in datas.data){
                        var obj = datas.data[i];
                        opts.push('<option value="'+obj.id+'">'+obj.name+'</option>');
                    }
                    $('#pro-type').html(opts.join(''));
                    util.ajax('get', '/info/get_one_product', {id:id}, function(datas, status){
                        var obj = datas.data;
                        $('#pro-name').val(obj.name);
                        $('#pro-type').val(obj.type);
                    });
                });
            });
            
        });
        $('.pro-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除讲师 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除公告信息', code, function(){
                pro.del(id);
            })
        });
        $('#pro-left').click(function(){
            if(pro.pages.page <= 1)
                return;
            pro.pages.page--;
            pro.get();
        });
        $('#pro-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(pro.pages.page >= maxnum)
                return;
            pro.pages.page++;
            pro.get();
        });
        $('#pro-page li a').click(function(){
            if($(this).attr('id') == 'pro-right' || $(this).attr('id') == 'pro-left')
                return;
            var page = $(this).text();
            pro.pages.page = page;
            pro.get();
        })
    },
    init: function(){
        pro.get();
    }
};

var protype = {
    pages: {
        page:1,
        limit:10
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">商品类型</label><div class="col-lg-9">';
        code += '<input type="text" id="protype-name" placeholder="商品类型名称" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            type_name: $('#protype-name').val()
        };
        if(!data.type_name) return;
        util.ajax('post', '/info/update_product_type', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新商品类型 '+data.type_name+' 信息成功');
            protype.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/delete_product_type', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            protype.get();
        });
    },
    add: function(){
        var data = {
            type_name: $('#protype-name').val(),
        };
        if (!data.type_name) return;
        util.ajax('post','/info/add_product_type', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增商品 '+data.type_name+' 信息成功');
            protype.get();
        })
    },
    get: function(){
        util.ajax('get', '/info/get_product_type', protype.pages, function(datas, status){
            var ns = datas.data.protypes, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.name+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="protype-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="protype-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#protype-list').html(trlist.join(''));
            
            page_list = util.paging(total, protype.pages, 'protype-left', 'protype-right');
            $('#protype-page').html(page_list.join(''));
            protype.op();
        })
    },
    op: function(){
        $('#add-protype').click(function(){
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var code= protype.gen_edit_code();
            util.dialog('新增商品类型信息', code, function(){
                protype.add();
            });
        })
        $('.protype-edit').click(function(){ 
            $('.modal-dialog').css({"width": "550px", "margin-left": "-275px"});
            var id = $(this).parent().attr('data-id'), code= protype.gen_edit_code();
            var name = $(this).parent().prev().text();
            
            util.dialog('更新商品类型信息', code, function(){
                protype.update(id);
            }, function(){
                $('#protype-name').val(name);
            });
            
        });
        $('.protype-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().text();
            code = '您即将删除商品类型 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除商品类型信息', code, function(){
                protype.del(id);
            })
        });
        $('#protype-left').click(function(){
            if(protype.pages.page <= 1)
                return;
            protype.pages.page--;
            protype.get();
        });
        $('#protype-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(protype.pages.page >= maxnum)
                return;
            protype.pages.page++;
            protype.get();
        });
        $('#protype-page li a').click(function(){
            if($(this).attr('id') == 'protype-right' || $(this).attr('id') == 'protype-left')
                return;
            var page = $(this).text();
            protype.pages.page = page;
            protype.get();
        })
    },
    init: function(){
        protype.get();
    }
};
