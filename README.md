# AviUtlカット編集バイパスプログラム 　(未完)

AviUtlのシークバーはやはり重い。   
なのでカット編集だけはブラウザ上とか、動画が軽いところでやろう、という発想です。   

### 仕組み解説

Javaで動画ファイルをドラッグアンドドロップ (DnD) できるウィンドウを作成してます。   
ffprobe様を使用させていただき動画情報を取得してJavascriptに渡してます。   
Javascriptはローカルで動いています。安全です。localhostではありません。   
編集画面は規定のブラウザで開きますがChromiumを想定しています。   
ブラウザ上でHTML5のvideo要素を使用しながら、タイムラインを使って編集します。   
編集内容はEXO形式で保存。AviUtlの拡張編集タイムラインにDnDして使います。

### ダウンロード

[リリースタブから](https://github.com/tkgwku/cut-into-exo/releases)   
まだベータ版なのでバグがあるかもしれません。  

### ショートカット

* Ctrl + Shift + S : EXO形式で保存   
* Enter : 現在位置でカット   

### 使用ライブラリ様
- [encoding.js](https://github.com/polygonplanet/encoding.js) - Shift_JISでEXOを保存するのに使わせていただいてます。
- [FFmpeg](https://www.ffmpeg.org/) - Javaで動画のメタデータを取得するのに使わせていただいてます。
- [jQuery](https://jquery.com/) - 言わずとしれたjQuery。
- [bootstrap](https://getbootstrap.com/) - 言わずとしれたbootstrap。CSSのみ使わせていただいてます。
- [jquery.mousewheel.js](https://github.com/jquery/jquery-mousewheel) - マウスホイール操作を扱うライブラリ。横スクロールって案外難しいのね...。

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html).   
(日本語訳) このソフトウェアは、[LGPL v2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) のライセンスのもと公開されている[FFmpeg](http://ffmpeg.org)のコードを使っています。   

FFmpegの中でも、ffprobe.exeをコマンドラインで使用しています。   
動画ファイルのメタデータ ( 長さやコーデックなど ) を取得するのに使っています。   

### ソースから実行する方法

できるかわからないけど

1. JDKをインストール
2. JDKのbinフォルダを環境変数に追加
3. JREの環境変数は消しても良いんじゃないかな
4. mavenをインストール
5. mavenのbinフォルダを環境変数に追加
---
6. `AviUtlTool`フォルダでコマンドラインを起動
7. ```mvn clean compile jar:jar```
8. `AviutlTool`下の`target`フォルダにjarが生成
9. ```java -jar target\jarname.jar```で起動

### 既知のバグ

- ビデオを細くカットしすぎると、div要素にpaddingを入れているためdiv要素が幅を持ってしまい、タイムラインがズレる。   
- ローカル下でのlocalStorageはファイルパスごとに別ドメイン扱いとなるため、kiriharikunのフォルダを移動するだけで設定が消える。
- タイムラインの秒数の表示が「最後」の表示とかぶる。
