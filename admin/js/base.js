var cache = {
    remove: function(key){
        window.sessionStorage.removeItem(key);
    },
    set: function(key, value, duration) {
        var data = {
            value: value,
            expiryTime: !duration || isNaN(duration) ? 0 : this._getCurrentTimeStamp() + parseInt(duration)
        };
        window.sessionStorage[key] = JSON.stringify(data);
    },
    get: function(key) {
        var data = window.sessionStorage[key];
        if (!data || data === "null") {
            return null;
        }
        var now = this._getCurrentTimeStamp();
        var obj;
        try {
            obj = JSON.parse(data);
        } catch (e) {
            return null;
        }
        if (obj.expiryTime === 0 || obj.expiryTime > now) {
            return obj.value;
        }
        return null;
    },
    _getCurrentTimeStamp: function() {
        return Date.parse(new Date()) / 1000;
    }
};
//var addr = '192.168.0.109:9000'; 
var addr = '119.29.94.190:83';
var util = {
    pre_url : 'http://'+addr,
    img_url : 'http://119.29.94.190:83/upload/upload_img',
    user: null,
    is_phone: function(str){
        if(!str) return false;
        var reg = /^(1[35678][0-9]{9})$/;
        return reg.test(str);
    },
    query_string: function(key){
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) return unescape(r[2]); return null; 
    },
    loading: function() {
        $('#html').css('overflow-y', 'hidden');
        $('.sk-loading').css('display', 'block');
        $('.zdc').css('display', 'block');
    },
    loaded: function() {
        $('.sk-loading').hide();
        $('.zdc').hide();
        $('html').css('overflow-y', 'auto');
    },
    dialog: function(title, body, callback, othercall){
        $('#dialog .modal-title').html(title);
        $('#dialog .modal-body').html(body);
        $('#dialog').modal('show');
        othercall && othercall(); 
        $('#modal-btn').off();
        !callback ? $('.modal-footer').hide() : $('.modal-footer').show();
        $('#modal-btn').click(function(){
           callback();
        })  
    },
    alert: function(msg){
        $('.modal-dialog').css('margin-top', '10%');
        $('#tip .modal-body').html(msg);
        $('#tip').modal('show');
    },
    get_val: function(id){
        var value = $('#'+id).val();
        if(!value){
            $('#'+id).next().show();
            $('#'+id).focus();
        }
        else
            $('#'+id).next().hide();
        return value;
    },
    ajax: function(method, url, data, callback, need_user){
        if(need_user !== false){
            util.load();
            var admin_id = util.user.admin_id;
            var token = util.user.token;
            if ('get' == method.toLowerCase()){
                var _data = {'admin_id':admin_id, 'token':token};
                data = $.extend(data, _data);
            }else{
                if(url.indexOf('?') == -1)
                    url = url +'?admin_id='+admin_id+'&token='+token;
                else{
                    url = url +'&admin_id='+admin_id+'&token='+token;
                }
            }  
        }
        $.ajax({
            type:method,
            url :util.pre_url + url,
            data:data,
            beforeSend: function() {util.loading();},
            complete: function() {util.loaded();},
            success: function(datas, status){
                if(datas.code == -9){
                    util.alert('该账号已在其他地方登录，请重新登录。');
                    yihaoT.logout();
                    return;
                }else if(datas.code == 0){
                    callback(datas, status);
                }else{
                    util.alert(datas.msg);
                }
            },
            error: function(status) {
                util.alert("无法连接网络，请check网络连接和服务器");
                return false;
            }
        });
    },
    paging: function(total, pages, left_id, right_id){
        var max_page = parseInt(total / pages.limit) + 1, page_list = [];
        if(pages.page > 1){
            page_list.push('<li><a href="javascript:;" id="'+left_id+'"><i class="icon-chevron-left"></i></a></li>');
            page_list.push('<li><a href="javascript:;">1</a></li>');
        }else{
            page_list.push('<li class="active"><a href="javascript:;">1</a></li>');
        }
            
        first_page = pages.page > 4 ? pages.page - 2 : 2;
        last_page = max_page - first_page > 3 ? first_page+4 : max_page;
        for (var i = first_page; i <= last_page; i++){
            var code = '';
            if(pages.page == i){
                code = '<li class="active"><a href="javascript:;">'+i+'</a></li>';
            }else{
                code = '<li><a href="javascript:;">'+i+'</a></li>';
            }
            page_list.push(code);
        }
        if(last_page != max_page)
            page_list.push('<li><a href="javascript:;">'+max_page+'</a></li>');  
        if(pages.page < max_page)
        page_list.push('<li><a href="javascript:;" id="'+right_id+'"><i class="icon-chevron-right"></i></a></li>');
        return page_list;
    },
    logout: function(){
        cache.remove('yihaoTong::admin::user');
        location.href = 'signin.html';
    },
    load: function(){
        if(!util.user){
            var user = cache.get('yihaoTong::admin::user');
            if(!user)location.href='signin.html';
            util.user = user;
            util.img_url = util.img_url + '?admin_id='+user.admin_id+'&token='+user.token;
            $('.user-nick').text(user.nickname);
            $('#user-agent').text('所属公司:'+ (user.agent_name || '无'));
            if(user && user.group_id == 5)
                $('#self-url').html('您的推广链接为 : <b>http://zhibo.yht134.com/?m='+user.admin_id+'</b>');
            var pagename = window.location.pathname.split('/').pop().replace('.', '-');
            util.ajax('get', '/admin/nav_list', {id:util.user.admin_id}, function(datas, status){
                $('#nav').html(datas.data.nav);
                $('#nav li').each(function(){
                   var class_str = $(this).attr('class');
                   if(class_str.indexOf(pagename) != -1){
                       $(this).addClass('active');
                       $(this).children('div').css({'height':'auto'});
                       return;
                   }
                });
            });
        }
        $('#dialog').on('shown.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height();
            dia.animate({'margin-top':($(window).height()-h)/3}, 500);
        });
        $('#dialog').on('hidden.bs.modal', function (e) {
            var dia = $('#dialog .modal-dialog'), h = dia.height();
            dia.css({'margin-top':0});
        });
    }
    
};
