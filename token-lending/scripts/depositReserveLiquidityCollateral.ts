import * as web3 from "@solana/web3.js"
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress} from "@solana/spl-token"
import {COLLATERAL_MINT, LIQUIDITY_SUPPLY, SOL_RESERVE} from "./constants"
import {depositReserveLiquidityInstruction, LENDING_PROGRAM_ID} from "@solana/spl-token-lending";

const foobar = async () => {

    const user = Keypair.generate()

    const userWSolCollateralAccountAddress = await getAssociatedTokenAddress(
        COLLATERAL_MINT,
        user.publicKey,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    /*
    Adding reserve HqhpRqKj9h3h8AUP3nfVghTEm1DHKDLfcV2dwsk2ET1y
        Adding collateral mint 2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1
        Adding collateral supply 8t5GgtxSb6NX1nKQtZakJbkbEgeAQtyFfBc8eGeneP8b
        Adding liquidity supply wHeTkYJk6Ru51xxRMraTsZZhfEKFyRCvxaaKjo2vCXf
        Adding liquidity fee receiver 5R3Cv2s4cZhpTa5noCTTFwSMMpbK1Ad6vehzxN39PvPB
        Adding user collateral 6Kz9DHubchyMMwZ9eXn7cmD1kVw49EL2dQKS6epVHZEH
        Adding user transfer authority CjAuHNyVhUocUk2gr4S1sD7nEb9MFAPUphM9Mg5aTFg5
        Signature: XK5JGD4TXKJpEEZDt4sJo7WV2ni927fiqX6Ke6VGtyMLQSHQrzuCSb2GRgC5az9RRX8ophjmJ1PkwtgheYK6Eja
        Signature: 5zfAncraHWai53yJhXKz3P43Y4z79ot9C32QVrXrh6vmHCHPD39AA5nXNGdKoQJLW9wzravdqmddDVMzfUgg54VF
        Signature: 5Mv6pR7xFRhJ5E7v5ii2d9oy3FL2i5XyFhx4CSdsSyAj3UDPyU6H9v2iMRc9JXv34jZHK43dkovqVvfCzP6gpEQR
        Unwrapping 7rbD5ZzpMi6NTXqhci6BjcWV1K6xtf7ko6BbcRZ56dz1
        Amount: 1 SOL
        Recipient: F2hx2BsBDyxJgaMLXtFABuEtNk1yKTG15ar1VRga3j8Y
     */

    const instruction = depositReserveLiquidityInstruction(
        1,
        new PublicKey(""), // wSolAccount, // user's wrapped sol account
        userWSolCollateralAccountAddress, // derived with the user's public key and the mint collateral token
        SOL_RESERVE, // this i have from the reserve generation event
        LIQUIDITY_SUPPLY, // this i have from the reserve generation event, where the wrapped sol is going to end up in the reserve liquidity
        COLLATERAL_MINT, // this i have from the reserve generation event, where
        new PublicKey(LENDING_PROGRAM_ID), // this is gained when generating the market
        new PublicKey(""), // **NOTE** this i will need to find out when i run the program
        user.publicKey
    )

    const transaction = new web3.Transaction()

    transaction.add(instruction);

    const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    )

    web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [user]
    )

}

foobar()