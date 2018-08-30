
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
        refreshTimeline();
    } 
}

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

 /*
    TODO:
    - 編集のタイムラインバーに目盛り追加・操作可能・右クリックメニュー
    - ホットキーが押されたときにインジケータ表示
    -   Windows専用Downloadプロンプト
    - キーバインド設定
    - 編集内容を一時保存・ロード
    -   exoとして保存
    - メニューバー
    - * 音量設定
    - 拡大率設定 / 自動拡大率設定 ( 画面いっぱいに動画が来る )
    -   AviUtl exeditのtimelineと同じ要領でカット+クリックで削除
    - またはホットキーでcut positionのみ記録、自動で偶数番ごとのonair/offair判定。
    - 上２つをモード切替
    - シーンチェンジ / シーンチェンジSEを追加
*/