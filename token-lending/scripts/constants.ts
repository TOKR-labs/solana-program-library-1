import {PublicKey} from "@solana/web3.js";


/*

bash deploy-lending-market.sh                                                                                                    5s 16:04:23

Running deploy script...
        Config File: /Users/ericmcgary/.config/solana/cli/config.yml
        RPC URL: https://api.devnet.solana.com
        WebSocket URL: wss://api.devnet.solana.com/ (computed)
        Keypair Path: /Users/ericmcgary/Documents/workspace/tokr/keys/owner.json
        Commitment: confirmed

        Unwrapping 7rbD5ZzpMi6NTXqhci6BjcWV1K6xtf7ko6BbcRZ56dz1
        Amount: 10 SOL
        Recipient: F2hx2BsBDyxJgaMLXtFABuEtNk1yKTG15ar1VRga3j8Y

Signature: 53xHZhcMotjDna95wj9qzRbFKnfajhF7jAyx9DFNwgk2Z7KfmyZe8VeJgJ4DGVXPZ3aHPVPfWdoNKdV6SmEKPrTN

Owner keypair: /Users/ericmcgary/Documents/workspace/tokr/keys/owner.json
Lender keypair: /Users/ericmcgary/Documents/workspace/tokr/keys/lending.json
Owner address: F2hx2BsBDyxJgaMLXtFABuEtNk1yKTG15ar1VRga3j8Y
Lender address: 8u6sK5KwmnSrR2FBFYnXhb8tVH2CJqqzb76T7Ltm41tr

Creating Lending Program
        Program Id: 8u6sK5KwmnSrR2FBFYnXhb8tVH2CJqqzb76T7Ltm41tr

Creating Lending Market
        Creating lending market BgUvobSRbnMzZozcUGhXFj8PLe73LimzpRMb386Txncd
        Signature: 2tkknRChjc1hprT4FZ4ArghUV47gsqHmME1Ny1t14c66BaPQzBXEYTCBxvgWoYcn2BWUaiLPNasQFwEns3jYPwFk

Market: BgUvobSRbnMzZozcUGhXFj8PLe73LimzpRMb386Txncd
Authority Address:
CREATE_MARKET_OUTPUT: Creating lending market BgUvobSRbnMzZozcUGhXFj8PLe73LimzpRMb386Txncd
    Signature: 2tkknRChjc1hprT4FZ4ArghUV47gsqHmME1Ny1t14c66BaPQzBXEYTCBxvgWoYcn2BWUaiLPNasQFwEns3jYPwFk

Creating SOL reserve
--fee-payer /Users/ericmcgary/Documents/workspace/tokr/keys/owner.json   --market-owner      /Users/ericmcgary/Documents/workspace/tokr/keys/owner.json   --source-owner      /Users/ericmcgary/Documents/workspace/tokr/keys/owner.json   --market            BgUvobSRbnMzZozcUGhXFj8PLe73LimzpRMb386Txncd   --source            7rbD5ZzpMi6NTXqhci6BjcWV1K6xtf7ko6BbcRZ56dz1   --amount            1    --pyth-product      3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E   --pyth-price        J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix   --verbose

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

        Signature: 1CiXKoGQUZ2NhLeH1tgvfbGYYC9DBtyyvjTGYEMm2PuNsoFS5y1pnVvuWCVwz1DEib999J73rpRZnFZEQAai27o

 */

export const SOL_RESERVE = new PublicKey("HqhpRqKj9h3h8AUP3nfVghTEm1DHKDLfcV2dwsk2ET1y")
export const COLLATERAL_MINT = new PublicKey("2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1")
export const COLLATERAL_SUPPLY = new PublicKey("2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1")
export const LIQUIDITY_SUPPLY = new PublicKey("2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1")
export const LIQUIDITY_FEE_RECIEVER = new PublicKey("5R3Cv2s4cZhpTa5noCTTFwSMMpbK1Ad6vehzxN39PvPB")
export const USER_COLLATERAL = new PublicKey("2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1")
export const TRANSFER_AUTHORITY = new PublicKey("2MyCFqGBsHeYPrWESBZ7dxZdeYjzHiumqh1JwJ1YEto1")
export const MARKET_OWNER = new PublicKey("F2hx2BsBDyxJgaMLXtFABuEtNk1yKTG15ar1VRga3j8Y")
export const LENDING_MARKET = new PublicKey("BgUvobSRbnMzZozcUGhXFj8PLe73LimzpRMb386Txncd")