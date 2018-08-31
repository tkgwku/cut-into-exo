
var project_width      = 1280;
var project_height     = 720;
var project_fps        = 60;
var project_audio_rate = 44100;

var keybinds = [
new Keybind ("vpp", 32, false, false, false, videoPlayPause ),
new Keybind ("cut", 13, false, false, false, cut            ),
new Keybind ("ie",  83, true,  true,  false, issueExo       )
];

var scene_array = [];

var filename, nb_frames, width, height, r_frame_rate, duration, size;

var title;

function init(){
    // load local storage data
    var l1 = localStorage.getItem('krhr_pwidth' );
    if (l1) $('#pwidth') .val(l1);
    var l2 = localStorage.getItem('krhr_pheight');
    if (l2) $('#pheight').val(l2);
    var l3 = localStorage.getItem('krhr_pfps'   );
    if (l3) $('#pfps')   .val(l3);
    var l4 = localStorage.getItem('krhr_selfps' );
    if (l4) $('#selfps') .val(l4);
    var l5 = localStorage.getItem('krhr_selsize');
    if (l5) $('#selsize').val(l5);

	// load video metadata
    var m = JAVA_QUERY.replace(/&apos;/g, "'").match(/[^?&]+=[^?&]*/g);
    if (m){
        for (var i = 0; i < m.length; i++) {
            var s = m[i].split('=');
            if (s[0] === 'filename'){
                filename = s[1];
            } else if (s[0] === 'nb_frames') {
                nb_frames = parseInt(s[1], 10);
            } else if (s[0] === 'width') {
                width = parseInt(s[1], 10);
            } else if (s[0] === 'height') {
                height = parseInt(s[1], 10);
            } else if (s[0] === 'duration') {
                duration = parseFloat(s[1], 10);
            } else if (s[0] === 'size'){
                size = parseInt(s[1], 10);
            } else if (s[0] === 'r_frame_rate') {
                if (s[1] === '0/0'){
                    r_frame_rate = 'VFR';
                } else {
                    var a = s[1].split('/');
                    if (a.length == 2){
                        r_frame_rate = parseInt(a[1], 10) / parseInt(a[0], 10);
                    }
                }
            }
        }
    }

    // set video source
    if (filename) {
        $('#video').append($('<source>', {
            'src': filename
        }));
        var m = filename.match(/([^\\.]+.[^\\.]+)$/);
        if (m && m.length >= 2){
            title = m[1];
        }
    }

    var table = $('<table>', {'class': 'table'});
    var tr1 = tr('ファイルのパス', filename);
    var tr2 = tr('総フレーム数', nb_frames);
    var tr3 = tr('幅', width);
    var tr4 = tr('高さ', height);
    var tr5 = tr('フレームレート', r_frame_rate);
    var tr6 = tr('長さ', durationString(duration));
    var tr7 = tr('ファイルサイズ', sizeString(size));
    table.append(tr1);
    table.append(tr2);
    table.append(tr3);
    table.append(tr4);
    table.append(tr5);
    table.append(tr6);
    table.append(tr7);
    $('#infotable').append(table);

    if (!duration && $('#video').get(0).duration) duration = $('#video').get(0).duration;

    if (duration) {
        scene_array = [new Scene(0, 0, duration, true)];
        //todo: ls

        // init timeline
        $('#timeline2').html('');
        $('#timeline2').append(tinmelineSvgElem());
        $('#timeline2').append(timelineSeekElem());
        $('#timeline2').append(timelineLayerElem());
    } 
}
//init end

// return table row jQuery element
function tr(a, b){
    var tr = $('<tr>');
    var td1 = $('<td>', {text:a});
    var td2 = $('<td>', {text:b});
    tr.append(td1);
    tr.append(td2);
    return tr;
}

$('#selsize').on('change', function(){
    var val = $('#selsize').val();
    if (val == "1080"){
        $('#pwidth').val(1920);
        $('#pheight').val(1080);
    } else if (val == "720"){
        $('#pwidth').val(1280);
        $('#pheight').val(720);
    } else if (val == "360"){
        $('#pwidth').val(640);
        $('#pheight').val(360);
    } else if (val == "540"){
        $('#pwidth').val(960);
        $('#pheight').val(540);
    }
    $('#pwidth').on('click');
    $('#pheight').on('click');
    localStorage.setItem('krhr_selsize', $('#selsize').val());
});

$('#selfps').on('change', function(){
    var val = $('#selsize').val();
    if (val == "60"){
        $('#pfps').val(60);
    } else if (val == "30"){
        $('#pfps').val(30);
    } else if (val == "29.97"){
        $('#pfps').val(29,.97);
    }
    $('#pfps').on('click');
    localStorage.setItem('krhr_selfps', $('#selfps').val());
});

$('#pwidth').on('change', function(){
    localStorage.setItem('krhr_pwidth', $('#pwidth').val());
});

$('#pheight').on('change', function(){
    localStorage.setItem('krhr_pheight', $('#pheight').val());
});

$('#pfps').on('change', function(){
    localStorage.setItem('krhr_pfps', $('#pfps').val());
});

$('#video').on('click', function(e){
    videoPlayPause();
});

function issueExo(){
    var cut_array = [];
    var extension_rate = 66.67;
    var frames = 0;
    for (var i = 0; i < scene_array.length; i++) {
        if (scene_array[i].onAir){
            var startFrame = Math.round(scene_array[i].startSec * project_fps);
            var endFrame   = Math.round(scene_array[i].endSec   * project_fps);
            var exeditStartFrame = frames + 1;
            var exeditEndFrame   = frames + endFrame - startFrame;
            cut_array.push(new Cut(exeditStartFrame, exeditEndFrame, startFrame+1));
            frames += endFrame - startFrame;
        }
    }
    var exo_content = exo(filename, cut_array, project_width, project_height, project_fps, project_audio_rate, extension_rate);
    promptWinExplorer('unnamed.exo', exo_content);
}

function promptWinExplorer(_filename, content){
    var str_array = Encoding.stringToCode(content);
    var sjis_array = Encoding.convert(str_array, "SJIS");
    var uint8_array = new Uint8Array(sjis_array);
    var file = new Blob([uint8_array], {type: 'text/plane;'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, _filename);
    } else {
        var a = document.createElement('a');
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = _filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function videoPlayPause(){
    var v = $('#video').get(0);
    if (v.paused) {
        v.play(); 
    } else {
        v.pause(); 
    }
}

function cut(){
    var currentTime = $('#video').get(0).currentTime;
    var _s = [];
    var _i = 0;
    for (var i = 0; i < scene_array.length; i++) {
        if (scene_array[i].in(currentTime)){
            _s.push(new Scene(_i, scene_array[i].startSec, currentTime, scene_array[i].onAir));
            _i++;
            _s.push(new Scene(_i, currentTime, scene_array[i].endSec, scene_array[i].onAir));
            _i++;
        } else {
            _s.push(scene_array[i]);
            _i++;
        }
    }
    scene_array = _s;
    refreshTimeline();
}

const bg = ['bg-1','bg-2','bg-3','bg-4','bg-5','bg-6','bg-7','bg-8'];

function refreshTimeline(){
    /*
    $('#timeline').html('');
    for (var i = 0; i < scene_array.length; i++) {
        var b = scene_array[i].barElem(duration, bg[i%8]);
        b.on('click', function(){
            var index = parseInt($(this).attr('data-index'), 10);
            if (!isNaN(index) && 0 <= index && index < scene_array.length){
                scene_array[index] = scene_array[index].toggle();
            }
            refreshTimeline();
        });
        $('#timeline').append(b);
    }
    */

    $('#tl_items').html('');
    appendTimelineItems($('#tl_items'), 'tl_video', 'tl_muted', '【動画ファイル】{{title}}');
    $('#tl_items_audio').html('');
    appendTimelineItems($('#tl_items_audio'), 'tl_audio', 'tl_muted_audio', '【音声ファイル】{{title}}');
}

function addPosition(){

}

$('body').on('keydown', function(e){
    for (var i = 0; i < keybinds.length; i++) {
        if (keybinds[i].iskeypressed(e)){
            e.preventDefault();
            keybinds[i].call();
            console.log(keybinds[i].id);
        }
    }
});

var timeline_width = 10000;//pixel
var timeline_interval = 60;//second

function tinmelineSvgElem(){
    var svg_wrapper = $('<div>', {
        'id': 'tl_ruler',
        click: function(e){
            var clientRect = this.getBoundingClientRect();
            var x = e.pageX - clientRect.left - window.pageXOffset - 16;
            if (x >= 0 && x < timeline_width){
                $('#video').get(0).currentTime = duration * x / timeline_width;
            }
        }
    });
    var times = Math.floor(duration/timeline_interval);
    var svg_elem = $svg('<svg>', {
        'xmlns':'http://www.w3.org/2000/svg',
        'xmlns:xlink':'http://www.w3.org/1999/xlink',
        'version':'1.1',
        'width': timeline_width + 332,
        'height': 48
    });
    // 0, 1, 2, ... , n-1, n
    for (var i = 0; i <= times; i++) {
        var sec = i * timeline_interval;//0, 10, ..., 10n
        var line_svg_pos_x = Math.round(sec * timeline_width / duration) + 16;
        svg_elem.append($svg('<text>', {
            text: secString(sec),
            'x': line_svg_pos_x,
            'y': 30,
            'text-anchor':'middle',
            'font-size': '16px'
        }));
        svg_elem.append($svg('<line>', {
            'x1': line_svg_pos_x,
            'y1': 34,
            'x2': line_svg_pos_x,
            'y2': 46,
            'stroke':'black'
        }));
    }
    svg_elem.append($svg('<line>', {
        'x1': 16,
        'y1': 40,
        'x2': (timeline_width + 16),
        'y2': 40,
        'stroke':'black'
    }));
    svg_elem.append($svg('<text>', {
        text: '最後',
        'x': timeline_width+16,
        'y': 30,
        'text-anchor':'middle',
        'font-size': '16px'
    }));
    svg_elem.append($svg('<line>', {
        'x1': timeline_width+16,
        'y1': 34,
        'x2': timeline_width+16,
        'y2': 46,
        'stroke':'black'
    }));

    svg_wrapper.append(svg_elem);
    return svg_wrapper;
}
function timelineSeekElem(){
    var seek_stick = $('<div>', {
        'id': 'tl_stick'
    });

    seek_stick.css('left', 15);

    var svg_seek = $svg('<svg>', {
        'xmlns':'http://www.w3.org/2000/svg',
        'xmlns:xlink':'http://www.w3.org/1999/xlink',
        'version':'1.1',
        'width': 2,
        'height': 136
    });

    svg_seek.append($svg('<line>', {
        'x1': 1,
        'y1': 8,
        'x2': 1,
        'y2': 144,
        'stroke':'#e51616'
    }));

    seek_stick.append(svg_seek);
    return seek_stick;
}

function timelineLayerElem(){
    var wrapper = $('<div>');
    var bar = $('<div>', {
        'id': 'tl_items'
    });
    appendTimelineItems(bar, 'tl_video', 'tl_muted', '【動画ファイル】{{title}}');
    var bar2 = $('<div>', {
        'id': 'tl_items_audio'
    });
    appendTimelineItems(bar2, 'tl_audio', 'tl_muted_audio', '【音声ファイル】{{title}}');
    wrapper.append(bar);
    wrapper.append(bar2);
    return wrapper;
}

function appendTimelineItems(elem, activeClass, muteClass, titleFormat){
    for (var i = 0; i < scene_array.length; i++) {
        var o = scene_array[i].onAir;

        var scene_width = Math.round(timeline_width * scene_array[i].lengthSec() / duration) + 'px';

        elem.append($('<div>',{
            text: titleFormat.replace(/\{\{title\}\}/g, title),
            'data-index': i,
            'class': 'tl_bar '+(o?activeClass:muteClass),
            'width': scene_width,
            click: function(){
                var index = parseInt($(this).attr('data-index'), 10);
                if (!isNaN(index) && 0 <= index && index < scene_array.length){
                    scene_array[index] = scene_array[index].toggle();
                }
                refreshTimeline();
            }
        }));
    }
}

$('#video').on('timeupdate', function(){
    var w = Math.round($('#video').get(0).currentTime * (timeline_width + 32) / duration - $('#timeline2').width() / 2);
    if (w < 0) w = 0;
    $('#timeline2').scrollLeft(w);
    $('#tl_stick').css('left', Math.round(15 + ($('#video').get(0).currentTime * timeline_width / duration)));
});
//なぜか重い

$('#timeline2').mousewheel(function(event, mov) {
    $('#timeline2').scrollLeft($('#timeline2').scrollLeft() - mov * 100);
    return false;   //縦スクロール不可
});

 /*
    TODO:
    - [done]  Windows専用Downloadプロンプト
    - [done]  exoとして保存
    - [done]  AviUtl exeditのtimelineと同じ要領でカット+クリックで削除
    - [done]　タイムラインをインタラクティブ化
    - 編集のタイムラインバーの右クリックメニュー
    - ホットキーが押されたときにインジケータ表示
    - キーバインド設定項目
    - 編集内容を一時保存・ロード
    - メニューバー
    - またはホットキーでcut positionのみ記録、自動で偶数番ごとのonair/offair判定。
    - 上２つをモード切替
    - シーンチェンジ / シーンチェンジSEを追加
    - シークバーを動かしたらload待ちにする ( 重いので )
    - ビデオ拡大率設定 / 自動拡大率設定 ( 画面いっぱいに動画が来る )
    - 目盛り追加
    - 目盛りの拡大率設定
    - 目盛りの値を動的に調整
    - タブで項目を表示 または ブロック化してCollapse
    - 配置設定 ( pos + size ) 画像を用いたわかりやすいGUI
    - カットされる予定の箇所を再生するときは動画上にOverlay ( 動画上HUD )
    - 注意書き

    WON'T:
    - 音量設定
*/