#!/bin/bash
echo "Running deploy script...";
OWNER_KEYPAIR=$1;
LENDER_KEYPAIR=$2;

solana config set --url https://api.devnet.solana.com -k $OWNER_KEYPAIR;
# Get OWNER from keypair_path key of the solana config file
OWNER_ADDRESS=`solana address -k $OWNER_KEYPAIR`
LENDER_ADDRESS=`solana address -k $LENDER_KEYPAIR`

spl-token unwrap;

set -e;
echo "Owner keypair: $OWNER_KEYPAIR";
echo "Lender keypair: $LENDER_KEYPAIR";
echo "Owner address: $OWNER_ADDRESS";
echo "Lender address: $LENDER_ADDRESS";

echo "Creating Lending Program";
CREATE_PROGRAM_OUTPUT=`solana program deploy \
  --program-id $LENDER_KEYPAIR \
  --max-len 1241933 \
  target/deploy/spl_token_lending.so`;
echo "$CREATE_PROGRAM_OUTPUT";

echo "Creating Lending Market";
CREATE_MARKET_OUTPUT=`target/debug/spl-token-lending create-market \
  --fee-payer    $OWNER_KEYPAIR \
  --market-owner $OWNER_ADDRESS \
  --verbose`;

# WRAPPED_SOL=`spl-token wrap 2 2>&1 | head -n1 | awk '{print $NF}'`;

echo "$CREATE_MARKET_OUTPUT";
MARKET_ADDR=`echo $CREATE_MARKET_OUTPUT | head -n1 | awk '{print $4}'`;
AUTHORITY_ADDR=`echo $CREATE_MARKET_OUTPUT | grep "Authority Address" | awk '{print $NF}'`;

echo "Market: $MARKET_ADDR";
echo "Authority Address: $AUTHORITY_ADDR";
echo "CREATE_MARKET_OUTPUT: $CREATE_MARKET_OUTPUT";

echo "Creating USDC reserve";

# SOL_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER_KEYPAIR \
#   --market-owner      $OWNER_KEYPAIR \
#   --source-owner      $OWNER_KEYPAIR \
#   --market            $MARKET_ADDR \
#   --source            $WRAPPED_SOL \
#   --amount            100  \
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


# USDC Reserve
echo "Creating USDC Reserve";
USDC_TOKEN=`spl-token create-token --decimals 6 2>&1 | head -n1 | awk '{print $NF}'`;
USDC_TOKEN_ACCOUNT=`spl-token create-account $USDC_TOKEN  2>&1 | head -n1 | awk '{print $NF}'`;
echo "TOKEN: $USDC_TOKEN";
echo "ACCOUNT: $USDC_TOKEN_ACCOUNT";

MINT=`spl-token mint $USDC_TOKEN 30000000`;

USDC_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
  --fee-payer         $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --source-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ADDR \
  --source            $USDC_TOKEN_ACCOUNT \
  --amount            10000000  \
  --pyth-product      6NpdXrQEpmDZ3jZKmM2rhdmkd3H6QAk23j2x8bkXcHKA \
  --pyth-price        5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 \
  --optimal-utilization-rate 100 \
  --loan-to-value-ratio 80      \
  --liquidation-bonus 1 \
  --liquidation-threshold 100 \
  --min-borrow-rate 0   \
  --optimal-borrow-rate  5 \
  --max-borrow-rate 150 \
  --host-fee-percentage 0 \
  --verbose`;
echo "$USDC_RESERVE_OUTPUT"

# # Export variables for new config.ts file
# # Token Mints
export USDC_MINT_ADDRESS="$USDC_TOKEN_MINT";
# export ETH_MINT_ADDRESS="$ETH_TOKEN_MINT";
# export BTC_MINT_ADDRESS="$BTC_TOKEN_MINT";

# Main Market
export MAIN_MARKET_ADDRESS="$MARKET_ADDR";
export MAIN_MARKET_AUTHORITY_ADDRESS="$AUTHORITY_ADDR";

# Reserves
# export SOL_RESERVE_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export SOL_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export SOL_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export SOL_RESERVE_LIQUIDITY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export SOL_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

export USDC_RESERVE_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export USDC_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export USDC_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export USDC_RESERVE_LIQUIDITY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export USDC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# # Run templating command 
# curl $CONFIG_TEMPLATE_FILE | envsubst 