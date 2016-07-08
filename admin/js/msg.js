var news = {
    pages: {
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
        code += '<input type="text" id="news-title" placeholder="标题" data-required="true" class="form-control parsley-validated">';
         code += '</div></div><div class="form-group"><label class="col-lg-2 control-label">排序</label><div class="col-lg-3">';
        code += '<input type="text" id="news-sort" placeholder="排序" class="form-control"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label"> </label><div class="col-lg-9">';
        code += '<div class="container"><div id="'+editor_name+'" style="height:600px"></div></div></div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            title:$('#news-title').val(),
            content:$('#editor-news').html(),
            sort:$('#news-sort').val() || 0
        };
        if(!data.title || !data.content){
            util.alert('标题和内容不能为空');
            return;
        }
        util.ajax('post', '/info/save_announcement', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新《'+data.title+'》成功');
            news.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/delete_announcement', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            news.get();
        });
    },
    add: function(data){
        util.ajax('post','/info/add_announcement', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增消息《'+title+'》成功');
            news.get();
        })
    },
    get: function(){
        util.ajax('get', '/info/get_announcement', news.pages, function(datas, status){
            var ns = datas.data.news, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.title+'</td><td>'+obj.create_time+'</td><td>'+obj.sort+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="news-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="news-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#news-list').html(trlist.join(''));
            
            page_list = util.paging(total, news.pages, 'news-left', 'news-right');
            $('#news-page').html(page_list.join(''));
            news.op();
        })
    },
    op: function(){
        $('.news-edit').click(function(){ 
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var id = $(this).parent().attr('data-id'), code= news.gen_edit_code('editor-news');
            
            util.dialog('编辑公告信息', code, function(){
                news.update(id);
            }, function(){
                news.create_editor('editor-news');
                util.ajax('get', '/info/get_one_announcement', {id:id}, function(datas, status){
                    var obj = datas.data;
                    $('#news-title').val(obj.title);
                    $('#editor-news').html(obj.content);
                    $('#news-sort').val(obj.sort);
                });
            });
            
        });
        $('.news-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var title = $(this).parent().prev().prev().text();
            code = '您即将删除标题为<strong style="color:red">《'+title+'》</strong>的文章，确定删除，取消不删除';
            util.dialog('删除公告信息', code, function(){
                news.del(id);
            })
        });
        $('#add-news').click(function(){
            $('.modal-dialog').css({"width": "960px", "margin-left": "-455px"});
            var code = news.gen_edit_code('editor-news');
            util.dialog('新增公告信息', code, function(){
                var news_data = {
                    title:$('#news-title').val(),
                    content:$('#editor-news').html(),
                    sort:$('#news-sort').val() || 0
                };
                news.add(news_data);
            }, function(){
                news.create_editor('editor-news');
            });
        });
        $('#news-left').click(function(){
            if(news.pages.page <= 1)
                return;
            news.pages.page--;
            news.get();
        });
        $('#news-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(news.pages.page >= maxnum)
                return;
            news.pages.page++;
            news.get();
        });
        $('#news-page li a').click(function(){
            if($(this).attr('id') == 'news-right' || $(this).attr('id') == 'news-left')
                return;
            var page = $(this).text();
            news.pages.page = page;
            news.get();
        })
    },
    init: function(){
        news.get();
    }
};

var chat = {
    pages: {
        page:1,
        limit:20
    },
    flash: function(chats, total){
        var chat_list = [];
        for (var i in chats){
            var obj = chats[i];
            var code ='<tr><td>'+obj.id+'</td><td>'+obj.userid+'</td><td>'+obj.username+'</td><td>'+obj.name+'</td><td>'+obj.create_time+'</td><td>'+obj.ip+'</td><td>'+unescape(obj.content)+'</td>';
            code += '<td data-id = "'+obj.id+'"><a href="#" class="chat-rm">';
            code += '<i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
            chat_list.push(code);
        }
        $('#chat-list').html(chat_list.join(''));
        page_list = util.paging(total, chat.pages, 'chat-left', 'chat-right');
        $('#chat-page').html(page_list.join(''));
        chat.op();
    },
    del: function(id){
        util.ajax('get', '/info/del_chat', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            chat.get();
        });
    },
    get: function(){
        var data = {
            username: $('#chat-username').val() || '',
            nickname: $('#chat-nick').val() || '',
            content: escape($('#chat-cont').val()) || ''
        };
        if(!data.username && !data.nickname && !data.content){
            util.ajax('get', '/info/get_chat', chat.pages, function(datas, status){
                var chats = datas.data.chats, total = datas.data.total;
                chat.flash(chats, total);
            })
        }else{
            $.extend(data, chat.pages);
            util.ajax('get', '/info/search_chat', {'json':JSON.stringify(data)}, function(datas, status){
                 chat.flash(datas.data.chats, datas.data.total);
            });
        }
        return;
    },
    op: function(){
        $('.chat-rm').click(function(){
            $('.modal-dialog').css({"width": "500px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            var cont = $(this).parent().prev().prev().html();
            code = '您即将删除的聊天记录：<br><strong style="color:red">'+name+':'+cont+'</strong><br>确定删除，取消不删除';
            util.dialog('删除聊天记录', code, function(){
               chat.del(id);
            })
        });
        $('#chat-left').click(function(){
            if(chat.pages.page <= 1)
                return;
            chat.pages.page--;
            chat.get();
        });
        $('#chat-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(chat.pages.page >= maxnum)
                return;
            chat.pages.page++;
            chat.get();
        });
        $('#chat-page li a').click(function(){
            if($(this).attr('id') == 'chat-right' || $(this).attr('id') == 'chat-left')
                return;
            var page = $(this).text();
            chat.pages.page = page;
            chat.get();
        });
        $('#chat-search').click(function(){
            chat.pages.page = 1;
            chat.get();     
        })
    },
    init: function(){
        chat.get();
    }
};




            
            
            
