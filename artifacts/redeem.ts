export default {
  contractName: 'redeemLoan',
  constructorInputs: [
    {
      name: 'redemptionTokenId',
      type: 'bytes32',
    },
    {
      name: 'timelockRedemption',
      type: 'int',
    },
    {
      name: 'startBlockHeight',
      type: 'int',
    },
    {
      name: 'periodLengthBlocks',
      type: 'int',
    },
  ],
  abi: [
    {
      name: 'redeemOrCancel',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_ROT OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_BIN2NUM OP_DUP OP_1 OP_UTXOTOKENCATEGORY OP_3 OP_ROLL OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT 12 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_BIN2NUM OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_1ADD OP_5 OP_ROLL OP_SWAP OP_6 OP_ROLL OP_MUL OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_BOOLAND OP_IF OP_DROP OP_0 OP_ELSE OP_3 OP_INPUTSEQUENCENUMBER OP_DUP OP_5 OP_PICK OP_NUMEQUALVERIFY OP_DROP OP_ENDIF OP_4 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER 00e1f505 OP_MUL OP_SWAP OP_DIV OP_0 OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_SWAP OP_BIN2NUM OP_5 OP_PICK OP_SUB OP_ROT OP_BIN2NUM OP_5 OP_ROLL OP_SUB OP_1 OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_3 OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_3 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENAMOUNT OP_OVER OP_NUMEQUALVERIFY OP_ELSE OP_3 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Redeem loan contract function\r\n// Is used by a redemption to finalize the redemption process, redeems ParityUSD tokens for BCH collateral from loan\r\n// Any redemption still pending when a newer period starts can be cancelled\r\n// This is to prevent the free option problem\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x03\r\n*/\r\n\r\ncontract redeemLoan(\r\n  bytes32 redemptionTokenId,\r\n  int timelockRedemption,\r\n  int startBlockHeight,\r\n  int periodLengthBlocks\r\n  ) {\r\n      // function redeemOrCancel\r\n      // Finalize redemption process, redeems ParityUSD tokens for BCH collateral from loan\r\n      // If the redemption is still pending when a newer period starts, the redemption can be cancelled instead\r\n      // The redemption pays for the transaction fees (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-redeem, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, ?06-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-redeem, 03-opreturn, 04-payoutRedemption, 05?-tokenChangeOutput, ?06-BchChange\r\n\r\n    function redeemOrCancel(){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex == 2);\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n\r\n      // Authenticate loan at inputIndex 0, nftCommitment checked later\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Authenticate redemption at inputIndex 3\r\n      require(tx.inputs[3].tokenCategory == redemptionTokenId + 0x01);\r\n\r\n      // Read state from redemption\r\n      bytes32 targetLoan, bytes redemptionAmountBytes = tx.inputs[3].nftCommitment.split(32);\r\n      int redemptionAmount = int(redemptionAmountBytes);\r\n      // Create a new variable which will be overwritten if the redemption is cancelled\r\n      // then the redemptionAmountToFinalize will be set to 0\r\n      int redemptionAmountToFinalize = redemptionAmount;\r\n\r\n      // Require target loan to match tokenid\r\n      require(tx.inputs[1].tokenCategory == targetLoan);\r\n\r\n      // Parse current period from loan contract\r\n      bytes4 lastPeriodInterestPaidBytes = tx.inputs[0].nftCommitment.slice(14,18);\r\n      int currentPeriod = int(lastPeriodInterestPaidBytes);\r\n\r\n      // Requiring version 2 to be able to use relative timelocks (sequenceNumber)\r\n      require(tx.version == 2);\r\n\r\n      // Check if the locktime is in a newer period than the current loan period\r\n      // Any redemption still running when the new period starts can be cancelled\r\n      int newPeriod = currentPeriod + 1;\r\n      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;\r\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\r\n      bool isInNewPeriod = tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000;\r\n\r\n      // If a new period has started, allow to cancel the redemption\r\n      if(isInNewPeriod){\r\n        redemptionAmountToFinalize = 0;\r\n      } else {\r\n        // Otherwise, proceed with the normal finalization of the redemption\r\n        // Enforce redemption timelock on redemption Utxo\r\n        int sequenceLoanInput = tx.inputs[3].sequenceNumber;\r\n        require(sequenceLoanInput == timelockRedemption);\r\n      }\r\n\r\n      // Read state from redemption sidecar\r\n      bytes redemptionPriceBytes = tx.inputs[4].nftCommitment.split(20)[1];\r\n      int redemptionPrice = int(redemptionPriceBytes);\r\n\r\n      // Calculate new loan collateral after redemption\r\n      // Use the redemptionAmountToFinalize which is 0 if the redemption is cancelled\r\n      int redeemedCollateral = redemptionAmountToFinalize * 100_000_000 / redemptionPrice;\r\n      int newLoanCollateral = tx.inputs[0].value - redeemedCollateral;\r\n\r\n      // Parse loan state, used to construct new loan commitment\r\n      bytes loanState = tx.inputs[0].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemed, bytes lastPartLoanState = remainingPartLoanState.split(6);\r\n\r\n      // Construct loan state after redemption (debt decreases, amountBeingRedeemed decreases)\r\n      int newAmountBeingRedeemed = int(amountBeingRedeemed) - redemptionAmount;\r\n      int newBorrowAmount = int(borrowedAmountBytes) - redemptionAmount;\r\n      bytes27 newLoanCommitment = 0x01 + bytes6(newBorrowAmount) + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\r\n\r\n      // Recreate loan contract with new state and new collateral amount at output index 0\r\n      require(tx.outputs[0].nftCommitment == newLoanCommitment);\r\n      require(tx.outputs[0].value == newLoanCollateral);\r\n      require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\r\n      require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);\r\n      require(tx.outputs[0].tokenAmount == 0);\r\n      \r\n      // Recreate functionContract at output index 2\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n      require(tx.outputs[2].tokenAmount == 0);\r\n\r\n      // Burn redeemed ParityUSD by sending to unspendable opreturn output at index 3\r\n      require(tx.outputs[3].lockingBytecode == new LockingBytecodeNullData([0x]));\r\n      if(redemptionAmountToFinalize > 0){\r\n        require(tx.outputs[3].tokenCategory == parityTokenId);\r\n        require(tx.outputs[3].tokenAmount == redemptionAmountToFinalize);\r\n      } else {\r\n        require(tx.outputs[3].tokenCategory == 0x);\r\n      }\r\n\r\n      // Logic for creating the redemption payout output and redemption token change is enforced by the redemption contract\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78517e8853ce7b517e8853cf01207f817651ce537a8800cf01127f755e7f7781c2529d8b557a7c567a9593c5a1c5040065cd1d9f9a6375006753cb7655799d756854cf01147f7781780400e1f505957c9600c67c9400cf577f7c517f7c51887c567f7c815579947b81557a94517c56807e7c56807e7c7e00d28800cc9d00cd00c78800d100ce8800d3009d52cd52c78852d252cf8852d152ce8852cc02e8039d52d3009d53cd016a00827c7e7e887600a06353d152798853d3789d6753d10088686d7551',
    sourceMap: '28:14:28:35;:39::40;:6::42:1;29:38:29:59:0;:28::74:1;32:24:32:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;35:24:35:25:0;:14::40:1;:44::61:0;:64::68;:44:::1;:6::70;38:66:38:67:0;:56::82:1;:89::91:0;:56::92:1;39:29:39:55;42:39:42::0;45:24:45:25;:14::40:1;:44::54:0;;:6::56:1;48:53:48:54:0;:43::69:1;:79::81:0;:43::82:1;;:76::78:0;:43::82:1;;49:26:49:58;52:14:52:24:0;:28::29;:6::31:1;56:22:56:39;57:33:57:49:0;;:52::61;:64::82;;:52:::1;:33;59:27:59:38:0;:::62:1;:66::77:0;:80::91;:66:::1;:27;62:23:64:7:0;63:8:63:39:1;;64:13:69:7:0;67:42:67:43;:32::59:1;68:16:68:33:0;:37::55;;:8::57:1;64:13:69:7;;72:45:72:46:0;:35::61:1;:68::70:0;:35::71:1;:::74;73:28:73:53;77:31:77:57:0;:60::71;:31:::1;:74::89:0;:31:::1;78:40:78:41:0;:30::48:1;:51::69:0;:30:::1;81:34:81:35:0;:24::50:1;82:80:82:81:0;:64::82:1;83:52:83:70:0;:77::78;:52::79:1;84:14:84:24:0;:28::32;:6::34:1;85:60:85:82:0;:89::90;:60::91:1;88:39:88:58:0;:35::59:1;:62::78:0;;:35:::1;89:32:89:51:0;:28::52:1;:55::71:0;;:28:::1;90:34:90:38:0;:48::63;:41::64:1;;:34;:74::96:0;:67::97:1;;:34;:108::125:0;:34::126:1;93:25:93:26:0;:14::41:1;:6::64;94:25:94:26:0;:14::33:1;:6::56;95:25:95:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;96:25:96:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;97:25:97:26:0;:14::39:1;:43::44:0;:6::46:1;100:25:100:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;101:25:101:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;102:25:102:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;103:25:103:26:0;:14::33:1;:37::41:0;:6::43:1;104:25:104:26:0;:14::39:1;:43::44:0;:6::46:1;107:25:107:26:0;:14::43:1;:47::80:0;:76::78;::::1;;;;:6::82;108:9:108:35:0;:38::39;:9:::1;:40:111:7:0;109:27:109:28;:16::43:1;:47::60:0;;:8::62:1;110:27:110:28:0;:16::41:1;:45::71:0;:8::73:1;111:13:113:7:0;112:27:112:28;:16::43:1;:47::49:0;:8::51:1;111:13:113:7;26:4:116:5;;',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 28,
      },
      {
        ip: 14,
        line: 32,
      },
      {
        ip: 20,
        line: 35,
      },
      {
        ip: 31,
        line: 45,
      },
      {
        ip: 43,
        line: 52,
      },
      {
        ip: 67,
        line: 68,
      },
      {
        ip: 94,
        line: 84,
      },
      {
        ip: 121,
        line: 93,
      },
      {
        ip: 124,
        line: 94,
      },
      {
        ip: 129,
        line: 95,
      },
      {
        ip: 134,
        line: 96,
      },
      {
        ip: 138,
        line: 97,
      },
      {
        ip: 143,
        line: 100,
      },
      {
        ip: 148,
        line: 101,
      },
      {
        ip: 153,
        line: 102,
      },
      {
        ip: 157,
        line: 103,
      },
      {
        ip: 161,
        line: 104,
      },
      {
        ip: 170,
        line: 107,
      },
      {
        ip: 179,
        line: 109,
      },
      {
        ip: 183,
        line: 110,
      },
      {
        ip: 188,
        line: 112,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:02.770Z',
} as const;
