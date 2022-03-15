#!/bin/bash

# Create NFT with: https://spl.solana.com/token#example-create-a-non-fungible-token

echo "Running deploy script...";
OWNER_KEYPAIR=$1;
MARKET_ID="5dP7yhL3pX27PdbWg6mKQTjZV9XVVxkYzSPJLwQUmffw";
NFT_SOURCE="B3kxVwQNyRU4uCbNPDVHFopwtk5un6dHEtMcNeoWhCQx";

CONFIG=/Users/gmiller/.config/solana/cli/config.yml

solana config set --url https://api.devnet.solana.com -k $OWNER_KEYPAIR;
# Get OWNER from keypair_path key of the solana config file
OWNER_ADDRESS=`solana address -k $OWNER_KEYPAIR`

echo "Creating nft reserve";

echo "--fee-payer $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --source-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ADDR \
  --source            $WRAPPED_SOL \
  --amount            1  \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose";

NFT_RESERVE_OUTPUT=`target/debug/spl-token-lending add-nft-reserve \
  --fee-payer         $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ADDR \
  --source            $NFT_SOURCE \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose`;
echo "$SOL_RESERVE_OUTPUT";

