export default {
  contractName: 'NewPeriodPool',
  constructorInputs: [
    {
      name: 'payoutLockingScript',
      type: 'bytes',
    },
    {
      name: 'collectorLockingScript',
      type: 'bytes',
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
      name: 'newPeriod',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_3 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_UTXOTOKENCOMMITMENT OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_UTXOVALUE OP_7 OP_SWAP OP_MUL OP_10 OP_DIV OP_2 OP_PICK OP_BIN2NUM OP_1ADD OP_7 OP_ROLL OP_OVER OP_9 OP_ROLL OP_MUL OP_ADD OP_TXLOCKTIME OP_LESSTHANOREQUAL OP_TXLOCKTIME 0065cd1d OP_LESSTHAN OP_BOOLAND OP_VERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_1 OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_2 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_2 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_DUP OP_4 OP_NUM2BIN OP_3 OP_OUTPUTBYTECODE OP_8 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_6 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_0 OP_UTXOVALUE OP_3 OP_ROLL OP_ADD 8813 OP_SUB e803 OP_MAX OP_ROT OP_10 OP_MOD OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_2 OP_PICK OP_OVER OP_6 OP_NUM2BIN OP_CAT OP_OVER OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_7 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_2 OP_PICK OP_5 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_5 OP_PICK OP_6 OP_SPLIT OP_2 OP_PICK e803 OP_SUB OP_OVER OP_BIN2NUM OP_6 OP_NUM2BIN OP_10 OP_PICK OP_4 OP_PICK OP_CAT OP_OVER OP_CAT OP_2 OP_PICK OP_CAT OP_5 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_ELSE OP_0 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_OVER OP_3 OP_PICK OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_DROP OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// NewPeriodPool pool contract function\r\n// Updates the StabilityPool to a new period and creates a new Collector contract\r\n// Every 10th period NewPeriodPool sends accumulated BCH to a new Payout contract\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x03\r\n*/\r\n\r\ncontract NewPeriodPool(\r\n    bytes payoutLockingScript,\r\n    bytes collectorLockingScript,\r\n    int startBlockHeight,\r\n    int periodLengthBlocks\r\n  ) {\r\n    // function newPeriod\r\n    // Starts a new period. Sends accumulated BCH from Collector (interest payments) and StabilityPool (liquidations) to a new Payout contract UTXO.\r\n    // StabilityPool pays for the transaction fees if possible (normally no external fee input required).\r\n    //\r\n    // Inputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-collector, ?04-feeBch\r\n    // Outputs: 00-StabilityPool, 01-stabilityPoolSidecar, 02-newPeriod, 03-newCollector, 04-protocolFee, 05?-newPayout, ?06-BchChange\r\n\r\n    function newPeriod(){\r\n      // Require function to be at inputIndex 2\r\n      require(this.activeInputIndex== 2);\r\n\r\n      // Authenticate stabilityPool at inputIndex 0\r\n      bytes stabilityPoolTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == stabilityPoolTokenId + 0x02);\r\n\r\n      // Parse stabilitypool state\r\n      bytes4 currentPeriodBytes, bytes remainingStabilityPoolState = tx.inputs[0].nftCommitment.split(4);\r\n\r\n      // Authenticate collector contract at inputIndex 3 with mutable NFT\r\n      require(tx.inputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\r\n      require(tx.inputs[3].nftCommitment == currentPeriodBytes);\r\n      int totalCollectedInterest = tx.inputs[3].value;\r\n      int collectedInterestAfterFee = (7 * totalCollectedInterest) / 10;\r\n\r\n      // Check if current blockheight is in new period\r\n      // We restrict locktime to below 500 million as values above are unix timestamps instead of block heights\r\n      int currentPeriod = int(currentPeriodBytes);\r\n      int newPeriod = currentPeriod + 1;\r\n      int blockHeightNewPeriod = startBlockHeight + newPeriod * periodLengthBlocks;\r\n      require(tx.locktime >= blockHeightNewPeriod && tx.locktime < 500_000_000);\r\n\r\n      // The StabilityPool itself enforces the same lockingBytecode & tokenCategory\r\n      // Pool functions need to enforce the nftCommitment & value (and tokenAmount in sidecar)\r\n      // The pool enforcements happen in the \'if\' check depending on whether a new epoch is started or not\r\n      \r\n      // StabilityPoolSidecar keeps same token amount\r\n      require(tx.outputs[1].tokenAmount == tx.inputs[1].tokenAmount);\r\n\r\n      // Recreate functionContract exactly\r\n      require(tx.outputs[2].lockingBytecode == tx.inputs[2].lockingBytecode);\r\n      require(tx.outputs[2].nftCommitment == tx.inputs[2].nftCommitment);\r\n      require(tx.outputs[2].tokenCategory == tx.inputs[2].tokenCategory);\r\n      require(tx.outputs[2].value == 1000);\r\n\r\n      // Create Collector contract at outputIndex 3\r\n      bytes4 newPeriodBytes = bytes4(newPeriod);\r\n      require(tx.outputs[3].lockingBytecode == collectorLockingScript);\r\n      require(tx.outputs[3].tokenCategory == stabilityPoolTokenId + 0x01);\r\n      require(tx.outputs[3].nftCommitment == newPeriodBytes);\r\n      require(tx.outputs[3].value == 1000);\r\n\r\n      // Protocol Fee BCH output at outputIndex 4\r\n      // Logic for protocolFee amount is enforced in Collector contract\r\n      require(tx.outputs[4].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n\r\n      // Calculate new stabilitypool balance, clamp to minimum 1000 sats\r\n      int oldStabilityPoolBalance = tx.inputs[0].value;\r\n      int newStabilityPoolBalanceUnclamped = oldStabilityPoolBalance + collectedInterestAfterFee - 5000;\r\n      int newStabilityPoolBalance = max(newStabilityPoolBalanceUnclamped, 1000);\r\n\r\n      // Create Payout contract each epoch (every 10th period)\r\n      if(newPeriod % 10 == 0) {\r\n        // During Payouts StabilityPool should be recreated with 1000 sats balance\r\n        // The calculated newStabilityPoolBalance is sent to the Payout contract instead\r\n        require(tx.outputs[0].value == 1000);\r\n\r\n        // Update all state StabilityPool\r\n        int newAmountStakedEpoch = tx.outputs[1].tokenAmount;\r\n        bytes newStateStabilityPool = newPeriodBytes + bytes6(newAmountStakedEpoch) + bytes(newAmountStakedEpoch);\r\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\r\n\r\n        // Create Payout contract at outputIndex 5\r\n        require(tx.outputs[5].lockingBytecode == payoutLockingScript);\r\n        require(tx.outputs[5].tokenCategory == tx.inputs[0].tokenCategory);\r\n        int payoutAmount = newStabilityPoolBalance;\r\n        require(tx.outputs[5].value == payoutAmount);\r\n\r\n        // Construct and check state for payout contract\r\n        bytes6 totalStakedEpochBytes, bytes remainingStakedEpochBytes = remainingStabilityPoolState.split(6);\r\n        int payoutAmountMinusDust = payoutAmount - 1000; \r\n        // Encode variable length encoded remainingStakedEpochBytes as fixed bytes6 size\r\n        bytes6 remainingStakedEpochBytes6 = bytes6(int(remainingStakedEpochBytes));\r\n        bytes payoutContractState = currentPeriodBytes + totalStakedEpochBytes + remainingStakedEpochBytes6 + bytes(payoutAmountMinusDust);\r\n        require(tx.outputs[5].nftCommitment == payoutContractState);\r\n      } else {\r\n        // Otherwise StabilityPool should be recreated with the new calculated balance\r\n        require(tx.outputs[0].value == newStabilityPoolBalance);\r\n\r\n        // Update period stabilityPool state, keep all other state the same\r\n        bytes newStateStabilityPool = newPeriodBytes + remainingStabilityPoolState;\r\n        require(tx.outputs[0].nftCommitment == newStateStabilityPool);\r\n\r\n        // Optionally allow output index 5 for BCH change but prevent minting extra NFTs\r\n        if(tx.outputs.length > 5){\r\n          require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n        }\r\n      }\r\n\r\n      // Optionally create bch change output at outputIndex 6\r\n      if (tx.outputs.length > 6) {\r\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH change output - should not hold any tokens");\r\n      }\r\n\r\n      // Don\'t allow more outputs to prevent minting extra NFTs\r\n      require(tx.outputs.length <= 7, "Invalid number of outputs - should have 7 at most");\r\n    }\r\n}',
  debug: {
    bytecode: 'c0529dc0ce00ce78527e8800cf547f53ce5379517e8853cf52798853c6577c955a965279818b577a78597a9593c5a1c5040065cd1d9f9a6951d351d09d52cd52c78852d252cf8852d152ce8852cc02e8039d76548053cd587a8853d1567a517e8853d2788853cc02e8039d54d1008800c6537a930288139402e803a47b5a97009c6300cc02e8039d51d352797856807e787e00d2788855cd57798855d100ce88527955cc789d5579567f527902e80394788156805a7954797e787e52797e55d278886d6d6d6d6700cc789d7853797e00d27888c455a06355d10088687568c456a06356d1008868c457a1696d6d7551',
    sourceMap: '26:14:26:35;:38::39;:6::41:1;29:45:29:66:0;:35::81:1;30:24:30:25:0;:14::40:1;:44::64:0;:67::71;:44:::1;:6::73;33:79:33:80:0;:69::95:1;:102::103:0;:69::104:1;36:24:36:25:0;:14::40:1;:44::64:0;;:67::71;:44:::1;:6::73;37:24:37:25:0;:14::40:1;:44::62:0;;:6::64:1;38:45:38:46:0;:35::53:1;39:39:39:40:0;:43::65;:39:::1;:69::71:0;:38:::1;43:30:43:48:0;;:26::49:1;44:22:44:39;45:33:45:49:0;;:52::61;:64::82;;:52:::1;:33;46:14:46:25:0;:::49:1;:53::64:0;:67::78;:53:::1;:14;:6::80;53:25:53:26:0;:14::39:1;:53::54:0;:43::67:1;:6::69;56:25:56:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;57:25:57:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;58:25:58:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;59:25:59:26:0;:14::33:1;:37::41:0;:6::43:1;62:37:62:46:0;:30::47:1;;63:25:63:26:0;:14::43:1;:47::69:0;;:6::71:1;64:25:64:26:0;:14::41:1;:45::65:0;;:68::72;:45:::1;:6::74;65:25:65:26:0;:14::41:1;:45::59:0;:6::61:1;66:25:66:26:0;:14::33:1;:37::41:0;:6::43:1;70:25:70:26:0;:14::41:1;:45::47:0;:6::100:1;73:46:73:47:0;:36::54:1;74:71:74:96:0;;:45:::1;:99::103:0;:45:::1;75:74:75:78:0;:36::79:1;78:9:78:18:0;:21::23;:9:::1;:27::28:0;:9:::1;:30:101:7:0;81:27:81:28;:16::35:1;:39::43:0;:8::45:1;84:46:84:47:0;:35::60:1;85:38:85:52:0;;:62::82;:55::83:1;;:38;:92::112:0;:38::113:1;86:27:86:28:0;:16::43:1;:47::68:0;:8::70:1;89:27:89:28:0;:16::45:1;:49::68:0;;:8::70:1;90:27:90:28:0;:16::43:1;:57::58:0;:47::73:1;:8::75;91:27:91:50:0;;92::92:28;:16::35:1;:39::51:0;:8::53:1;95:72:95:99:0;;:106::107;:72::108:1;96:36:96:48:0;;:51::55;:36:::1;98:55:98:80:0;:51::81:1;:44::82;;99:36:99:54:0;;:57::78;;:36:::1;:81::107:0;:36:::1;:116::137:0;;:36::138:1;100:27:100:28:0;:16::43:1;:47::66:0;:8::68:1;78:30:101:7;;;;101:13:113::0;103:27:103:28;:16::35:1;:39::62:0;:8::64:1;106:38:106:52:0;:55::82;;:38:::1;107:27:107:28:0;:16::43:1;:47::68:0;:8::70:1;110:11:110:28:0;:31::32;:11:::1;:33:112:9:0;111:29:111:30;:18::45:1;:49::51:0;:10::104:1;110:33:112:9;101:13:113:7;;116:10:116:27:0;:30::31;:10:::1;:33:118:7:0;117:27:117:28;:16::43:1;:47::49:0;:8::109:1;116:33:118:7;121:14:121:31:0;:35::36;:14:::1;:6::91;24:4:122:5;;;',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 26,
      },
      {
        ip: 14,
        line: 30,
      },
      {
        ip: 25,
        line: 36,
      },
      {
        ip: 30,
        line: 37,
      },
      {
        ip: 55,
        line: 46,
      },
      {
        ip: 60,
        line: 53,
      },
      {
        ip: 65,
        line: 56,
      },
      {
        ip: 70,
        line: 57,
      },
      {
        ip: 75,
        line: 58,
      },
      {
        ip: 79,
        line: 59,
      },
      {
        ip: 87,
        line: 63,
      },
      {
        ip: 94,
        line: 64,
      },
      {
        ip: 98,
        line: 65,
      },
      {
        ip: 102,
        line: 66,
      },
      {
        ip: 106,
        line: 70,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 125,
        line: 81,
      },
      {
        ip: 139,
        line: 86,
      },
      {
        ip: 144,
        line: 89,
      },
      {
        ip: 149,
        line: 90,
      },
      {
        ip: 155,
        line: 92,
      },
      {
        ip: 181,
        line: 100,
      },
      {
        ip: 190,
        line: 103,
      },
      {
        ip: 198,
        line: 107,
      },
      {
        ip: 206,
        line: 111,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 217,
        line: 117,
        message: 'Invalid BCH change output - should not hold any tokens',
      },
      {
        ip: 222,
        line: 121,
        message: 'Invalid number of outputs - should have 7 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:07.960Z',
} as const;
