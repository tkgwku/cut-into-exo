# AviUtlカット編集バイパスプログラム 　(未完)

AviUtlのシークバーはやはり重い。   
なのでカット編集だけはブラウザ上とか、動画が軽いところでやろう、という発想です。   

Javaで動画ファイルをドラッグアンドドロップ (DnD) できるウィンドウを作成してます。   
ffprobe様を使用させていただき動画情報を取得してJavascriptに渡してます。   
Javascriptはローカルで動いています。安全です。localhostではありません。   
編集画面は規定のブラウザで開きますがChromiumを想定しています。   
ブラウザ上でHTML5のvideo要素を使用しながら、タイムラインを使って編集します。   
編集内容はEXO形式で保存。AviUtlの拡張編集タイムラインにDnDして使います。

### ショートカット

* Ctrl + Shift + S : EXO形式で保存   
* Enter : 現在位置でカット   

### 使用ライブラリ様
- [encoding.js](https://github.com/polygonplanet/encoding.js) - Shift_JISでEXOを保存するのに使わせていただいてます。
- [ffmpeg](https://www.ffmpeg.org/) - Javaで動画のメタデータを取得するのに使わせていただいてます。
- [jQuery](https://jquery.com/) - 言わずとしれたjQuery。
- [bootstrap](https://getbootstrap.com/) - 言わずとしれたbootstrap。CSSのみ使わせていただいてます。
- [jquery.mousewheel.js](http://plugins.jquery.com/mousewheel/) - スクロール操作を扱うライブラリ。横スクロールって案外難しいのね...。