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
