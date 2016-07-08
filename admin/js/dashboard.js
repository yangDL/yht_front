var dashboard = {   
    get: function(){
        util.load();
        
        // 当前在线统计
        util.ajax('get', '/config/current_online',{ }, function(datas, status){
            if(datas.code == 0) {
                var data = datas.data;

                var count_user = data.user;
                var count_admin = data.admin;
                var count_robot = data.robot;
                var count_all = count_user + count_admin + count_robot;

                var html = '';

                html += '<div class="media">';
                html += '    <div class="pull-right media-small">会员</div>';
                html += '    <div class="progress bg-light">';
                html += '        <div class="progress-bar bg-danger" style="width: ' + count_user / count_all * 100  +'%">' + count_user + '</div>';
                html += '    </div>';
                html += '</div>';
                html += '<div class="media m-t-none">';
                html += '    <div class="pull-right media-small">管理员</div>';
                html += '    <div class="progress bg-light">';
                html += '        <div class="progress-bar bg-success" style="width: ' + count_admin / count_all * 100  +'%">' + count_admin + '</div>';
                html += '    </div>';
                html += '</div>';
                html += '<div class="media m-t-none">';
                html += '    <div class="pull-right media-small">机器人</div>';
                html += '    <div class="progress bg-light">';
                html += '        <div class="progress-bar bg-info" style="width: ' + count_robot / count_all * 100  +'%">' + count_robot + '</div>';
                html += '    </div>';
                html += '</div>';

                $('#report_current_online').html(html);

            } else {
                util.alert("获取报表失败 错误代码：" + datas.code + ' ' + datas.msg);
            }
        });

        // 会员在线时长 (分钟)
        util.ajax('get', '/config/user_chat_time',{ }, function(datas, status){
            if(datas.code == 0) {

                var html = '';
                var sum_max = -1;

                var data = datas.data;
                $.each(data, function(i, item) {

                    if(sum_max == -1)
                    {
                        sum_max = item.sum;
                    }
                    
                    html += '<div class="media">';   
                    html += '    <div class="pull-right media-small">' + item.username + '</div>';   
                    html += '    <div class="progress bg-light">';
                    html += '       <div class="progress-bar bg-' + dashboard.get_table_color(i) + '" style="width: ' + item.sum / sum_max * 100 + '%">' + item.sum + '</div>';   
                    html += '   </div>';
                    html += '</div>';
                });

                $('#report_user_chat_time').html(html);

            } else {
                util.alert("获取报表失败 错误代码：" + datas.code + ' ' + datas.msg);
            }
        });

        // 会员发言数 
        util.ajax('get', '/config/user_chat_count',{ }, function(datas, status){
            if(datas.code == 0) {

                var html = '';
                var sum_max = -1;

                var data = datas.data;
                $.each(data, function(i, item) {

                    if(sum_max == -1)
                    {
                        sum_max = item.sum;
                    }
                    
                    html += '<div class="media">';   
                    html += '    <div class="pull-right media-small">' + item.username + '</div>';   
                    html += '    <div class="progress bg-light">';
                    html += '       <div class="progress-bar bg-' + dashboard.get_table_color(i) + '" style="width: ' + item.sum / sum_max * 100 + '%">' + item.sum + '</div>';   
                    html += '   </div>';
                    html += '</div>';
                });

                $('#report_user_chat_count').html(html);

            } else {
                util.alert("获取报表失败 错误代码：" + datas.code + ' ' + datas.msg);
            }
        });

        // 最近30天新增会员数
        util.ajax('get', '/config/user_register_statics',{ }, function(datas, status){
            if(datas.code == 0) {

                var data_ids = '';
                var data_dates = '';

                var data = datas.data;
                $.each(data, function(i, item) {
                    
                    data_ids += item.count + ',';
                    data_dates += '<li>' + item.date +'</li>';

                });

                var html = '';

                html += '<div class="line line-large pull-in"></div>';
                html += '<div class="sparkline" data-type="line" data-resize="true" data-height="200" data-width="100%"';
                html += 'data-line-color="#a3e2fe" data-fill-color="#e3f6ff" data-highlight-line-color="#e1e5e9" data-spot-radius="5"';
                html += 'data-data="[' + data_ids.substr(0, data_ids.length - 1) + ']"></div>';
                html += '<ul class="list-inline text-muted axis">' + data_dates + '</ul>';

                $('#report_user_register_statics').html(html);

                $(".sparkline").each(function(){
                    var $data = $(this).data();
                    if(!$data.resize) return;
                    if($data.type == 'bar'){
                        !$data.barColor && ($data.barColor = "#3fcf7f");
                        !$data.barSpacing && ($data.barSpacing = 2);
                        $(this).next('.axis').find('li').css('width',$data.barWidth+'px').css('margin-right',$data.barSpacing+'px');
                    };
                    
                    ($data.type == 'pie') && $data.sliceColors && ($data.sliceColors = eval($data.sliceColors));
                    
                    $data.spotColor = $data.minSpotColor = $data.maxSpotColor = $data.highlightSpotColor = $data.lineColor;
                    $(this).sparkline( $data.data || "html", $data);

                    if($(this).data("compositeData")){
                        var $cdata = {};
                        $cdata.composite = true;
                        $cdata.spotRadius = $data.spotRadius;
                        $cdata.lineColor = $data.compositeLineColor || '#a3e2fe';
                        $cdata.fillColor = $data.compositeFillColor || '#e3f6ff';
                        $cdata.highlightLineColor =  $data.highlightLineColor;
                        $cdata.spotColor = $cdata.minSpotColor = $cdata.maxSpotColor = $cdata.highlightSpotColor = $cdata.lineColor;
                        isRgbaSupport() && ($cdata.fillColor = toRgba($cdata.fillColor, 0.5));
                        $(this).sparkline($(this).data("compositeData"),$cdata);
                    };
                    if($data.type == 'line'){
                        $(this).next('.axis').addClass('axis-full');
                    };
                });
            } else {
                util.alert("获取报表失败 错误代码：" + datas.code + ' ' + datas.msg);
            }
        });
    },
    get_table_color: function(i){
        switch(i) {
            case 0:
                return 'danger';
            case 1:
                return 'success';
            case 2:
                return 'info';
            case 3:
                return 'warning';
            case 4:
                return 'primary';
            default:
                return 'default';
        }
    },
    init: function(){
        this.get();
    }
};

$(document).ready(function(){
    dashboard.init();
});