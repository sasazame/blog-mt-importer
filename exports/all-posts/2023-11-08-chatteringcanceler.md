---
title: 【日記】マウスのチャタリング問題はChatteringCancelerで解決しそう
author: sasazame
date: "2023-11-08T14:45:11.000Z"
category: 技術
basename: 2023/11/08/234511
status: Publish
allowComments: true
convertBreaks: false
image: "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20231108/20231108232956.png"
---
# 【日記】マウスのチャタリング問題はChatteringCancelerで解決しそう

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20231108/20231108232956.png)

<!-- Extended Body -->

### 20240510追記

この後、結局ここに書いてある手法では解決せず、別の手段を発見してます。

[sasazame.hateblo.jp](https://sasazame.hateblo.jp/entry/2024/02/13/170637#google_vignette)

### チャタリングってなに？

　マウスの主要な誤作動の一つ。１回しかクリックしていないのに、ダブルクリックになってしまうような挙動が発生したら、それがチャタリング。

　以下のページなどで、チェックできる。

[service.webgoto.net](https://service.webgoto.net/chattering/)

### ソフトウェア的な解決法

　チャタリング問題に、以前から悩まされていて、買い替えるしかないと思っていたのだが、どうもソフトウェア的に解決してくれるものがあるらしいことを知った。ソフト名は、まさに機能を体現した「ChatteringCanceler（マウスチャタリングキャンセラ）」。開発者のホームページなどは既に消えていて、windows7までしか対応環境に載っていないソフトではあるが、windows10/11でも問題なく使えるはずだ。

[forest.watch.impress.co.jp](https://forest.watch.impress.co.jp/library/software/chattecancel/)

　ダウンロードは上記の窓の杜、またはベクターから。

[www.vector.co.jp](https://www.vector.co.jp/soft/dl/winnt/util/se455786.html)

　ベクターからのDLの場合、ベータ版の2.2βと2.1aが存在する。一部オプション選択できる内容が異なるので、それぞれの状況に合わせてダウンロードすればよいだろう。なお、ベータ版のほうは32bit版アプリのみになっている。

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20231108/20231108233907.png)

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20231108/20231108233821.png)

←2.1aオプション画面｜2.2βオプション画面→

　基本的には、オプション設定をいじらずとも、そのままの状態でチャタリングは解消したが、それでも解決しなかったという人は、検知方式を変えたり、間隔をかえてみたりするとよいだろう。詳細はreadmeファイルを参照してほしい。

　このソフトを導入することで、チャタリングで発生する、超高速の連打が無視され、１クリックのみが正しく認識されるようになる。もちろん、人間が行うダブルクリックは通常通り検知される。

### 起動のたびに自動で立ち上げるには

自動で起動するには、スタートアップに設定する。

先に、ChatteringCancelerのexeファイルがあるフォルダで、ショートカットを作成しておく。

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20231107/20231107111433.png)

Windowsキー + Rで開いた「ファイル名を指定して実行」に、以下をコピペしてEnterするとスタートアップフォルダが開く。

%appdata%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup

ChatteringCancelerのフォルダにあるショートカットを、スタートアップフォルダに移動して終わり。

### 消す時は？

特にレジストリは触らないということなので、上記のスタートアップに作成したショートカットと、ダウンロードした本体(フォルダごと)を削除すればOK