export default {
  contractName: 'WithdrawFromPool',
  constructorInputs: [],
  abi: [
    {
      name: 'withdraw',
      inputs: [
        {
          name: 'amountWithdrawal',
          type: 'int',
        },
      ],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_3 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_3 OP_PICK OP_BIN2NUM OP_ROT OP_BIN2NUM OP_10 OP_DIV OP_SWAP OP_10 OP_DIV OP_NUMEQUALVERIFY OP_BIN2NUM OP_4 OP_PICK OP_OVER OP_NUMEQUAL OP_5 OP_PICK 1027 OP_GREATERTHANOREQUAL OP_OVER OP_BOOLOR OP_VERIFY OP_5 OP_PICK OP_2 OP_PICK OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_ROT OP_6 OP_SPLIT OP_SWAP OP_BIN2NUM OP_6 OP_PICK OP_SUB OP_SWAP OP_BIN2NUM OP_6 OP_PICK OP_SUB OP_4 OP_PICK OP_ROT OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_UTXOTOKENAMOUNT OP_5 OP_PICK OP_SUB OP_1 OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_3 OP_SWAP OP_NOTIF OP_DROP OP_4 OP_OVER OP_5 OP_PICK OP_SUB OP_DUP 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_5 OP_PICK OP_EQUALVERIFY OP_3 OP_PICK OP_OVER OP_CAT OP_3 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2DROP OP_ENDIF OP_DUP OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_OVER OP_1ADD OP_GREATERTHAN OP_IF OP_DUP OP_1ADD OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_SWAP OP_2 OP_ADD OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// WithdrawFromPool pool contract function\r\n// Allows user to withdraw ParityUSD from the stabilityPool by returning their staking receipt NFT\r\n// The staking receipt should be of the current period to see the latest stake amount\r\n// This latest stake amount is updated by the Payout contract to account for any funds used in liquidations\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x04\r\n*/\r\n\r\n/*  --- State Receipts Immutable NFT ---\r\n    bytes4 periodReceipt\r\n    bytes addedTokenAmount\r\n*/\r\n\r\n// for partial withdrawals:\r\n// minimumToWithdraw = 100.00 ParityUSD\r\n// minimumToKeepStaked = 100.00 ParityUSD\r\n\r\n// Note: In practice the \'periodReceipt\' state is only used to derive the corresponding epoch (periodReceipt / 10)\r\n\r\ncontract WithdrawFromPool(\r\n  ) {\r\n    // function withdraw\r\n    // Allows ParityUSD depositer to withdraw their tokens from the StabilityPool.\r\n    //\r\n    // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-WithdrawFromPool, 03-userReceipt, 04-feeBch\r\n    // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-WithdrawFromPool, 03-newReceipt, 03/04-withdrawnTokens, ?04/05-changeBch\r\n\r\n    function withdraw(\r\n      int amountWithdrawal\r\n    ){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex== 2);\r\n\r\n      // Authenticate stabilityPool at inputIndex 0\r\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\r\n\r\n      // Parse stabilitypool state\r\n      bytes4 currentPeriodBytes, bytes remainingState = tx.inputs[0].nftCommitment.split(4);\r\n\r\n      // Authenticate staking receipt\r\n      require(tx.inputs[3].tokenCategory == stabilityPoolTokenId, "Invalid receipt, should have correct tokenId");\r\n\r\n      // Parse state staking receipt\r\n      bytes4 periodReceiptBytes, bytes amountStakedReceiptBytes = tx.inputs[3].nftCommitment.split(4);\r\n\r\n      // Check period receipt, should be in the same staking epoch (10 periods) as currentPeriod\r\n      int currentPeriod = int(currentPeriodBytes);\r\n      int periodReceipt = int(periodReceiptBytes);\r\n      require(periodReceipt / 10 == currentPeriod / 10);\r\n\r\n      // Check amountWithdrawal is in valid range\r\n      int amountStakedReceipt = int(amountStakedReceiptBytes);\r\n      bool isFullWithdrawal = amountWithdrawal == amountStakedReceipt;\r\n      // Check range amountWithdrawal: minimum treshold OR full withdrawal (if less than minimum)\r\n      require(amountWithdrawal >= 100_00 || isFullWithdrawal);\r\n      // Maximum withdrawal is the amountStakedReceipt\r\n      require(amountWithdrawal <= amountStakedReceipt);\r\n      \r\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\r\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\r\n      \r\n      // Replicate StabilityPool value\r\n      require(tx.outputs[0].value == tx.inputs[0].value, "Recreate contract at output0 - should have same BCH Balance");\r\n      \r\n      // Change state StabilityPool\r\n      bytes6 totalStakedEpoch, bytes remainingStakedEpoch = remainingState.split(6);\r\n      int newTotalStakedEpoch = int(totalStakedEpoch) - amountWithdrawal;\r\n      int newRemainingStakedEpoch = int(remainingStakedEpoch) - amountWithdrawal;\r\n      bytes newStateStabilityPool = currentPeriodBytes + bytes6(newTotalStakedEpoch) + bytes(newRemainingStakedEpoch);\r\n      require(tx.outputs[0].nftCommitment == newStateStabilityPool);\r\n      \r\n      // TokenSidecar recreated with reduced tokenAmount\r\n      int newStabilityPoolSidecarTokenAmount = tx.inputs[1].tokenAmount - amountWithdrawal;\r\n      require(tx.outputs[1].tokenAmount == newStabilityPoolSidecarTokenAmount);\r\n\r\n      // Recreate functionContract exactly\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n\r\n      // Assign index for the ParityUSD staking withdrawal output\r\n      int withdrawalOutputIndex = 3;\r\n\r\n      // Handle partial withdrawals\r\n      if(!isFullWithdrawal){\r\n        // If not a full withdrawal, issue new receipt\r\n        withdrawalOutputIndex = 4;\r\n\r\n        // Require minimum for newAmountStaked\r\n        int newAmountStakedReceipt = amountStakedReceipt - amountWithdrawal;\r\n        require(newAmountStakedReceipt >= 100_00);\r\n        \r\n        // Issue receipt as fourth output\r\n        require(tx.outputs[3].tokenCategory == stabilityPoolTokenId, "Invalid receipt, should have correct tokenId");\r\n        bytes newReceipt = currentPeriodBytes + bytes(newAmountStakedReceipt);\r\n        require(tx.outputs[3].nftCommitment == newReceipt, "Invalid receipt, should have correct nftCommitment");\r\n        require(tx.outputs[3].value == 1000);\r\n      }\r\n      \r\n      // Output for Withrawal tokens, at index 3 or 4 depending on newReceipt or not\r\n      require(tx.outputs[withdrawalOutputIndex].tokenCategory == tx.inputs[1].tokenCategory);\r\n\r\n      // Optional output for BCH change\r\n      if (tx.outputs.length > withdrawalOutputIndex + 1) {\r\n        require(tx.outputs[withdrawalOutputIndex + 1].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n\r\n      // Don\'t allow more outputs to prevent minting extra NFTs.\r\n      require(tx.outputs.length <= withdrawalOutputIndex + 2, "Invalid number of outputs");\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cf547f53ce53798853cf547f5379817b815a967c5a969d815479789c5579021027a2789b6955795279a16900cc00c69d7b567f7c815679947c8156799454797b56807e7c7e00d28851d055799451d39d52cd52c78852d252cf8852d152ce8852cc02e8039d537c6475547855799476021027a26953d15579885379787e53d2788853cc02e8039d6d6876d151ce88c4788ba063768bd1008868c47c5293a1696d6d51',
    sourceMap: '35:14:35:35;:38::39;:6::41:1;38:45:38:66:0;:35::81:1;39:24:39:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;42:66:42:67:0;:56::82:1;:89::90:0;:56::91:1;45:24:45:25:0;:14::40:1;:44::64:0;;:6::114:1;48:76:48:77:0;:66::92:1;:99::100:0;:66::101:1;51:30:51:48:0;;:26::49:1;52:30:52:48:0;:26::49:1;53:30:53:32:0;:14:::1;:36::49:0;:52::54;:36:::1;:6::56;56:32:56:61;57:30:57:46:0;;:50::69;:30:::1;59:14:59:30:0;;:34::40;:14:::1;:44::60:0;:14:::1;:6::62;61:14:61:30:0;;:34::53;;:14:::1;:6::55;67:25:67:26:0;:14::33:1;:47::48:0;:37::55:1;:6::120;70:60:70:74:0;:81::82;:60::83:1;71:36:71:52:0;:32::53:1;:56::72:0;;:32:::1;72:40:72:60:0;:36::61:1;:64::80:0;;:36:::1;73::73:54:0;;:64::83;:57::84:1;;:36;:93::116:0;:36::117:1;74:25:74:26:0;:14::41:1;:6::68;77:57:77:58:0;:47::71:1;:74::90:0;;:47:::1;78:25:78:26:0;:14::39:1;:6::79;81:25:81:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;82:25:82:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;83:25:83:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;84:25:84:26:0;:14::33:1;:37::41:0;:6::43:1;87:34:87:35:0;90:10:90:26;:9:103:7;92:8:92:34:1;;95:37:95:56:0;:59::75;;:37:::1;96:16:96:38:0;:42::48;:16:::1;:8::50;99:27:99:28:0;:16::43:1;:47::67:0;;:8::117:1;100:27:100:45:0;;:54::76;:27::77:1;101::101:28:0;:16::43:1;:47::57:0;:8::113:1;102:27:102:28:0;:16::35:1;:39::43:0;:8::45:1;90:27:103:7;;106:25:106:46:0;:14::61:1;:75::76:0;:65::91:1;:6::93;109:10:109:27:0;:30::51;:::55:1;:10;:57:111:7:0;110:27:110:48;:::52:1;:16::67;:71::73:0;:8::133:1;109:57:111:7;114:14:114:31:0;:35::56;:59::60;:35:::1;:14;:6::91;31:4:115:5;;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 35,
      },
      {
        ip: 10,
        line: 39,
      },
      {
        ip: 19,
        line: 45,
        message: 'Invalid receipt, should have correct tokenId',
      },
      {
        ip: 34,
        line: 53,
      },
      {
        ip: 46,
        line: 59,
      },
      {
        ip: 52,
        line: 61,
      },
      {
        ip: 57,
        line: 67,
        message: 'Recreate contract at output0 - should have same BCH Balance',
      },
      {
        ip: 81,
        line: 74,
      },
      {
        ip: 89,
        line: 78,
      },
      {
        ip: 94,
        line: 81,
      },
      {
        ip: 99,
        line: 82,
      },
      {
        ip: 104,
        line: 83,
      },
      {
        ip: 108,
        line: 84,
      },
      {
        ip: 121,
        line: 96,
      },
      {
        ip: 126,
        line: 99,
        message: 'Invalid receipt, should have correct tokenId',
      },
      {
        ip: 134,
        line: 101,
        message: 'Invalid receipt, should have correct nftCommitment',
      },
      {
        ip: 138,
        line: 102,
      },
      {
        ip: 145,
        line: 106,
      },
      {
        ip: 155,
        line: 110,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 162,
        line: 114,
        message: 'Invalid number of outputs',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:08.441Z',
} as const;
