#!/bin/bash
AMOUNT=4500;

TOKEN=`spl-token create-token --decimals 0 2>&1 | head -n1 | awk '{print $NF}'`;
ACCOUNT=`spl-token create-account $TOKEN  2>&1 | head -n1 | awk '{print $NF}'`;
echo "TOKEN: $TOKEN";
echo "ACCOUNT: $ACCOUNT";

MINT=`spl-token mint $TOKEN $AMOUNT`;

echo "$MINT"
