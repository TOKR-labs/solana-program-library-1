#!/bin/bash

# Create NFT with: https://spl.solana.com/token#example-create-a-non-fungible-token

echo "Running deploy script...";
OWNER_KEYPAIR=/Users/gmiller/code/tokr-labs/keys/nft-program-owner2.json;
MARKET_ID="7zdhJZpRMevhePH2DJYnMV9abYWZ5akcgRZEPs4X72DM";
ORACLE_ID="GcF34qAL8SuRrEbj7EAYphUWP2gDZ8uYMGptMaQrhPFY"; # Token account with 1,000,000 tokens representing $1 million property
NFT_SOURCE="4De7RWQTHFXCaAn8Frk1tVufbgkjuTueMd1MsMMZuXQv"; # for nft-user2.json 

CONFIG=/Users/gmiller/.config/solana/cli/config.yml

solana config set --url https://api.devnet.solana.com -k $OWNER_KEYPAIR;
# Get OWNER from keypair_path key of the solana config file
OWNER_ADDRESS=`solana address -k $OWNER_KEYPAIR`

echo "Creating nft reserve";

echo "--fee-payer     $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ID \
  --source            $NFT_SOURCE \
  --oracle            $ORACLE_ID \
  --verbose";

NFT_RESERVE_OUTPUT=`target/debug/spl-token-lending add-nft-reserve \
  --fee-payer         $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ID \
  --source            $NFT_SOURCE \
  --oracle            $ORACLE_ID \
  --verbose`;
echo "$NFT_RESERVE_OUTPUT";



# Reserve
# export NFT_RESERVE_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export NFT_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export NFT_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export NFT_RESERVE_LIQUIDITY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export NFT_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;
