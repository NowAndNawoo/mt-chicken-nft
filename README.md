# MtChickenNFT

(旧名称: NurieNFT)

## Get started

```sh
git clone https://github.com/NowAndNawoo/mt-chicken-nft.git
cd mt-chicken-nft
npm install
cp .env.example .env
```

.env の内容を書き換えてください。

## Deploy

```sh
npx hardhat run scripts/deploy.ts --network polygon
```

このスクリプトでは

- コントラクトのデプロイ
- SVG ファイルのアップロード
- 1 枚目のミント(色なしバージョン)

を行います。

`MtChickenNFT deployed to:` の後に表示されるのがコントラクトアドレスです。

## Verify

.env に POLYGONSCAN_API_KEY が設定されていることを確認してください。

```sh
npx hardhat verify --network polygon <コントラクトアドレス>
```

## Freeze

コントラクトオーナーは`setSvgHead`,`appendSvgBody`,`clearSvgBody`関数を使って、SVG ファイルを差し替えることができます。
一通り動作確認ができたら、`freeze`関数を呼ぶことで、SVG ファイルは固定され、コントラクトオーナーであっても変更できなくなります。

こちらはスクリプトを用意していないので、Polygonscan の Write Contract から `freeze` を実行してください。(直コン)

freeze されているかどうかは、Polygonscan の Read Contract の `frozen` で確認できます。(true なら freeze 済み)
