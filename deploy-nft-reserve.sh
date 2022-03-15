#!/bin/bash

# Create NFT with: https://spl.solana.com/token#example-create-a-non-fungible-token

echo "Running deploy script...";
OWNER_KEYPAIR=$1;
MARKET_ID="5dP7yhL3pX27PdbWg6mKQTjZV9XVVxkYzSPJLwQUmffw";
NFT_SOURCE="GwwJV6QyKCb49ymZeoAZich1S7o2R9yemqkR7CXF7UH9";

CONFIG=/Users/gmiller/.config/solana/cli/config.yml

solana config set --url https://api.devnet.solana.com -k $OWNER_KEYPAIR;
# Get OWNER from keypair_path key of the solana config file
OWNER_ADDRESS=`solana address -k $OWNER_KEYPAIR`

echo "Creating nft reserve";

echo "--fee-payer $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --source-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ID \
  --source            $NFT_SOURCE \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose";

NFT_RESERVE_OUTPUT=`spl-token-lending add-nft-reserve \
  --fee-payer         $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ID \
  --source            $NFT_SOURCE \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose`;
echo "$NFT_RESERVE_OUTPUT";



# Reserve
export NFT_RESERVE_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export NFT_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export NFT_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export NFT_RESERVE_LIQUIDITY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export NFT_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;
