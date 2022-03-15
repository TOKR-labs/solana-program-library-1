const solanaWeb3 = require('@solana/web3.js');
const solanaSplToken = require('@solana/spl-token');
const { struct, u32, ns64, u8 } = require('@solana/buffer-layout');
const BufferLayout = require('buffer-layout');
const nacl = require('tweetnacl');
const tokenLending = require('@solana/spl-token-lending');

const LENDING_PROGRAM_ID = new solanaWeb3.PublicKey('KQuoxEXxjdcyjhQTQPRAyC9vNHKgXUk9AYoM5uj8HXa');
const LENDING_MARKET_ID = 'AgLhMG83K9ifTZ39zJVPmDrNiHtSCxWYVjfuBmyfHnLw';

let testSecretyKey = Uint8Array.from([
    166, 145, 73, 44, 63, 154, 80, 172, 6, 29, 212, 155, 217, 131, 6, 104, 212, 81, 32, 192, 166, 50, 14, 83, 172, 200,
    166, 234, 209, 119, 86, 117, 248, 225, 154, 103, 39, 201, 255, 244, 65, 75, 194, 23, 124, 35, 113, 26, 160, 147,
    169, 182, 116, 152, 168, 113, 108, 246, 155, 15, 54, 57, 183, 187,
]);
// connection
rpcUrl = 'https://api.devnet.solana.com';
const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');

const user = solanaWeb3.Keypair.fromSecretKey(testSecretyKey);

const createAccountWithSeeds = async () => {
    const seed = LENDING_MARKET_ID.slice(0, 32);

    const obligationAddress = await solanaWeb3.PublicKey.createWithSeed(user.publicKey, seed, LENDING_PROGRAM_ID);

    const tx = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.createAccountWithSeed({
            fromPubkey: user.publicKey, // funder
            newAccountPubkey: obligationAddress,
            basePubkey: user.publicKey,
            seed: seed,
            lamports: 9938880, // 0.1 SOL
            programId: LENDING_PROGRAM_ID,
            space: 1300,
        })
    );

    console.log(tx);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    // confirmed result means the obligation account is
    console.log(result);
};

const initObligation = async () => {
    const seed = LENDING_MARKET_ID.slice(0, 32);

    const obligationAddress = await solanaWeb3.PublicKey.createWithSeed(user.publicKey, seed, LENDING_PROGRAM_ID);

    console.log(obligationAddress.toString());

    const lendingMarketPublicKey = new solanaWeb3.PublicKey(LENDING_MARKET_ID);

    // Alternatively, manually construct the transaction
    let recentBlockhash = await connection.getLatestBlockhash();
    let manualTransaction = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: user.publicKey,
    });

    const obligationAccountInfoRentExempt = await connection.getMinimumBalanceForRentExemption(
        tokenLending.OBLIGATION_SIZE
    );

    manualTransaction.add(
        solanaWeb3.SystemProgram.createAccountWithSeed({
            fromPubkey: user.publicKey,
            newAccountPubkey: obligationAddress,
            basePubkey: user.publicKey,
            seed: seed,
            lamports: obligationAccountInfoRentExempt,
            space: tokenLending.OBLIGATION_SIZE,
            programId: LENDING_PROGRAM_ID,
        })
    );

    const customInstruction = getObligationInstructtions(obligationAddress, lendingMarketPublicKey, user.publicKey);

    manualTransaction.add(customInstruction);

    console.log(`txhash: ${await solanaWeb3.sendAndConfirmTransaction(connection, manualTransaction, [user])}`);
};

const createCollateralATA = async () => {
    // Sol deposit solend:  https://solscan.io/tx/5YVqDNA3mX2rYvk3mgy3Q8yvxL9puAd5fgBqwB5G1zwKAhghALepSs4Axp3NpQvzisP4s5GRQ49Prg6WcWrSYtmM
    // Wrapped sol
    const wrappedSolAccount = new solanaWeb3.PublicKey('4Likno5efhzydyvV9xekRzUqUygTTvZYByjFXQ13ER5J');
    const collateralMint = new solanaWeb3.PublicKey('4wj6x3zy7o6YirVYdzmz7DYnRABPoLYkvgMfb5bAgGbi');

    const userCollateralAccountAddress = await solanaSplToken.getAssociatedTokenAddress(
        collateralMint,
        user.publicKey,
        true,
        solanaSplToken.TOKEN_PROGRAM_ID,
        solanaSplToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log(userCollateralAccountAddress.toString());

    const createUserCollateralAccountIx = solanaSplToken.createAssociatedTokenAccountInstruction(
        user.publicKey,
        userCollateralAccountAddress,
        user.publicKey,
        collateralMint,
        solanaSplToken.TOKEN_PROGRAM_ID,
        solanaSplToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tx = new solanaWeb3.Transaction().add(createUserCollateralAccountIx);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    console.log(result);

    // worked transaction: https://solscan.io/tx/5VwKjbrKoBv51JnPZ6Za5bwP8zdnYcb24NFex7gx1Eb5qeuAVQuMQTFvK32FHYApqatZhHdZVx7oUjpinopJ2MWM?cluster=devnet
};

const depositReserveLiquidity = async () => {
    const wrappedSolAccount = new solanaWeb3.PublicKey('4Likno5efhzydyvV9xekRzUqUygTTvZYByjFXQ13ER5J');
    const reserve = new solanaWeb3.PublicKey('Gks5AF62NsTQikrMJWmBApeKZ1woEQ2h7utcyEGw19cP');
    const collateralMint = new solanaWeb3.PublicKey('4wj6x3zy7o6YirVYdzmz7DYnRABPoLYkvgMfb5bAgGbi');

    const transferAuthority = new solanaWeb3.PublicKey('CBBz9bgYcxnypTT1K5PhYtfriauGWi1TTYufkY5WT3rb');
    const reserveSupply = new solanaWeb3.PublicKey('BAYmRSHquVU5RrTYe97uFsgasjC4QPGSQch2NbKMDNEy');
    const pythPrice = new solanaWeb3.PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

    // No freaking clue where this came from
    const lendingMarketAuthority = new solanaWeb3.PublicKey('B4tjbYDNcHV3LcCh1JZZ6vKJ8ED8UNd46PvuxDnDNyCv');

    const userCollateralAccountAddress = await solanaSplToken.getAssociatedTokenAddress(
        collateralMint,
        user.publicKey,
        true,
        solanaSplToken.TOKEN_PROGRAM_ID,
        solanaSplToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const depositInstructions = depositReserveLiquidityInstruction(
        1000000000,
        wrappedSolAccount,
        userCollateralAccountAddress,
        reserve,
        reserveSupply,
        collateralMint,
        new solanaWeb3.PublicKey(LENDING_MARKET_ID),
        lendingMarketAuthority,
        user.publicKey
    );

    // Alternatively, manually construct the transaction
    let recentBlockhash = await connection.getLatestBlockhash();
    let tx = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: user.publicKey,
    });
    const refreshReserve = getRefreshReserveInstruction(reserve, pythPrice);

    tx.add(refreshReserve);
    tx.add(depositInstructions);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    console.log(result);
};

const depositCollateral = async () => {
    const collateralMint = new solanaWeb3.PublicKey('4wj6x3zy7o6YirVYdzmz7DYnRABPoLYkvgMfb5bAgGbi');
    const collateralSupply = new solanaWeb3.PublicKey('8xH84cBArFLA3p7fnRVzV7pTDMWZXAbtwCmFAJcVQYC9');
    const pythPrice = new solanaWeb3.PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

    const transferAuthority = new solanaWeb3.PublicKey('CBBz9bgYcxnypTT1K5PhYtfriauGWi1TTYufkY5WT3rb');
    const reserve = new solanaWeb3.PublicKey('Gks5AF62NsTQikrMJWmBApeKZ1woEQ2h7utcyEGw19cP');
    const obligation = new solanaWeb3.PublicKey('E7weM6ZqwnK5seDHsvRvZF5xFFddX2q1E4QBaxh99wJB');

    const userCollateralAccountAddress = await solanaSplToken.getAssociatedTokenAddress(
        collateralMint,
        user.publicKey,
        true,
        solanaSplToken.TOKEN_PROGRAM_ID,
        solanaSplToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const approveTransaction = solanaSplToken.createApproveInstruction(
        userCollateralAccountAddress,
        transferAuthority,
        user.publicKey,
        50
    );

    const depositInstruction = getCollateralInstructions(
        50,
        userCollateralAccountAddress,
        collateralSupply,
        reserve,
        obligation,
        new solanaWeb3.PublicKey(LENDING_MARKET_ID),
        user.publicKey,
        user.publicKey
    );

    // Alternatively, manually construct the transaction
    let recentBlockhash = await connection.getLatestBlockhash();
    let tx = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: user.publicKey,
    });

    const refreshReserve = getRefreshReserveInstruction(reserve, pythPrice);

    tx.add(refreshReserve);
    tx.add(approveTransaction);
    tx.add(depositInstruction);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    console.log(result);
};

const refreshReserve = async () => {
    const reserve = new solanaWeb3.PublicKey('Gks5AF62NsTQikrMJWmBApeKZ1woEQ2h7utcyEGw19cP');
    const pythPrice = new solanaWeb3.PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

    const instruction = getRefreshReserveInstruction(reserve, pythPrice);

    // console.log(depositInstruction);

    let recentBlockhash = await connection.getLatestBlockhash();
    let tx = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: user.publicKey,
    });

    tx.add(instruction);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    console.log(result);
};

const borrow = async () => {
    const reserve = new solanaWeb3.PublicKey('Gks5AF62NsTQikrMJWmBApeKZ1woEQ2h7utcyEGw19cP');
    const feeReciever = new solanaWeb3.PublicKey('Ec7xsdBVmsMEeS98BYa2oURgGwM1d1pE7xSSzWG7GAVN');
    const obligation = new solanaWeb3.PublicKey('E7weM6ZqwnK5seDHsvRvZF5xFFddX2q1E4QBaxh99wJB');
    const wrappedSolMint = new solanaWeb3.PublicKey('So11111111111111111111111111111111111111112');
    const pythPrice = new solanaWeb3.PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');
    // No freaking clue where this came from
    const lendingMarketAuthority = new solanaWeb3.PublicKey('B4tjbYDNcHV3LcCh1JZZ6vKJ8ED8UNd46PvuxDnDNyCv');
    const liquiditySupply = new solanaWeb3.PublicKey('BAYmRSHquVU5RrTYe97uFsgasjC4QPGSQch2NbKMDNEy');

    // THIS ACCOUNT MUST BE CREATED. IF IT DOES NOT OFFICIALLY EXIST IT WILL FAIL
    const userDepositLiquidityAccount = await solanaSplToken.getAssociatedTokenAddress(
        wrappedSolMint,
        user.publicKey,
        true,
        solanaSplToken.TOKEN_PROGRAM_ID,
        solanaSplToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('userDepositLiquidityAccount ' + userDepositLiquidityAccount.toString());

    const refreshReserve = getRefreshReserveInstruction(reserve, pythPrice);

    const obligationAccountInfo = await connection.getAccountInfo(obligation);
    let obligationDetails = null;
    const depositReserves = [];
    const borrowReserves = [];

    if (obligationAccountInfo) {
        obligationDetails = tokenLending.parseObligation(user.publicKey, obligationAccountInfo);
        obligationDetails.data.deposits.forEach((deposit) => {
            depositReserves.push(deposit.depositReserve);
        });
        obligationDetails.data.borrows.forEach((borrow) => {
            borrowReserves.push(borrow.borrowReserve);
        });
    }

    const obligationRefreshInstruction = createRefreshObligationInstruction(
        obligation,
        depositReserves,
        borrowReserves
    );

    const instruction = createBorrowLiquidityInstructions(
        10,
        liquiditySupply,
        userDepositLiquidityAccount,
        reserve,
        feeReciever,
        obligation,
        new solanaWeb3.PublicKey(LENDING_MARKET_ID),
        lendingMarketAuthority,
        user.publicKey
    );

    let recentBlockhash = await connection.getLatestBlockhash();
    let tx = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: user.publicKey,
    });

    tx.add(refreshReserve);

    tx.add(obligationRefreshInstruction);
    tx.add(instruction);

    // console.log(tx);

    const result = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [user]);
    console.log(result);
};

// 10
/// Borrow liquidity from a reserve by depositing collateral tokens. Requires a refreshed
/// obligation and reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source borrow reserve liquidity supply SPL Token account.
///   1. `[writable]` Destination liquidity token account.
///                     Minted by borrow reserve liquidity mint.
///   2. `[writable]` Borrow reserve account - refreshed.
///   3. `[writable]` Borrow reserve liquidity fee receiver account.
///                     Must be the fee account specified at InitReserve.
///   4. `[writable]` Obligation account - refreshed.
///   5. `[]` Lending market account.
///   6. `[]` Derived lending market authority.
///   7. `[signer]` Obligation owner.
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
///   10 `[optional, writable]` Host fee receiver account.
// BorrowObligationLiquidity {
/// Amount of liquidity to borrow - u64::MAX for 100% of borrowing power
// liquidity_amount: u64,
// @TODO: slippage constraint - https://git.io/JmV67
// },
const createBorrowLiquidityInstructions = (
    liquidityAmount,
    sourceLiquidity,
    destinationLiquidity,
    borrowReserve,
    borrowReserveLiquidityFeeReceiver,
    obligation,
    lendingMarket,
    lendingMarketAuthority,
    obligationOwner
) => {
    let params = { liquidityAmount: liquidityAmount };

    let allocateStruct = {
        index: 10,
        layout: struct([u32('instruction'), ns64('liquidityAmount')]),
    };

    let data = Buffer.alloc(allocateStruct.layout.span);
    let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
    allocateStruct.layout.encode(layoutFields, data);

    const keys = [
        { pubkey: sourceLiquidity, isSigner: false, isWritable: true },
        { pubkey: destinationLiquidity, isSigner: false, isWritable: true },
        { pubkey: borrowReserve, isSigner: false, isWritable: true },
        {
            pubkey: borrowReserveLiquidityFeeReceiver,
            isSigner: false,
            isWritable: true,
        },
        { pubkey: obligation, isSigner: false, isWritable: true },
        { pubkey: lendingMarket, isSigner: false, isWritable: false },
        { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
        { pubkey: obligationOwner, isSigner: true, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: solanaSplToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    // if (hostFeeReceiver) {
    //     keys.push({ pubkey: hostFeeReceiver, isSigner: false, isWritable: true });
    // }

    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

// 7
/// Refresh an obligation's accrued interest and collateral and liquidity prices. Requires
/// refreshed reserves, as all obligation collateral deposit reserves in order, followed by all
/// liquidity borrow reserves in order.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Obligation account.
///   1. `[]` Clock sysvar.
///   .. `[]` Collateral deposit reserve accounts - refreshed, all, in order.
///   .. `[]` Liquidity borrow reserve accounts - refreshed, all, in order.
const createRefreshObligationInstruction = (obligation, depositReserves, borrowReserves) => {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
        {
            instruction: 7,
        },
        data
    );
    const keys = [
        { pubkey: obligation, isSigner: false, isWritable: true },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ];
    depositReserves.forEach((depositReserve) =>
        keys.push({
            pubkey: depositReserve,
            isSigner: false,
            isWritable: false,
        })
    );
    borrowReserves.forEach((borrowReserve) =>
        keys.push({
            pubkey: borrowReserve,
            isSigner: false,
            isWritable: false,
        })
    );
    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

// 4
/// Deposit liquidity into a reserve in exchange for collateral. Collateral represents a share
/// of the reserve liquidity pool.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source liquidity token account.
///                     $authority can transfer $liquidity_amount.
///   1. `[writable]` Destination collateral token account.
///   2. `[writable]` Reserve account.
///   3. `[writable]` Reserve liquidity supply SPL Token account.
///   4. `[writable]` Reserve collateral SPL Token mint.
///   5. `[]` Lending market account.
///   6. `[]` Derived lending market authority.
///   7. `[signer]` User transfer authority ($authority).
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
const depositReserveLiquidityInstruction = (
    liquidityAmount,
    sourceLiquidity,
    destinationCollateral,
    reserve,
    reserveLiquiditySupply,
    reserveCollateralMint,
    lendingMarket,
    lendingMarketAuthority,
    transferAuthority
) => {
    let params = { liquidityAmount: liquidityAmount };

    let allocateStruct = {
        index: 4,
        layout: struct([u32('instruction'), ns64('liquidityAmount')]),
    };

    let data = Buffer.alloc(allocateStruct.layout.span);
    let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
    allocateStruct.layout.encode(layoutFields, data);

    const keys = [
        { pubkey: sourceLiquidity, isSigner: false, isWritable: true },
        { pubkey: destinationCollateral, isSigner: false, isWritable: true },
        { pubkey: reserve, isSigner: false, isWritable: true },
        { pubkey: reserveLiquiditySupply, isSigner: false, isWritable: true },
        { pubkey: reserveCollateralMint, isSigner: false, isWritable: true },
        { pubkey: lendingMarket, isSigner: false, isWritable: false },
        { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
        { pubkey: transferAuthority, isSigner: true, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: solanaSplToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

// 3
/// Accrue interest and update market price of liquidity on a reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Reserve account.
///   1. `[]` Reserve liquidity oracle account.
///             Must be the Pyth price account specified at InitReserve.
///   2. `[]` Clock sysvar.
const getRefreshReserveInstruction = (reserve, reserveLiquidityOracleAccount) => {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
        {
            instruction: 3,
        },
        data
    );

    const keys = [
        { pubkey: reserve, isSigner: false, isWritable: true },
        { pubkey: reserveLiquidityOracleAccount, isSigner: false, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ];

    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

const getCollateralInstructions = (
    collateralAmount,
    sourceCollateral,
    destinationCollateral,
    depositReserve,
    obligation,
    lendingMarket,
    obligationOwner,
    transferAuthority
) => {
    let params = { collateralAmount: collateralAmount };

    let allocateStruct = {
        index: 8,
        layout: struct([u32('instruction'), ns64('collateralAmount')]),
    };

    let data = Buffer.alloc(allocateStruct.layout.span);
    let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
    allocateStruct.layout.encode(layoutFields, data);

    console.log(destinationCollateral.toString());

    const keys = [
        { pubkey: sourceCollateral, isSigner: false, isWritable: true },
        { pubkey: destinationCollateral, isSigner: false, isWritable: true },
        { pubkey: depositReserve, isSigner: false, isWritable: false },
        { pubkey: obligation, isSigner: false, isWritable: true },
        { pubkey: lendingMarket, isSigner: false, isWritable: false },
        { pubkey: obligationOwner, isSigner: true, isWritable: false },
        { pubkey: transferAuthority, isSigner: true, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: solanaSplToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

const getObligationInstructtions = (obligation, lendingMarket, obligationOwner) => {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
        {
            instruction: 6,
        },
        data
    );

    const keys = [
        { pubkey: obligation, isSigner: false, isWritable: true },
        { pubkey: lendingMarket, isSigner: false, isWritable: false },
        { pubkey: obligationOwner, isSigner: true, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: solanaWeb3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: solanaSplToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];
    return new solanaWeb3.TransactionInstruction({
        keys,
        programId: LENDING_PROGRAM_ID,
        data,
    });
};

// createAccountWithSeeds();
// initObligation();
// depositReserveLiquidity();
// depositCollateral();
borrow();
