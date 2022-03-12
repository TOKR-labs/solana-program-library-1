#!/bin/bash
echo "Running deploy script...";
OWNER_KEYPAIR=$1;
LENDER_KEYPAIR=$2;
CONFIG=/Users/gmiller/.config/solana/cli/config.yml

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
CREATE_PROGRAM_OUTPUT=`solana program --config $CONFIG deploy \
  --program-id $LENDER_KEYPAIR \
  target/deploy/spl_token_lending.so`;
echo "$CREATE_PROGRAM_OUTPUT";

echo "Creating Lending Market";
CREATE_MARKET_OUTPUT=`target/debug/spl-token-lending create-market \
  --fee-payer    $OWNER_KEYPAIR \
  --market-owner $OWNER_ADDRESS \
  --verbose`;

WRAPPED_SOL=`spl-token wrap 2 2>&1 | head -n1 | awk '{print $NF}'`;

echo "$CREATE_MARKET_OUTPUT";
MARKET_ADDR=`echo $CREATE_MARKET_OUTPUT | head -n1 | awk '{print $4}'`;
AUTHORITY_ADDR=`echo $CREATE_MARKET_OUTPUT | grep "Authority Address" | awk '{print $NF}'`;

echo "Creating SOL reserve";


echo "--fee-payer $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --source-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ADDR \
  --source            $WRAPPED_SOL \
  --amount            1  \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose";

SOL_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
  --fee-payer         $OWNER_KEYPAIR \
  --market-owner      $OWNER_KEYPAIR \
  --source-owner      $OWNER_KEYPAIR \
  --market            $MARKET_ADDR \
  --source            $WRAPPED_SOL \
  --amount            1  \
  --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E \
  --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix \
  --verbose`;
echo "$SOL_RESERVE_OUTPUT";


# # USDC Reserve
# echo "Creating USDC Reserve";
# USDC_TOKEN_MINT=`target/debug/spl-token --config $SOLANA_CONFIG create-token --decimals 6 |  awk '{print $3}'`;
# echo "USDC MINT: $USDC_TOKEN_MINT"
# USDC_TOKEN_ACCOUNT=`target/debug/spl-token --config $SOLANA_CONFIG create-account $USDC_TOKEN_MINT | awk '{print $3}'`;
# target/debug/spl-token --config $SOLANA_CONFIG mint $USDC_TOKEN_MINT 30000000;

# USDC_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER \
#   --market-owner      $OWNER \
#   --source-owner      $OWNER \
#   --market            $MARKET_ADDR \
#   --source            $USDC_TOKEN_ACCOUNT \
#   --amount            500000  \
#   --pyth-product      6NpdXrQEpmDZ3jZKmM2rhdmkd3H6QAk23j2x8bkXcHKA \
#   --pyth-price        5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 \
#   --switchboard-feed  CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb \
#   --optimal-utilization-rate 80 \
#   --loan-to-value-ratio 75      \
#   --liquidation-bonus 5 \
#   --liquidation-threshold 80 \
#   --min-borrow-rate 0   \
#   --optimal-borrow-rate  8 \
#   --max-borrow-rate 50 \
#   --host-fee-percentage 50 \
#   --deposit-limit 1000000 \
#   --verbose`;
# echo "$USDC_RESERVE_OUTPUT";

# # ETH Reserve
# echo "Creating ETH Reserve"
# ETH_TOKEN_MINT=`target/debug/spl-token --config $SOLANA_CONFIG create-token --decimals 6 |  awk '{print $3}'`;
# echo "ETH MINT: $ETH_TOKEN_MINT"
# ETH_TOKEN_ACCOUNT=`target/debug/spl-token --config $SOLANA_CONFIG create-account $ETH_TOKEN_MINT | awk '{print $3}'`;
# target/debug/spl-token --config $SOLANA_CONFIG mint $ETH_TOKEN_MINT 8000000;

# ETH_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER \
#   --market-owner      $OWNER \
#   --source-owner      $OWNER \
#   --market            $MARKET_ADDR \
#   --source            $ETH_TOKEN_ACCOUNT \
#   --amount            250 \
#   --pyth-product      2ciUuGZiee5macAMeQ7bHGTJtwcYTgnt6jdmQnnKZrfu \
#   --pyth-price        EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw  \
#   --switchboard-feed  QJc2HgGhdtW4e7zjvLB1TGRuwEpTre2agU5Lap2UqYz  \
#   --optimal-utilization-rate 80 \
#   --loan-to-value-ratio 75      \
#   --liquidation-bonus 5 \
#   --liquidation-threshold 80 \
#   --min-borrow-rate 0   \
#   --optimal-borrow-rate  8 \
#   --max-borrow-rate 100 \
#   --host-fee-percentage 50 \
#   --deposit-limit 500 \
#   --verbose`;
# echo "$ETH_RESERVE_OUTPUT";


# echo "Creating BTC Reserve"
# BTC_TOKEN_MINT=`target/debug/spl-token --config $SOLANA_CONFIG create-token --decimals 6 |  awk '{print $3}'`;
# echo "BTC MINT: $BTC_TOKEN_MINT"
# BTC_TOKEN_ACCOUNT=`target/debug/spl-token --config $SOLANA_CONFIG create-account $BTC_TOKEN_MINT | awk '{print $3}'`;
# target/debug/spl-token --config $SOLANA_CONFIG mint $BTC_TOKEN_MINT 8000000;

# BTC_RESERVE_OUTPUT=`target/debug/spl-token-lending add-reserve \
#   --fee-payer         $OWNER \
#   --market-owner      $OWNER \
#   --source-owner      $OWNER \
#   --market            $MARKET_ADDR \
#   --source            $BTC_TOKEN_ACCOUNT \
#   --amount            15  \
#   --pyth-product      3m1y5h2uv7EQL3KaJZehvAJa4yDNvgc5yAdL9KPMKwvk\
#   --pyth-price        HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J \
#   --switchboard-feed  74YzQPGUT9VnjrBz8MuyDLKgKpbDqGot5xZJvTtMi6Ng \
#   --optimal-utilization-rate 80 \
#   --loan-to-value-ratio 75      \
#   --liquidation-bonus 5 \
#   --liquidation-threshold 80 \
#   --min-borrow-rate 0   \
#   --optimal-borrow-rate  8 \
#   --max-borrow-rate 100 \
#   --host-fee-percentage 50 \
#   --deposit-limit 30 \
#   --verbose`;
# echo "$BTC_RESERVE_OUTPUT";

# target/debug/spl-token --config $SOLANA_CONFIG unwrap;

# # Export variables for new config.ts file
# CONFIG_TEMPLATE_FILE="https://raw.githubusercontent.com/solendprotocol/common/master/src/devnet_template.json"
# # Token Mints
# export USDC_MINT_ADDRESS="$USDC_TOKEN_MINT";
# export ETH_MINT_ADDRESS="$ETH_TOKEN_MINT";
# export BTC_MINT_ADDRESS="$BTC_TOKEN_MINT";

# # Main Market
# export MAIN_MARKET_ADDRESS="$MARKET_ADDR";
# export MAIN_MARKET_AUTHORITY_ADDRESS="$AUTHORITY_ADDR";

# # Reserves
# export SOL_RESERVE_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export SOL_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export SOL_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export SOL_RESERVE_LIQUIDITY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export SOL_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# export USDC_RESERVE_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export USDC_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export USDC_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export USDC_RESERVE_LIQUIDITY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export USDC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# export ETH_RESERVE_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export ETH_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export ETH_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export ETH_RESERVE_LIQUIDITY_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export ETH_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# export BTC_RESERVE_ADDRESS=`echo "$BTC_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
# export BTC_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$BTC_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
# export BTC_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$BTC_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
# export BTC_RESERVE_LIQUIDITY_ADDRESS=`echo "$BTC_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
# export BTC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$BTC_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# # Run templating command 
# curl $CONFIG_TEMPLATE_FILE | envsubst 