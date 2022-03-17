#!/bin/bash

# Create NFT with: https://spl.solana.com/token#example-create-a-non-fungible-token

echo "Running deploy script...";
OWNER_KEYPAIR=/Users/gmiller/code/tokr-labs/keys/PROD/PROD-DEPLOY.json;

MARKET_ID="DeR5tUHMNNbBkBNQfhpbjUQFkEEAcZHKjAhfZky5WKG";
ORACLE_ID="dYUUVtUTzqwbQFb9bxCwKt8FkGJb3FrrDm5ACWRZ4ho"; # Token account with 9,000 tokens representing $1 million property
NFT_SOURCE="7udK1kAxf4g7beokRgRepob1vjA4x3WvKEoXmbuskBci"; # Token account with 0  high street 

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
# spl-token unwrap;

# WRAPPED_SOL=`spl-token wrap 131 2>&1 | head -n1 | awk '{print $NF}'`;

# SOL_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER_KEYPAIR \
#   --market-owner      $OWNER_KEYPAIR \
#   --source-owner      $OWNER_KEYPAIR \
#   --market            $MARKET_ADDR \
#   --source            $WRAPPED_SOL \
#   --amount            130  \
#   --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
#   --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
#   --optimal-utilization-rate 100 \
#   --loan-to-value-ratio 80      \
#   --liquidation-bonus 1 \
#   --liquidation-threshold 100 \
#   --min-borrow-rate 0   \
#   --optimal-borrow-rate  5 \
#   --max-borrow-rate 150 \
#   --host-fee-percentage 0 \
#   --verbose`;
# echo "$SOL_RESERVE_OUTPUT";



# # USDC Reserve
# echo "Creating USDC Reserve";
# USDC_TOKEN=`spl-token create-token --decimals 6 2>&1 | head -n1 | awk '{print $NF}'`;
# USDC_TOKEN_ACCOUNT=`spl-token create-account $USDC_TOKEN  2>&1 | head -n1 | awk '{print $NF}'`;
# echo "TOKEN: $USDC_TOKEN";
# echo "ACCOUNT: $USDC_TOKEN_ACCOUNT";

# MINT=`spl-token mint $USDC_TOKEN 30000000`;

# USDC_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER_KEYPAIR \
#   --market-owner      $OWNER_KEYPAIR \
#   --source-owner      $OWNER_KEYPAIR \
#   --market            $MARKET_ADDR \
#   --source            $USDC_TOKEN_ACCOUNT \
#   --amount            1  \
#   --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
#   --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
#   --optimal-utilization-rate 100 \
#   --loan-to-value-ratio 80      \
#   --liquidation-bonus 1 \
#   --liquidation-threshold 100 \
#   --min-borrow-rate 0   \
#   --optimal-borrow-rate  5 \
#   --max-borrow-rate 150 \
#   --host-fee-percentage 0 \
#   --verbose \
#   --dry-run`;
# echo "$USDC_RESERVE_OUTPUT"


# Reserve
# export NFT_RESERVE_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export NFT_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export NFT_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export NFT_RESERVE_LIQUIDITY_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export NFT_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$NFT_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;
