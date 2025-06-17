---
title: MSIのゲーミングノートPC Cyborg-14-A13VF-6003JPを買ったよ／PC初期設定レポート
author: sasazame
date: "2024-06-19T13:04:27.000Z"
category: 技術
basename: 2024/06/19/220427
status: Publish
allowComments: true
convertBreaks: false
image: "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240619/20240619211755.png"
---
# MSIのゲーミングノートPC Cyborg-14-A13VF-6003JPを買ったよ／PC初期設定レポート

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240619/20240619211755.png)

<!-- Extended Body -->

## PCを新調したよ

5年ぶりにメインPCを新調することにしました。3年ほど前にsurface laptop goを買っていてまだまだ現役で使っているところではありましたが、ゲーミング用途で使えるラップトップが欲しく、購入を決意。

色々考えた結果、要求スペックとしては13世代i7相当、メモリ32GB、1TBSSD搭載、RTX4060laptop以上という感じで、まさにドンピシャスペックが見つかりました。

[![【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP](https://m.media-amazon.com/images/I/414BZ+zsBzL._SL500_.jpg "【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP")](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)

[【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)

-   MSI

[Amazon](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)

今回のコレは、自宅外への長期滞在にも持って行くモノのため、できれば1kg台の軽めの製品がよかったのですが、14インチ1.6kgと、サイズ的な問題もクリア。

唯一、ビジュアル面だけgeek/nerd丸出しで痛さがありますが、まあ個人的にはスケルトン調のデザインの厨二病感は癖になる感じで、嫌いじゃありません。

そんなわけで、実売価格**約20万円**のこちらをAmazonで一括購入。いやはや、冒険しました。まあしかし、スペック比較ではかなりコスパ良い方ではないでしょうか！

MSIの公式では、メモリ64GB/Windows 11 Professionalのバージョンもあったのですが、公式通販だといつ届くか不安だった（7月中旬からまた出張状態になるので、それまでに確実に受け取りたかった）ので、Amazonで販売してたこちらのスペックをチョイスしたのでした。

## 早速届いたので初期設定の儀を開始

注文して2日。早速到着したPCを、ワクワクで開封の儀。テレワークでやってる仕事は午前中にガッと進めて、夕方はもうほぼセットアップに費やしてました。

まずはOSの初期設定（いわゆるようこそ画面）。わけあって、英語の設定で初期セット。画面の指示に従って操作を進めます……。が、ここで失敗が。

すっかり忘れてしまっていたのですが、Windowsアカウントを立ち上げ時に設定してはいけないのです。なぜなら、これをしてしまうとOneDriveフォルダが自動的にユーザのドキュメントとかのフォルダになっちゃうから。

普通に使う分には別に大きく困るわけではないのですが、「OneDriveがドキュメントフォルダのパスに指定されていると、FF14のクライアント（公式ランチャー）のインストールに失敗する」という問題があり、その後泣きながら初期設定に戻す作業をしました。

先日X(Twitter)見ているときに、Windowsアカウントを設定せずにセットアップする道が塞がれている、という噂を聴いていたので、何も考えずにセットアップしてしまったのですが、完全に失敗でしたね……。ネットワーク接続なしの状態でとりあえずデスクトップ立ち上がるところくらいまで進めるべきだったのだろうか……。正解がわかっていません。

* * *

まあなにはともあれ、とりあえずOS初期設定を終えた私。続いて、必要ソフトのインストール。

今は、wingetを使えばCLI・コマンドだけで一括インストールも出来るので、いい時代になりました（wingetに対応してるソフトだけだけど）。

Google Keepに、wingetするリストをアップしてるので、それを取るためにとりあえずEdgeからKeepにアクセス（これ、EdgeでGoogleアカウントにアクセスするのがダルいので、オープンなところに置いておいたらもっと楽でしたね）。

PowerShellを管理者権限で開いてwinget。しかし、失敗。どうも調べてみるとwinget自体のアップデートが適用されていないとダメらしい。バージョンが1.2xだとダメなんだとか。 `winget -v` したらドンピシャ。

どうやってwinget自体をアップデートするねんと調べてみても、なんだか結構めんどくさそう。一応いろいろ調べて、

1.  wingetのgithubリポジトリにアクセス [https://github.com/microsoft/winget-cli](https://github.com/microsoft/winget-cli)
    
2.  クライアントのインストール方法を確認。2024/6/19時点ではMSStoreからのインストールがRecommendedのため、そちらからインストール。 [https://www.microsoft.com/p/app-installer/9nblggh4nns1](https://www.microsoft.com/p/app-installer/9nblggh4nns1) ※このAppInstaller、私の環境ではストアで直接検索してもヒットしませんでした
    

みたいなことでアップデートできそうだったのでやってみていたのですが、ふと、「Windows Update適用したらアプデされないのか？」と思い、Winアプデを適用して再起動。そしたら案の定アップデートされました。さっきの手順のやつが正解だったのか、Winアプデのおかげで成功したのかわからなくなってしまってますが、もし同じ状況で困っている方はとりあえずWindowsアップデートを完了させましょう。

wingetも使えるようになったので、一気にいろいろインストール。実際のリストを一部公開するとこんな感じ。

\# Microsoft
winget install -e --id Microsoft.PowerToys
winget install -e --id Microsoft.PowerShell
winget install -e --id Microsoft.WindowsTerminal

# Browser
winget install -e --id Google.Chrome

# Code
winget install -e --id Microsoft.VisualStudioCode

# Uninstaller
winget install -e --id Klocman.BulkCrapUninstaller

# Writing
winget install -e --id Obsidian.Obsidian

# Network
winget install -e --id Safing.Portmaster
winget install -e --id PortSwigger.BurpSuite.Community

# directory
winget install -e --id WinDirStat.WinDirStat

# IME
winget install -e --id Google.JapaneseIME

この他にも、とりあえず開発系で必要そうなものとか入れています。一気にインストール出来るのほんと最高ですね。

## FF14のクライアントダウンロード

とりあえず最初に入れなければいけないものということで、FF14のクライアントをDL。しかし、先述の通り失敗。

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240619/20240619214550.png)

Visual C++ Runtime Errorとなっているので、Runtimeを再インストールしている方も多いのですが、なんとなく他の要因っぽいなぁと感じたところで、他の方の意見を探してみるとどうもOneDriveが悪いっぽい。たしかに、心当たりありまくり。

自分のドキュメントのLocation見て、完全にソレだと気づき絶望。

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240619/20240619215459.png)

（参考画像）このロケーション設定にOneDriveが混ざってるとアウトだった

しかも、ドキュメントのプロパティからロケーションをデフォルトに戻しても、エラーが出てなぜか変更できない。（正確には、デスクトップフォルダはそれで変更ができました。ドキュメントフォルダなどはできなかった感じ）

悩みましたが、結局、OneDriveのリンクを停止した状態で再起動かけたらなんか普通にDefaultに戻りました。ちょっと悩んだ時間はなんだったんだ！

OneDrive問題を解決してしまえば、インストールも正常に動き出し万事OKとなったのでした。それにしても、こんなのかなり頻発してそうな問題なんだけど、世間の人たちは大丈夫なのかな。自力で解決出来る人は限られるのでは。

そんな邪推をしながら、今この記事を書いている間もずっとクライアントのダウンロード中。……それにしても、FF14クライアントのダウンロード、遅い。遅すぎる。

90GBとかあるのは知ってますが、それにしたって時間かかりすぎですよ。

新拡張が来たときに、インストールが上手くいかないとかで、再インストールが必要になったりしないことを切に願っています。以前そんな感じで、貴重な時間が溶けていった記憶があるのです。

* * *

久々につよつよPCにしたので、これからその能力を試すのが楽しみです。FF14程度じゃあ味わえないとおもうので、とりあえずスペック問題でスルーし続けてきたCyberpunkとかやりたいな。やりたいな。

そんなところで、今日はここまでにしておこうと思います。

[![【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP](https://m.media-amazon.com/images/I/414BZ+zsBzL._SL500_.jpg "【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP")](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)

[【14インチ小型・軽量1.6kg】【第13世代Core i7 & RTX 4060搭載・スケルトンデザイン】MSIゲーミングノートPC Cyborg14 32GB/1TB/Core i7-13620H RTX4060/14インチ WUXGA/144Hz/Windows 11/Cyborg-14-A13VF-6003JP](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)

-   MSI

[Amazon](https://www.amazon.co.jp/dp/B0CTS2PCX1?tag=mochig08-22&linkCode=ogi&th=1&psc=1)