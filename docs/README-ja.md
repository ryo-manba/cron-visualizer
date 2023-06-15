# cron-visualizer

Translations: [English](README.md) [日本語 (Japanese)](docs/README-ja.md)

cron 式を可視化するためのアプリです。<br>
任意の cron 式を入力し、それが週間のカレンダー上でどの時間に実行されるかを視覚的に確認することができます。

## 機能

- cron 式の入力と可視化
- JST と UTC のタイムフォーマットの切り替え
- 週間カレンダー上での cron 実行時間の表示

## 使用方法

- cron 式の入力欄に任意の cron 式を入力します。例えば、`* * * * *` は毎分実行を意味します。
- JST と UTC のタイムフォーマットを切り替えます。デフォルトは JST です。
- "Visualize"ボタンをクリックして、cron 式の可視化を実行します。
- カレンダー上で cron 式の実行時間が表示されます。赤丸が表示された箇所が実行される時間です。

## 技術スタック

- React
- TypeScript
- moment-timezone
- cron-parser
- Recharts

## スクリーンショット

<img width="1200" alt="Screenshot： Cron Visualizer app interface showing a sample cron schedule visualization" src="/public/screenshot.webp">
