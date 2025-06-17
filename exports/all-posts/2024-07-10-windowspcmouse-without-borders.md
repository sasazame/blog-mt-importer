---
title: WindowsPCを複数台同時利用するなら、「境界線のないマウス(Mouse Without Borders)」が最強だという話
author: sasazame
date: "2024-07-10T14:15:50.000Z"
category: 技術
basename: 2024/07/10/231550
status: Publish
allowComments: true
convertBreaks: false
image: "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710224910.png"
---
# WindowsPCを複数台同時利用するなら、「境界線のないマウス(Mouse Without Borders)」が最強だという話

![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710224910.png)

<!-- Extended Body -->

## まえがき

最近、メインPCをラップトップ（ノートPC）に変更しました。そこで、以前までメイン機として利用していたタワーPCをサブ機にしています。

さて、そんなPC二台を扱うシチュエーションですが、悩みどころなのがマウス・キーボード問題です。

二つのマウスキーボードを用意する？　スイッチャーで切り替える？　Bluetoothで接続先切り替えできるのを使う？　でも、どれもコストがかかってしまいます。

そんな時に、簡単に解決してくれるのが「境界線のないマウス（Mouse Without Borders）」です。

## 利点

境界線のないマウスは、その名の通り、デバイス間の境界線を越えて、つまり一つのマウスで複数のデバイスが操作できるようになります。

しかもこれ、マウスだけじゃなくてキーボードも使えるんです。てっきりマウスだけだと思ってたので目から鱗がぽろぽろぽろ。

さらにさらに、クリップボードまで共有してくれるのです。もちろん画像コピペも行けるので、AデバイスでWin+shift+sでキャプチャした画面スクショをBデバイスに持ってくるのなんてのもお茶の子さいさいしかのこのこのここしたんたん。

とはいえ、初期設定の時点や、PowerToysのアップデートなどで機能がOFFになっているときには両方にマウスキーボードが必要（あるいは差し替え）なんですが……。

## 導入方法

この機能、MicrosoftがPowerToysという、拡張アプリ的なやつで使えるようになります。Windowsのデフォルトで入っている機能ではないものの、簡単にインストールすることができるのです。

1.  Windowsキーを押してPowerShellを起動 ![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710225926.png)
    
2.  以下のコマンドでPowerToysをインストール `winget install -e --id Microsoft.PowerToys`
    
3.  インストールが完了したらPowerToysを起動（再起動が必要かも）
    
4.  PowerToysの設定のなかにある「境界線のないマウス」をクリック ![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710230329.png)
    
5.  「境界線のないマウスを有効にする」がオフになっていたらオンにする ![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710230439.png) ↑ここまでを、利用するPCすべてで実施が必要
    
6.  利用するPCのいずれか１台で、セキュリティキーの「新しいキー」をクリック
    
7.  ほかの利用するPCで「接続」をクリックし、上記の新しいキーと、新しいキーを生成したデバイス名を入力 ![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710231000.png)
    
8.  成功していればデバイスのレイアウトに接続中のマシンが表示されるはず ![](https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20240710/20240710231051.png)
    

## まとめ

導入も手軽で、PowerToysのインストール以外不要なのが素晴らしいので、本当にオススメしたいやつでした！

ちなみに、セキュリティキーの受け渡しも、Google Keepとかのクラウドメモとか使って、サクッとコピペしちゃえば簡単です。

PC複数台構成で、デスク上がデバイスでいっぱいになっちゃった方はぜひお試しあれ。