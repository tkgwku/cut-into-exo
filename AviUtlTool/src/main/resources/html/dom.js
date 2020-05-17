
var project_width      = 1280;
var project_height     = 720;
var project_fps        = 60;
var project_audio_rate = 44100;

var keybinds = {
    'vpp' : new Keybind (32, false, false, false, videoPlayPause , 'space'),
    'cut' : new Keybind (13, false, false, false, cut            , 'enter'),
    'ie'  : new Keybind (83, true,  true,  false, issueExo       , 'ctrl + shift + s'),
    'ta'  : new Keybind (39, false, false, false, tenFrameAftre  , 'arrowright'),
    'tb'  : new Keybind (37, false, false, false, tenFrameBefore , 'arrowleft'),
    'oa'  : new Keybind (-1, false, false, false, oneFrameAftre  , 'none'),
    'ob'  : new Keybind (-1, false, false, false, oneFrameBefore , 'none'),
    'etl' : new Keybind (-1, false, false, false, expandTL       , 'none'),
    'stl' : new Keybind (-1, false, false, false, shrinkTL       , 'none')
};

var scene_array = [];

var config;

var filename, nb_frames, width, height, r_frame_rate, duration, size, sample_rate;

var title;

function init(){
    // load video metadata
    if (!JAVA_FILE_PATH) {
        document.write("JAVAからのクエリが存在しません");
        return;
    }

    filename = JAVA_FILE_PATH.replace(/&apos;/g, "'");

    var m = JAVA_VIDEO_STREAM.replace(/&apos;/g, "'").match(/[^?&]+=[^?&]*/g);
    if (m){
        for (var i = 0; i < m.length; i++) {
            var s = m[i].split('=');
            if (s[0] === 'nb_frames') {
                nb_frames = parseInt(s[1], 10);
            } else if (s[0] === 'width') {
                width = parseInt(s[1], 10);
            } else if (s[0] === 'height') {
                height = parseInt(s[1], 10);
            } else if (s[0] === 'duration') {
                duration = parseFloat(s[1], 10);
            } else if (s[0] === 'r_frame_rate') {
                if (s[1] === '0/0'){
                    r_frame_rate = 'VFR';
                } else {
                    var a = s[1].split('/');
                    if (a.length == 2){
                        r_frame_rate = (parseInt(a[0], 10) / parseInt(a[1], 10)) + ' fps';
                    }
                }
            }
        }
    }

    var m2 = JAVA_AUDIO_STREAM.replace(/&apos;/g, "'").match(/[^?&]+=[^?&]*/g);
    if (m2){
        for (var i = 0; i < m2.length; i++) {
            var s2 = m2[i].split('=');
            if (s2[0] === 'sample_rate'){
                sample_rate = s2[1];
            }
        }
    }

    var m3 = JAVA_FORMAT.replace(/&apos;/g, "'").match(/[^?&]+=[^?&]*/g);
    if (m3){
        for (var i = 0; i < m3.length; i++) {
            var s3 = m3[i].split('=');
            if (s3[0] === 'size'){
                size = parseInt(s3[1], 10);
            }
        }
    }

    config = new Config('krhr_pref');
    config.init();

    // load local storage data
    var l1 = config.valueOf('pwidth');
    if (l1) {
        $('#pwidth').val(l1);
        project_width = parseInt(l1, 10);
    }
    var l2 = config.valueOf('pheight');
    if (l2) {
        $('#pheight').val(l2);
        project_height = parseInt(l2, 10);
    }
    var l3 = config.valueOf('pfps');
    if (l3) {
        $('#pfps').val(l3);
        project_fps = parseInt(l3, 10);
    }
    var l4 = config.valueOf('selfps');
    if (l4) {
        $('#selfps').val(l4);
    }
    var l5 = config.valueOf('selsize');
    if (l5) {
        $('#selsize').val(l5);
    }
    var l6 = config.valueOf('tlwidth');
    if (l6) {
        timeline_width = tlwidth_table[parseInt(l6, 10)];
        $('#tlwidth_indicater').text(timeline_width+'px');
        properTLInterval();
        $('#tlwidth').val(l6);
    }

    var keybind_ls = localStorage.getItem('krhr_kb');
    if (keybind_ls){
        var kls = keybind_ls.split(';');
        for (var i = 0; i < kls.length; i++) {
            var klskv = kls[i].split(':');
            if (klskv.length === 2){
                var id = klskv[0];
                var kb = keybinds[id].fromString(klskv[1]);
                $('#kb_'+id).text(kb.keydesc);
                if (kb.keycode === -1){
                    $('#kb_'+id).addClass('font-italic');
                } else {
                    $('#kb_'+id).removeClass('font-italic');
                }
                keybinds[id] = kb;
            }
        }
    }

    refreshPSetting();

    // set video source
    if (filename) {
        $('#video').append($('<source>', {
            'src': filename
        }));
        var m4 = filename.match(/([^\\]+.[^\\.]+)$/);
        if (m4 && m4.length >= 2){
            title = m4[1];
        }
    }

    var table = $('<table>', {'class': 'table'});
    var tr0 = trh('Key', 'Value');
    var tr1 = tr('ファイルのパス', filename);
    var tr2 = tr('総フレーム数', nb_frames);
    var tr3 = tr('幅', width);
    var tr4 = tr('高さ', height);
    var tr5 = tr('フレームレート', r_frame_rate);
    var tr6 = tr('長さ', durationString(duration));
    var tr7 = tr('ファイルサイズ', sizeString(size));
    var tr8 = tr('音声レート', sample_rate+' hz');
    table.append(tr0);
    table.append(tr1);
    table.append(tr2);
    table.append(tr3);
    table.append(tr4);
    table.append(tr5);
    table.append(tr6);
    table.append(tr7);
    table.append(tr8);
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

    updateSeekbar();
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

// return table header row jQuery element
function trh(a, b){
    var tr = $('<tr>', {'class':'text-muted'});
    var td1 = $('<th>', {text:a});
    var td2 = $('<th>', {text:b});
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
});

$('#selfps').on('change', function(){
    var val = $('#selfps').val();
    if (val.match(/^[0-9.]+$/)) $('#pfps').val(parseFloat(val));
});

const tlwidth_table = [300, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 18000, 23000, 27000];

$('#tlwidth').on('input', function() {
    var i = parseInt($(this).val(), 10);
    timeline_width = tlwidth_table[i];
    $('#tlwidth_indicater').text(timeline_width+'px');
    properTLInterval();
    $('#timeline2').html('');
    $('#timeline2').append(tinmelineSvgElem());
    $('#timeline2').append(timelineSeekElem());
    $('#timeline2').append(timelineLayerElem());
    updateTLScroll();
    updateSeekStick();
    config.put('tlwidth', i+'');
    config.save();
});

$('#psubmitchange').on('click', function(){
    project_width = parseInt($('#pwidth').val(), 10);
    project_height = parseInt($('#pheight').val(), 10);
    project_fps = parseInt($('#pfps').val(), 10);

    refreshPSetting();

    config.put('selsize', $('#selsize').val());
    config.put('selfps', $('#selfps').val());
    config.put('pwidth', $('#pwidth').val());
    config.put('pheight', $('#pheight').val());
    config.put('pfps', $('#pfps').val());

    config.save();
});

function refreshPSetting(){
    $('#ps_indicater').text('(現在の設定: 解像度: ' + project_width + '*'+project_height+',  FPS: '+project_fps+')');
}

$('#video-wrapper').on('click', function(e){
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

function refreshTimeline(){
    $('#tl_items').html('');
    appendTimelineItems($('#tl_items'), 'tl_video', 'tl_muted', '【動画ファイル】{{title}}');
    $('#tl_items_audio').html('');
    appendTimelineItems($('#tl_items_audio'), 'tl_audio', 'tl_muted_audio', '【音声ファイル】{{title}}');
}

var monitoring = '';
var editelem = null;

var expire_time = 0;
var pressed_index = -1;

$('body').on('keydown', function(e){
    if (monitoring != ''){
        e.preventDefault();
        if (e.keyCode !== 18 && e.keyCode !== 17 && e.keyCode !== 16){
            if (alreadyRegistered(e)){
                $(editelem).text('すでに登録済みのキー');
                $(editelem).removeClass('text-muted');
                $(editelem).addClass('text-danger');
            } else {
                setKey(monitoring, e);
            }
        }
        return;
    }
    var keys = Object.keys(keybinds);
    for (var i = 0; i < keys.length; i++) {
        var keybind = keybinds[keys[i]];
        if (keybind.iskeypressed(e)){
            e.preventDefault();
            if (expire_time === 0 || pressed_index !== i || expire_time < Date.now()){
                expire_time = Date.now() + 100;//100ms
                pressed_index = i;
                keybind.call();
            }
        }
    }
});

function alreadyRegistered(e){
    var keys = Object.keys(keybinds);
    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        if (monitoring === id){
            continue;
        }
        var keybind = keybinds[id];
        if (keybind.iskeypressed(e)){
            return true;
        }
    }
    return false;
}

function setKey(id, event){
    keybinds[id] = keybinds[id].set(event);
    localStorage.setItem('krhr_kb', keybindString());
    $(editelem).removeClass('text-danger');
    $(editelem).removeClass('text-muted');
    $(editelem).text(keybinds[id].keydesc);
    if (keybinds[id].keycode === -1){
        $(editelem).addClass('font-italic');
    } else {
        $(editelem).removeClass('font-italic');
    }
    monitoring = '';
    editelem = null;
}

function keybindString(){
    var str = '';
    var keys = Object.keys(keybinds);
    for (var i = keys.length - 1; i >= 0; i--) {
        var id = keys[i];
        var keybind = keybinds[id];
        str += id + ':' + keybind.toString() + ';';
    }
    return str;
}

function editKey(id, elem){
    $(elem).text('ホットキーを登録...');
    $(elem).addClass('text-muted');
    monitoring = id;
    editelem = elem;
}

function tenFrameAftre(){
    $('#video').get(0).currentTime += 10 / project_fps;
}

function tenFrameBefore(){
    $('#video').get(0).currentTime -= 10 / project_fps;
}

function oneFrameAftre(){
    $('#video').get(0).currentTime += 1 / project_fps;
}

function oneFrameBefore(){
    $('#video').get(0).currentTime -= 1 / project_fps;
}

function expandTL(){
    var v = parseInt($('#tlwidth').val(), 10) + 1;
    if (v !== tlwidth_table.length){
        timeline_width = tlwidth_table[v];
        $('#tlwidth').val(v);
        $('#tlwidth_indicater').text(timeline_width+'px');
        properTLInterval();
        $('#timeline2').html('');
        $('#timeline2').append(tinmelineSvgElem());
        $('#timeline2').append(timelineSeekElem());
        $('#timeline2').append(timelineLayerElem());
        updateTLScroll();
        updateSeekStick();
        config.put('tlwidth', v+'');
        config.save();
    }
}

function shrinkTL(){
    var v = parseInt($('#tlwidth').val(), 10) -1;
    if (v !== -1){
        timeline_width = tlwidth_table[v];
        $('#tlwidth').val(v);
        $('#tlwidth_indicater').text(timeline_width+'px');
        properTLInterval();
        $('#timeline2').html('');
        $('#timeline2').append(tinmelineSvgElem());
        $('#timeline2').append(timelineSeekElem());
        $('#timeline2').append(timelineLayerElem());
        updateTLScroll();
        updateSeekStick();
        config.put('tlwidth', v+'');
        config.save();
    }
}

var timeline_width = 10000;//pixel
var timeline_interval = 60;//second
var timeline_smaller_interval = 6;

const interval_list = [5, 10, 20, 30, 60, 90, 120, 180, 240, 300, 360, 420, 480, 600];
const smaller_interval_list = [1, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36, 42, 48, 60];

function properTLInterval(){
    var sec_per_px = duration / timeline_width;
    var min_sec = sec_per_px * 100;
    var max_sec = sec_per_px * 400;

    if (duration < max_sec){
        max_sec = duration;
    }

    for (var i = interval_list.length - 1; i >= 0; i--) {
        if (min_sec < interval_list[i] && interval_list[i] < max_sec){
            timeline_interval = interval_list[i];
            timeline_smaller_interval = smaller_interval_list[i];
            return;
        }
    }
    if (min_sec <=interval_list[0]) {
        timeline_interval = interval_list[0];
        timeline_smaller_interval = smaller_interval_list[0];
        return;
    }
    timeline_interval = interval_list[interval_list.length -1];
    timeline_smaller_interval = smaller_interval_list[smaller_interval_list.length -1];
    return;
}

function tinmelineSvgElem(){
    var svg_wrapper = $('<div>', {
        'id': 'tl_ruler',
        click: function(e){
            var clientRect = this.getBoundingClientRect();
            var x = e.pageX - clientRect.left - window.pageXOffset - 16;
            if (x < 0) x = 0;
            if (x > timeline_width) x = timeline_width;
            $('#video').get(0).currentTime = duration * x / timeline_width;
        }
    });
    var svg_width = timeline_width + 60;
    var svg_height = 48;
    var scale = 2;
    var svg_elem = $svg('<svg>', {
        'xmlns':'http://www.w3.org/2000/svg',
        'xmlns:xlink':'http://www.w3.org/1999/xlink',
        'version':'1.1',
        'viewBox':'0 0 '+(svg_width*scale)+' '+(svg_height*scale),
        'width': svg_width,
        'height': svg_height
    });
    for (var sec = 0; sec < duration; sec += timeline_smaller_interval) {
        var line_svg_pos_x = Math.round(sec * timeline_width / duration) + 16;
        if (sec % timeline_interval === 0){
            svg_elem.append($svg('<text>', {
                text: secString(sec),
                'x': line_svg_pos_x*scale,
                'y': 30*scale,
                'text-anchor':'middle',
                'font-size': (12*scale)+'px'
            }));
            svg_elem.append($svg('<line>', {
                'x1': line_svg_pos_x*scale,
                'y1': 34*scale,
                'x2': line_svg_pos_x*scale,
                'y2': 46*scale,
                'stroke':'#777',
                'stroke-width':4
            }));
        } else {
            svg_elem.append($svg('<line>', {
                'x1': line_svg_pos_x*scale,
                'y1': 34*scale,
                'x2': line_svg_pos_x*scale,
                'y2': 40*scale,
                'stroke':'#ccc',
                'stroke-width':4
            }));
        }
    }
    svg_elem.append($svg('<line>', {
        'x1': 16*scale,
        'y1': 40*scale,
        'x2': (timeline_width + 16)*scale,
        'y2': 40*scale,
        'stroke':'#777',
        'stroke-width':4
    }));
    svg_elem.append($svg('<text>', {
        text: '最後',
        'x': (timeline_width+16)*scale,
        'y': 30*scale,
        'text-anchor':'middle',
        'font-size': (12*scale)+'px'
    }));
    svg_elem.append($svg('<line>', {
        'x1': (timeline_width+16)*scale,
        'y1': 34*scale,
        'x2': (timeline_width+16)*scale,
        'y2': 46*scale,
        'stroke':'#777',
        'stroke-width':4
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
    updateTLScroll();
    updateSeekStick();
    updateSeekbar();
});
//なぜか重い

$('#timeline2').mousewheel(function(event, mov) {
    $('#timeline2').scrollLeft($('#timeline2').scrollLeft() - mov * 100);
    return false;
});

function updateSeekStick(){
    $('#tl_stick').css('left', Math.round(15 + ($('#video').get(0).currentTime * timeline_width / duration)));
}

function updateSeekbar(){
    var i = $('#video').get(0).currentTime * 100 / duration;
    $('#vc-seekbar').css('width',i+'%');
}

function updateTLScroll(){
    var w = Math.round($('#video').get(0).currentTime * (timeline_width + 32) / duration - $('#timeline2').width() / 2);
    if (w < 0) w = 0;
    $('#timeline2').scrollLeft(w);
}

const tab_id_list = ['tab_settings', 'tab_proj_settings', 'tab_property', 'tab_keybind'];

function tab(id){
    for (var i = 0; i < tab_id_list.length; i++) {
        if (tab_id_list[i] === id){
            $('#'+id).removeClass('silent');
            $('#nav_'+id).addClass('active');
        } else {
            $('#'+tab_id_list[i]).addClass('silent');
            $('#nav_'+tab_id_list[i]).removeClass('active');
        }
    }
}

$('#vc-seekbar-wrapper').on('click', function(e) {
    var clientRect = this.getBoundingClientRect();
    var x = e.pageX - clientRect.left - window.pageXOffset;
    var i = Math.min(1, Math.max(0, x / $('#vc-seekbar-wrapper').outerWidth()));
    $('#video').get(0).currentTime = duration * i;
});

 /*
    TODO:
    - [done]  Windows専用Downloadプロンプト
    - [done]  exoとして保存
    - [done]  AviUtl exeditのtimelineと同じ要領でカット+クリックで削除
    - [done]  タイムラインをインタラクティブ化
    - [done]  目盛り追加
    - [done]  目盛りの拡大率設定
    - [done]  目盛りの値を動的に調整
    - [done]  タブで項目を表示 または ブロック化してCollapse
    - [done]  メニューバー
    - [done]  実行可能jarとしてエクスポート
    - 編集のタイムラインバーの右クリックメニュー
    - ホットキーが押されたときにインジケータ表示
    - キーバインド設定項目
    - 編集内容を一時保存・ロード
    - シーンチェンジ / シーンチェンジSEを追加
    - シークバーを動かしたらload待ちにする ( 重いので )
    - ビデオ拡大率設定 / 自動拡大率設定 ( 画面いっぱいに動画が来る )
    - 配置設定 ( pos + size ) 画像を用いたわかりやすいGUI
    - カットされる予定の箇所を再生するときは動画上にOverlay ( 動画上HUD )
    - 注意書き
    - 10秒飛ばす
    - 30秒飛ばす
    - sample rate
    - 再生音量
*/
