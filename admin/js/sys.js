var sys = {
    create_editor: function(name, config){
        var editor = new wangEditor(name);
        editor.config.menus = config;
        editor.config.uploadImgUrl = util.img_url;
        editor.config.uploadImgFileName = 'img_file';
        editor.config.uploadParams = {};
        editor.config.uploadImgFns.onload = function(resultText, xhr){
            this.$txt.html('<img src="'+resultText+'" style="height:100px;">');
        }
        editor.create();
    },
    get_live_config: function(){
        util.ajax('get', '/config/get_homepage_config',{agent_id:company.agent_id}, function(datas, status){
            var cfg = datas.data;
            $('#editor-logo').html('<img src="'+cfg.logo_url+'" height=40>');
            $('#cs-phone').val(cfg.cs_telephone);
            $('#editor-wxpub').html('<img src="'+cfg.qr_code+'" height="100">');
            $('#qqs').val(cfg.cs_qq.join(' '));
            $('#editor-share').html('<img src="'+cfg.share_qrcode+'" height=100>');
            $('#editor-bg').html('<img src="'+cfg.bg_url+'" height=100>');
            $('#download-url').val(cfg.download_url);
            $('#support_qq').val(cfg.support_url);
            $('#help-url').val(cfg.help_url);
            $('#website_url').val(cfg.website_url);
            $('#unreg_watchtime').val(cfg.unreg_watchtime);
            $('#unreg_alerttime').val(cfg.unreg_alerttime);
        })
    },
    get_video_config: function(){
        util.ajax('get', '/config/get_vedio_config',{}, function(datas, status){
            var cfg = datas.data;
            $('#editor-gonggao').html(cfg.announcement);
            $('#video_url').val(cfg.video_url);
            $('#editor-ad').html('<img src="'+cfg.ad_url+'" width="100%">');
        })
    }
};
var company = {
    agent_id: 0,
    ready: function(){
        var qs = util.query_string('agent_id');
        if(util.user.group_id == 1 && qs){
            company.agent_id = qs;
            $('#title').html('<strong style="color: #00A0FF;">'+util.query_string('agent_name') + '</strong> 代理配置');
        }else{
            company.agent_id = parseInt(util.user.agent_id) || 1;
            var name = util.user.agent_name || '总公司'
            $('#title').html('<strong style="color: #00A0FF;">'+name+ '</strong> 代理配置');
        }
        var img_config = ['source','|','img'];
        sys.create_editor('editor-logo', img_config);
        sys.create_editor('editor-share', img_config);
        sys.create_editor('editor-wxpub', img_config);
        sys.create_editor('editor-bg', img_config);
    },
    load: function(){
        sys.get_live_config();
        $('#update-homepage').click(function(){
            var logo_url = $('#editor-logo').find('img').eq(0).attr('src');
            var cs_phone = $('#cs-phone').val();
            var wxpub_url = $('#editor-wxpub').find('img').eq(0).attr('src');
            var qqs = $('#qqs').val();
            var share_url = $('#editor-share').find('img').eq(0).attr('src');
            var download_url = $('#download-url').val();
            var support_qq = $('#support_qq').val();
            var help_url = $('#help-url').val();
            var website_url = $('#website_url').val();
            var unreg_watchtime = $('#unreg_watchtime').val();
            var unreg_alerttime = $('#unreg_alerttime').val();

            var bg_url = $('#editor-bg').find('img').eq(0).attr('src');
            var data = {
                'agent_id':company.agent_id,
                'logo_url':logo_url, 'cs_qq':qqs, 'qr_code':wxpub_url, 'bg_url':bg_url,
                'share_qrcode':share_url, 'help_url':help_url, 'support_url':support_qq,
                'website_url':website_url, 'cs_telephone':cs_phone, 'download_url':download_url,
                'unreg_watchtime':unreg_watchtime, 'unreg_alerttime':unreg_alerttime
            };
            util.ajax('post', '/config/save_homepage_config', data, function(datas, status){
                console.log(datas);
                util.alert('更新直播页配置信息成功');
                sys.get_live_config();
            })
        });
    },
    init: function(){
        company.ready();
        company.load();
    }
};
var video = {
    ready: function(){
        var tip_config = [
            'source','|','bold','underline','italic','strikethrough','eraser',
            'forecolor','bgcolor','|','fontfamily','fontsize','|','undo','redo'
        ];
        sys.create_editor('editor-gonggao', tip_config);
        sys.create_editor('editor-ad', ['source','|','img']);
    },
    load: function(){
        sys.get_video_config();
        $('#update-video').click(function(){
            var announcement = $('#editor-gonggao').html();
            var video_url = $('#video_url').val();
            var ad_url = $('#editor-ad').find('img').eq(0).attr('src');
            var data = {
                'announcement':announcement,
                'video_url':video_url,
                'ad_url':ad_url,
                'islive':1
            };
            util.ajax('post', '/config/save_vedio_config', data, function(datas, status){
                 util.alert('更新滚屏公告和视频链接成功');
            });
        });
    },
    init: function(){
        video.ready();
        video.load();
    }
};
