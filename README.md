## 【未完成】カット編集をブラウザ上でやるプログラム   

容量の大きい動画ファイルを開くとAviUtlのシークバーが重くなる。   
一方HTML5のvideo要素はそんなファイルでもスムーズに動画再生ができる。   
→ カット編集だけはブラウザ上とか、動画が軽いところでできないかな、という発想です。   

### 仕組み

動画ファイルをドラッグ&ドロップ(Javaによる画面)。   
動画情報を取得(ffprobeを使用)。   
編集画面が開く(ローカルのHTMLファイル)。   

編集画面は規定のブラウザで開きますがChromiumを想定しています。   
ブラウザ上でHTML5のvideo要素を使用しながら、タイムラインを使って編集します。   
編集内容をEXO形式で保存し、AviUtlの拡張編集タイムラインにドラッグ&ドロップして使います。

### ダウンロード(一応形になったもの)

[リリースタブから](https://github.com/tkgwku/cut-into-exo/releases)   

### ショートカット

* Ctrl + Shift + S : EXO形式で保存   
* Enter : 現在位置でカット  
等

### 使用させていただいたライブラリ
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

ゆくゆくはGradleなるものを使ってみたい。

mavenとjdkをインストール
1. JDKをインストール
2. (JDKのbinフォルダを環境変数に追加)
3. mavenをインストール
4. mavenのbinフォルダを環境変数に追加
---
コンパイル
1. `AviUtlTool`フォルダでコマンドラインを起動
2. ```mvn clean compile jar:jar```
3. `AviutlTool`下の`target`フォルダにjarが生成
4. ```java -jar target\jarname.jar```で起動

### 既知のバグ

- ビデオを細くカットしすぎると、div要素にpaddingを入れているためdiv要素が幅を持ってしまい、タイムラインがズレる。   
- ローカル下でのlocalStorageはファイルパスごとに別ドメイン扱いとなるため、kiriharikunのフォルダを移動するだけで設定が消える。
- タイムラインの秒数の表示が「最後」の表示とかぶる。
