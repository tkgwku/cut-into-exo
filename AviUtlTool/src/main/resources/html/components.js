
/* class Keybind */
var Keybind = function(id, keycode, ctrl, shift, alt, onkeypress){
    this.id         = id;
    this.keycode    = keycode;
    this.ctrl       = ctrl;
    this.shift      = shift;
    this.alt        = alt;
    this.onkeypress = onkeypress;
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

Keybind.prototype.setkeycode = function(keycode){
    this.keycode = keycode;
};


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
    if (byte < 100){
        return byte + " byte";
    } else if (byte < 100000){
        var a = Math.round( byte * 1000 / 1024 ) / 1000;
        return a + " KB";
    } else {
        var a = Math.round( (byte * 1000 / 1024) / 1024 ) / 1000;
        return a + " GB";
    }
}

function durationString(s){
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