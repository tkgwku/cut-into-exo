
/* class Keybind */
var Keybind = function(keycode, ctrl, shift, alt, onkeypress, keydesc){
    this.keycode    = keycode;
    this.ctrl       = ctrl;
    this.shift      = shift;
    this.alt        = alt;
    this.onkeypress = onkeypress;
    this.keydesc    = keydesc;
}

Keybind.prototype.call = function(){
    this.onkeypress();
};

// keypress event
Keybind.prototype.iskeypressed = function(event){
    if (this.keycode !== event.keyCode  ) return false;
    if (this.ctrl    && !event.ctrlKey  ) return false;
    if (this.shift   && !event.shiftKey ) return false;
    if (this.alt     && !event.altKey   ) return false;
    return true;
};

Keybind.prototype.toString = function(){
    var str = '' + this.keycode;
    str += ',' + (this.ctrl ? '1' : '0');
    str += ',' + (this.shift ? '1' : '0');
    str += ',' + (this.alt ? '1' : '0');
    str += ',' + Keybind.keydescEscape(this.keydesc);
    return str;
}

Keybind.keydescEscape = function(str){
    return str.replace(/,/g, '%cma').replace(/:/g, '%cln').replace(/;/g, '%smc');
}

Keybind.keydescUnescape = function(str){
    return str.replace(/%cma/g, ',').replace(/%cln/g, ':').replace(/%smc/g, ';');
}

Keybind.prototype.fromString = function(str){
    var t = str.split(',');
    if (t.length === 5){
        return new Keybind(parseInt(t[0], 10), t[1] === '1', t[2] === '1', t[3] === '1', this.onkeypress, Keybind.keydescUnescape(t[4]));
    }
    return this;
}

Keybind.prototype.set = function(event){
    if (event.keyCode === 27){
        return new Keybind(-1, false, false, false, this.onkeypress, 'none');
    } else {
        var _d = '';
        _d += event.ctrlKey  ? 'ctrl + '  : '';
        _d += event.shiftKey ? 'shift + ' : '';
        _d += event.altKey   ? 'alt + '   : '';
        _d += event.key.replace(' ', 'space');
        return new Keybind(event.keyCode, event.ctrlKey, event.shiftKey, event.altKey, this.onkeypress, _d);
    }
}


/* class Scene */
var Scene = function(index, startSec, endSec, onAir){
    this.index    = index;
    this.startSec = startSec;
    this.endSec   = endSec;
    this.onAir    = onAir;
}

Scene.prototype.lengthSec = function(){
    return this.endSec - this.startSec;
}

Scene.prototype.barElem = function(duration, bg){
    return $('<div>', {
        'class': 'progress-bar '+(this.onAir ? bg : 'progress-bar-striped bg-secondary'),
        'style' : 'width:'+(this.lengthSec()*100/duration)+'%',
        'data-index' : this.index + ''
    });
}

Scene.prototype.toggle = function(){
    return new Scene(this.index, this.startSec, this.endSec, !this.onAir);
}

Scene.prototype.in = function(sec){
    return this.endSec > sec && sec > this.startSec;
}

/* class Cut */
var Cut = function(exeditStartFrame, exeditEndFrame, videoStartFrame){
    this.exeditStartFrame = exeditStartFrame;
    this.exeditEndFrame   = exeditEndFrame;
    this.videoStartFrame  = videoStartFrame;
}

Cut.prototype.lengthFrame = function(){
    return this.exeditEndFrame - this.exeditStartFrame + 1;
}


/* class config */
var Config = function(registryId){
    this.registryId = registryId;
    this.map        = {};
}

Config.prototype.put = function(key, value){
    this.map[key] = value;
}

Config.prototype.valueOf = function(key){
    return this.map[key];
}

Config.prototype.save = function(){
    var keys = Object.keys(this.map);
    var str = '';
    for (var i = 0; i < keys.length; i++) {
        str += '&' + Config.escape(keys[i]) + '=' + Config.escape(this.map[keys[i]]);
    }
    localStorage.setItem(this.registryId, str.substring(1));
}

Config.prototype.init = function(){
    var l = localStorage.getItem(this.registryId);
    if (l) {
        var m = l.match(/[^&=]+=[^&=]+/g);
        for (var i = 0; i < m.length; i++) {
            var s = m[i].split('=');
            this.put(Config.unescape(s[0]), Config.unescape(s[1]));
        }
    }
}

Config.prototype.has = function(key){
    return this.map.indexOf(key) !== -1;
}

Config.escape = function(str){
    return str.replace(/&/g, '%amp;').replace(/=/g, '%eq;');
}

Config.unescape = function(str){
    return str.replace(/%amp;/g, '&').replace(/%eq;/g, '=');
}


/* helper functions */
function exo(videoPath, cutArray, projectWidth, projectHeight, projectFps, projectAudioRate, extensionRate){
    var totalFrame = 0;
    var a = [];
    var v = [];

    for (var i = 0; i < cutArray.length; i++) {
        var cut = cutArray[i];

        totalFrame += cut.lengthFrame();

        v.push('['+i+']'                         );
        v.push('start=' + cut.exeditStartFrame   );
        v.push('end='   + cut.exeditEndFrame     );
        v.push('layer=1'                         );
        v.push('group=' + (i+1)                  );
        v.push('overlay=1'                       );
        v.push('camera=0'                        );

        v.push('['+i+'.0]'                       );
        v.push('_name=動画ファイル'              );
        v.push('再生位置=' + cut.videoStartFrame );
        v.push('再生速度=100.0'                  );
        v.push('ループ再生=0'                    );
        v.push('アルファチャンネルを読み込む=0'  );
        v.push('file='    + videoPath            );

        v.push('['+i+'.1]'                       );
        v.push('_name=標準描画'                  );
        v.push('X=0.0'                           );
        v.push('Y=0.0'                           );
        v.push('Z=0.0'                           );
        v.push('拡大率=' + extensionRate         );
        v.push('透明度=0.0'                      );
        v.push('回転=0.00'                       );
        v.push('blend=0'                         );

        a.push('[' + (cutArray.length+i) + ']'   );
        a.push('start=' + cut.exeditStartFrame   );
        a.push('end='   + cut.exeditEndFrame     );
        a.push('layer=2'                         );
        a.push('group=' + (i+1)                  );
        a.push('overlay=1'                       );
        a.push('audio=1'                         );

        a.push('[' + (cutArray.length+i) + '.0]' );
        a.push('_name=音声ファイル'              );
        a.push('再生位置=0.00'                   );
        a.push('再生速度=100.0'                  );
        a.push('ループ再生=0'                    );
        a.push('動画ファイルと連携=1'            );
        a.push('file='    + videoPath            );

        a.push('[' + (cutArray.length+i) + '.1]' );
        a.push('_name=標準再生'                  );
        a.push('音量=100.0'                      );
        a.push('左右=0.0'                        );
    }

    var o = [];
    o.push('[exedit]'                       );
    o.push('width='      + projectWidth     );
    o.push('height='     + projectHeight    );
    o.push('rate='       + projectFps       );
    o.push('scale=1'                        );
    o.push('length='     + totalFrame       );
    o.push('audio_rate=' + projectAudioRate );
    o.push('audio_ch=2'                     );

    return o.join('\n') + '\n' + v.join('\n') + '\n' + a.join('\n');
}

function sizeString(byte){
    if (byte < 500){
        return byte + " byte";
    } else if (byte < 500000){
        var a = Math.round( byte * 100 / 1024 ) / 100;
        return a + " KB";
    } else if (byte < 500000000){
        var a = Math.round( (byte * 100 / 1024) / 1024 ) / 100;
        return a + " MB";
    } else {
        var a = Math.round( ((byte * 100 / 1024) / 1024) / 1024 ) / 100;
        return a + " GB";
    }
}

function durationString(s){
    s = Math.round(s);
    if (s < 60){
        var a = Math.floor( s * 100 ) / 100;
        return a + " s";
    } else if (s < 60*60) {
        var a = Math.floor(s / 60);
        var b = s-a*60;
        return a + " m " + b + " s";
    } else {
        var a = Math.floor(s / 60*60     );
        var b = Math.floor((s-a*60*60)/60);
        var c = s-a*60*60-b*60;
        return a + " h " + b + " m " + c + " s";
    }
}

function fileURIToPath(fileUri){
    if (fileUri.match(/^file:\/\/\//)){
        return fileUri.replace(/^file:\/\/\//, "").replace(/\//g, "\\");
    } else {
        return fileUri;
    }
}

function pathToFileURI(filePath){
    if (!filePath.match(/^file:\/\/\//)){
        return "file:///"+filePath.replace(/\\/g, "/");
    } else {
        return filePath;
    }
}

function $svg(tag, attr){
    var m = tag.match(/^<([a-z]+)>$/);
    if (m) tag = m[1];
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    var o = Object.keys(attr);
    for (var i = 0; i < o.length; i++) {
        if (o[i] == 'text'){
            e.textContent = attr[o[i]];
        } else {
            e.setAttribute(o[i], attr[o[i]]);
        }
    }
    return e;
}

function secString(s){
    //s = Math.round(s);
    if (s < 60){
        return s + '秒';
    } else {
        var m = Math.floor(s/60);
        var s2 = s - m *60;
        return m + '分' + (s2===0?'':s2+'秒');
    }
}