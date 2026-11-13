# Glass Sampler

Web Audio サンプラー（パッド／ピアノ／ボコーダー／スペクトラルゲート／グラニュラー／ドラム／ブレス＆ボイス（バイノーラル））と、
音に反応する 3D ルームビジュアライザーを 1 ファイルにまとめた PWA です。

**v2: ハンドトラッキングで球体を「揉む」** — 従来の動き検出によるフィルター／リバーブ操作は廃止し、
MediaPipe Hands による手指キャプチャに置き換えました。

## ハンドトラッキング

ビジュアライザー下の **✋ HAND** でカメラを起動し、カメラに手を翳します。

| 操作 | ビジュアライザー | 音への既定マッピング |
|---|---|---|
| 指先・関節・手のひらで押す | 接触部分がへこむ（ジェリーの余韻つき） | SQUEEZE → Gate Focus / Gate Mix |
| 親指と人差し指でつまんで引く | 球体をつかんで伸ばす | PULL → Reverb |
| 引き伸ばして限界を超える（Tear 値） | 球体がちぎれて粒が飛び散り、同時に実グラニュラーが発音 | TEAR → Gate Boost、STRETCH → Gate Width |
| 球体の中を素早く横切る（スライス） | 同上（小さな破片） | TEAR/SLICE |
| 手を左右へ動かす | 仮想の手が追従 | HAND X → Gate Freq |
| 手を上下へ動かす | 同上 | HAND Y → Filter |
| 手の動きの速さ | – | SPEED → Pitch Bend |
| 手をカメラへ近づける | 仮想の手が球体の位置まで入っていく（中間くらいで球体の中心付近） | – |
| 押す／引く | 球体全体も手に押されて動き、離すとバネで戻る（Follow） | – |
| 両手で挟む | 両側から同時に変形 | SQUEEZE に加算 |

- 手が映っていない間は、ビジュアルも音も従来どおり（モジュレーション量は 0）。
- **Hand Kneading** カード：Finger（指の太さ）/ Push / Pull / Jelly（バネの硬さ）/ Damping / Smooth（ジッター除去）/ Glow / Depth（奥行き感度）/ Follow（球体が手に追従する量）/ Tear（ちぎれる伸び量、大きいほどちぎれにくい）。
  既定値は 1.0。`HAND → SOUND` の各行でソース（SQUEEZE, PULL, HAND X/Y, SPEED, OPEN⇄FIST）・行き先・量（−1〜+1）を変えられます。
  行き先は既存の Gate 各値・Filter・Reverb・Dynamics に加え Pitch Bend / Vibrato / Tape Speed。
- `FULL 高精度 / LITE 軽量` で MediaPipe のモデルを切り替え（重い端末は LITE）。
- 設定は localStorage（`gs_hand`）に保存。既存プリセットには含まれません（互換性維持）。

## 動かし方

カメラと Service Worker には **HTTPS または localhost** が必要です（`file://` では動きません）。

```sh
python3 -m http.server 8000   # → http://localhost:8000
```

GitHub Pages: リポジトリの Settings → Pages で `main` / `(root)` を公開すると、そのままスマホにインストールできます。

## ファイル

```
index.html      アプリ本体（HTML/CSS/JS 一体）
sw.js           オフライン用 Service Worker
manifest.json   PWA マニフェスト
icon-192.png / icon-512.png
```

外部ライブラリ（CDN）: three.js r128、@mediapipe/hands 0.4.1675469240、Google Fonts。
初回のみ通信し、以降は Service Worker がキャッシュします。

ライセンスは未設定です。公開時にお好みのものを追加してください。

## v3 の変更点

- **ノイズ対策**: スペクトラルゲート（ScriptProcessor）のバッファを 4096 に拡大し、AudioContext を `latencyHint: 'playback'` で作成。ハンドトラッキング中の処理負荷によるプチノイズを抑えます（出力遅延は増えます）。
- **遅延バッファ**: 手の検出結果をバッファして「今−遅延」の時刻で補間。Delay スライダー（0＝自動）で調整でき、映像／音の遅延を Hand Kneading カードとプレビュー上に表示します。
- **貫通防止**: 球体の頂点は手のどの部分の内側にも入らず、深く押すと球体全体が逃げます。
- **Auto Play 廃止 → Breath & Voice**: ブレス／ハミング／ささやき／ため息をランダム生成し、HRTF でバイノーラル出力。
- **Tuning**: OFF / SCALE / CHORD。グレイン・ランダム音程・ブレス／声・手によるピッチ操作を対象にスケールまたは鳴っているコードの音へ寄せます。
