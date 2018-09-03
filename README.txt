

AviUtlカット編集バイパスプログラム 　(未完成)
	べーた 0.0.3

1. 概要

 AviUtlのシークバーはやはり重い。   
 なのでカット編集だけはブラウザ上とか、動画が軽いところでやろう、というプログラムです。   

 
 
2. どう動いているか

 Javaで動画ファイルをドラッグアンドドロップ (DnD) できるウィンドウを作成してます。   
 ffprobe様を使用させていただき動画情報を取得してJavascriptに渡してます。   
 Javascriptはローカルで動いています。安全です。localhostではありません。   
 編集画面は規定のブラウザで開きますがChromiumを想定しています。   
 ブラウザ上でHTML5のvideo要素を使用しながら、タイムラインを使って編集します。   
 編集内容はEXO形式で保存。AviUtlの拡張編集タイムラインにDnDして使います。

 
 
3. 使い方

 1. Javaがインストールされていることを確認する。
 2. kiriharikun.exeを起動する
 3. 表示されたウィンドウに編集したい動画をDnDする
 4. ブラウザ上で動画を操作、Enterキーで再生地点でカットする
 5. タイムラインのアイテムをクリックすると、そのシーンはOFF AIRとなります
 5. ショートカットキーでEXOとして保存する
 6. AviUtlの拡張編集タイムラインにDnDする


4. 免責と注意事項

 - このプログラムを通してのいかなる損害も当方は責任を取りかねます。
 - 細心の注意を払いプログラムしていますが予想外の動作をしてしまう場合があります。
 - このプログラムで出力したEXOファイルはAviUtl拡張編集プラグイン専用の
   ファイルであり、その他のプログラムなどで読み込むことはできません。
 - 特に、EXOファイルのエンコーディングがShift_JISに
   うまく変換できなかった場合、AviUtlに読み込まれない場合がございます。
 - Google Chrome for Windows以外のブラウザ、特にInternet Explorerでの動作は保証できません。ｺﾞﾒﾝﾈ。
   対応予定ではありますが、現在、設定の保存などができない場合がございます。
 - AviUtlがWindows専用のソフトウェアなので、他OS (MacやLinuxなど) のWindows VMなどで
   動作するかはわかりません。
 - 開発時からのバージョンアップにより使用できなくなる場合があります。
 - 以上のことを理解して使用ください。
 

5. 仕様とバグ

 一度DnDで読み込まれたデータは、htmlフォルダ下のdata.jsファイルに書き込まれます。
 data.jsファイルはDnD時のみ上書きされるので、その後いつhtmlフォルダ下の
 index.htmlを開いても、最後にDnDした動画の編集画面が表示されます。

 バグを見つけた場合、作者のTwitter (https://twitter.com/finediry) にメッセージを
 送ってもらっても構いませんし、本作のGithubにissueを発行 (https://github.com/tkgwku/cut-into-exo/issues)
 できます。ただしバグの再現性がない場合、特に作者はWindows10を所持していないのでWin10固有のバグなどは、
 対応できない可能性もございます。

 
6. ショートカットの初期設定

 * Ctrl + Shift + S : EXO形式で保存   
 * Enter : 現在位置でカット   


7. 使用ライブラリ様

 - encoding.js - https://github.com/polygonplanet/encoding.js - 文字コードを扱うJavaScriptライブラリ。
 - FFmpeg - https://www.ffmpeg.org/ - 動画のメタデータを取得できるソフトウェア。
 - jQuery - https://jquery.com/ - DOM操作を楽にする大型JavaScriptライブラリ。
 - bootstrap - https://getbootstrap.com/ - スタイリッシュなCSSでwebを構築できるCSS。
 - jquery.mousewheel.js - https://github.com/jquery/jquery-mousewheel - マウスホイール操作を扱うJavaScriptライブラリ。
 - launch4j - http://launch4j.sourceforge.net/ - Javaの実行ファイルをexeにラップできるソフトウェア。



6. ライセンス

 ライセンスは考え中ですが、商用利用可・コードの一部の再利用可のライセンスになる予定です。

 This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html).   

 (日本語訳) このソフトウェアは、[LGPL v2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) のライセンスのもと公開されている[FFmpeg](http://ffmpeg.org)のコードを使っています。   

 FFmpegの中でも、ffprobe.exeをコマンドラインで使用しています。   
 動画ファイルのメタデータ ( 長さやコーデックなど ) を取得するのに使っています。   



7. ソースから実行する方法

 自分で同じ環境でデバッグしたい方へ

 環境構築:
  1. JDKをインストール
  2. JDKのbinフォルダを環境変数に追加
  3. JREの環境変数は消しても良いんじゃないかな
  4. mavenをインストール
  5. mavenのbinフォルダを環境変数に追加
 ビルド:
  6. "AviUtlTool" フォルダでコマンドラインを起動
  7. コマンドラインで、「mvn clean compile jar:jar」
  8. "AviutlTool" 下の "target" フォルダにjarが生成
  9. 「java -jar target\jarname.jar」で起動
  
  
  
(c) 2018 ふぃね (fine diary), all rights reserved.