var dirty = {
    pages: {
        page:1,
        limit:15
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">脏字</label><div class="col-lg-9">';
        code += '<input type="text" id="dirty-name" placeholder="脏字" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            word: escape($('#dirty-name').val())
        };
        util.ajax('post', '/config/save_dirty_words', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新脏字 '+data.word+' 信息成功');
            dirty.get();
        })
    },
    del: function(id){
        util.ajax('get', '/config/delete_dirty_words', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            dirty.get();
        });
    },
    add: function(){
        var data = {
            words: escape($('#dirty-name').val())
        };
        util.ajax('post','/config/add_dirty_words', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增脏字 '+data.words+' 信息成功');
            dirty.get();
        })
    },
    get: function(){
        util.ajax('get', '/config/get_dirty_words', dirty.pages, function(datas, status){
            var ns = datas.data.dirtys, total = datas.data.total, trlist = [];
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+unescape(obj.words)+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="dirty-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="dirty-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#dirty-list').html(trlist.join(''));
            
            page_list = util.paging(total, dirty.pages, 'dirty-left', 'dirty-right');
            $('#dirty-page').html(page_list.join(''));
            dirty.op();
        })
    },
    op: function(){
        $('#add-dirty').click(function(){
            $('.modal-dialog').css({"width": "500px", "margin-left": "-250px"});
            var code= dirty.gen_edit_code();
            util.dialog('新增脏字信息', code, function(){
                dirty.add();
            });
        })
        $('.dirty-edit').click(function(){ 
            $('.modal-dialog').css({"width": "500px", "margin-left": "-250px"});
            var id = $(this).parent().attr('data-id'), code= dirty.gen_edit_code();
            var $tr = $(this).parent().parent();
            util.dialog('编辑脏字信息', code, function(){
                dirty.update(id);
            }, function(){
                $('#dirty-name').val($tr.children().eq(1).text());
            });
        });
        $('.dirty-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().text();
            code = '您即将删除脏字 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除脏字信息', code, function(){
                dirty.del(id);
            })
        });
        $('#dirty-left').click(function(){
            if(dirty.pages.page <= 1)
                return;
            dirty.pages.page--;
            dirty.get();
        });
        $('#dirty-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(dirty.pages.page >= maxnum)
                return;
            dirty.pages.page++;
            dirty.get();
        });
        $('#dirty-page li a').click(function(){
            if($(this).attr('id') == 'dirty-right' || $(this).attr('id') == 'dirty-left')
                return;
            var page = $(this).text();
            dirty.pages.page = page;
            dirty.get();
        })
    },
    init: function(){
        dirty.get();
    }
};

var ip = {
    pages: {
        page:1,
        limit:15
    },
    gen_edit_code: function(){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">IP地址</label><div class="col-lg-9">';
        code += '<input type="text" id="ip-name" placeholder="ip" data-required="true" class="form-control parsley-validated">';
        code += '</div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            ip: $('#ip-name').val()
        };
        util.ajax('post', '/config/save_deny_ip', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新脏字 '+data.ip+' 信息成功');
            ip.get();
        })
    },
    del: function(id){
        util.ajax('get', '/config/delete_deny_ip', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            ip.get();
        });
    },
    add: function(){
        var data = {
            ips: $('#ip-name').val()
        };
        util.ajax('post','/config/add_deny_ip', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增ip '+data.ips+' 信息成功');
            ip.get();
        })
    },
    get: function(){
        util.ajax('get', '/config/get_deny_ips', ip.pages, function(datas, status){
            var ns = datas.data.ips, total = datas.data.total, trlist = [];
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.words+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="ip-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="ip-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#ip-list').html(trlist.join(''));
            
            page_list = util.paging(total, ip.pages, 'ip-left', 'ip-right');
            $('#ip-page').html(page_list.join(''));
            ip.op();
        })
    },
    op: function(){
        $('#add-ip').click(function(){
            $('.modal-dialog').css({"width": "500px", "margin-left": "-250px"});
            var code= ip.gen_edit_code();
            util.dialog('新增IP信息', code, function(){
                ip.add();
            });
        })
        $('.ip-edit').click(function(){ 
            $('.modal-dialog').css({"width": "500px", "margin-left": "-250px"});
            var id = $(this).parent().attr('data-id'), code= ip.gen_edit_code();
            var $tr = $(this).parent().parent();
            util.dialog('编辑IP信息', code, function(){
                ip.update(id);
            }, function(){
                $('#ip-name').val($tr.children().eq(1).text());
            });
        });
        $('.ip-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().text();
            code = '您即将删除IP 为<strong style="color:red">'+name+'</strong>的信息，确定删除，取消不删除';
            util.dialog('删除IP信息', code, function(){
                ip.del(id);
            })
        });
        $('#ip-left').click(function(){
            if(ip.pages.page <= 1)
                return;
            ip.pages.page--;
            ip.get();
        });
        $('#ip-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(ip.pages.page >= maxnum)
                return;
            ip.pages.page++;
            ip.get();
        });
        $('#ip-page li a').click(function(){
            if($(this).attr('id') == 'ip-right' || $(this).attr('id') == 'ip-left')
                return;
            var page = $(this).text();
            ip.pages.page = page;
            ip.get();
        })
    },
    init: function(){
        ip.get();
    }
};

$(document).ready(function(){
    dirty.init();
    ip.init();
})
