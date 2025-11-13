export default {
  contractName: 'Payout',
  constructorInputs: [],
  abi: [
    {
      name: 'claim',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_6 OP_SPLIT OP_6 OP_SPLIT OP_0 OP_UTXOTOKENCATEGORY 20 OP_SPLIT OP_DROP OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_6 OP_ROLL OP_BIN2NUM OP_ROT OP_BIN2NUM OP_10 OP_DIV OP_OVER OP_10 OP_DIV OP_NUMEQUALVERIFY OP_0 OP_6 OP_ROLL OP_BIN2NUM OP_3 OP_ROLL OP_BIN2NUM OP_OVER OP_0 OP_NUMNOTEQUAL OP_IF OP_5 OP_PICK OP_BIN2NUM OP_OVER OP_MUL OP_2 OP_PICK OP_DIV OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_ENDIF OP_0 OP_UTXOVALUE OP_3 OP_ROLL OP_SUB OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_NUMEQUALVERIFY OP_5 OP_ROLL OP_BIN2NUM OP_MUL OP_SWAP OP_DIV OP_SWAP OP_10 OP_ADD OP_4 OP_NUM2BIN OP_SWAP OP_CAT OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_NOTIF OP_DUP 20 OP_SPLIT OP_DROP OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_3 OP_LESSTHANOREQUAL OP_NIP OP_NIP OP_NIP',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Contract to payout rewards stability pool\r\n// One Payout contract is created per epoch in (every 10th invocation of) the \'NewPeriodPool\' function of the StabilityPool contract\r\n\r\n/*  --- State Payout Minting NFT ---\r\n    bytes4 period\r\n    bytes6 totalStakedEpoch (tokens)\r\n    bytes6 remainingStakedEpoch (tokens)\r\n    bytes totalClaimValue (BCH)\r\n*/\r\n\r\n/*  --- State Receipts Immutable NFT ---\r\n    bytes4 period\r\n    bytes amountStakedReceipt (tokens)\r\n*/\r\n\r\n// Note: In practice the \'periodReceipt\' state is only used to derive the corresponding epoch (periodReceipt / 10)\r\n\r\ncontract Payout() {\r\n    // function claim\r\n    // Allows ParityUSD depositor to claim the portion of the interest they were entitled to in the period.\r\n    //\r\n    // Inputs: 00-Payout, 01-userReceipt, ?02-feeBch\r\n    // Outputs: 00-Payout, 01-newUserReceipt, 02-userBchPayout\r\n\r\n  function claim() {\r\n    // Require contract to be at inputIndex 0\r\n    require(this.activeInputIndex == 0, "Payout contract must always be at input index 0");\r\n\r\n    // Parse state Payout contract\r\n    bytes4 periodPayoutBytes, bytes remainingState = tx.inputs[0].nftCommitment.split(4);\r\n    bytes6 totalStakedEpochBytes, bytes remainingState2 = remainingState.split(6);\r\n    bytes6 remainingStakedEpochBytes, bytes totalClaimValueBytes = remainingState2.split(6);\r\n\r\n    // Authenticate staking receipt\r\n    bytes32 stabilityPoolTokenId = tx.inputs[0].tokenCategory.split(32)[0];\r\n    require(tx.inputs[1].tokenCategory == stabilityPoolTokenId, "Invalid claim receipt, should have correct tokenId");\r\n\r\n    // Parse state staking receipt\r\n    bytes stateReceipt = tx.inputs[1].nftCommitment;\r\n    bytes4 periodReceiptBytes, bytes amountStakedReceiptBytes = stateReceipt.split(4);\r\n\r\n    // Check period receipt, should be in the same staking epoch (10 periods) as currentPeriod\r\n    int periodPayout = int(periodPayoutBytes);\r\n    int periodReceipt = int(periodReceiptBytes);\r\n    require(periodReceipt / 10 == periodPayout / 10, "Invalid claim receipt, should be from the correct period");\r\n\r\n    // Calculate user claim\r\n    int claimAmount = 0;\r\n    int totalStakedEpoch = int(totalStakedEpochBytes);\r\n    int amountStakedReceipt = int(amountStakedReceiptBytes);\r\n    // Prevent division by zero\r\n    if(totalStakedEpoch != 0){\r\n      claimAmount= int(totalClaimValueBytes) * amountStakedReceipt / totalStakedEpoch;\r\n    }\r\n    \r\n    // Recreate Payout contract with lower bch amount at outputIndex 0\r\n    int newAmountPayoutContract = tx.inputs[0].value - claimAmount;\r\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory, "Recreate contract at output0 - invalid tokenCategory");\r\n    require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment, "Recreate contract at output0 - invalid nftCommitment");\r\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, "Recreate contract at output0 - invalid lockingBytecode");\r\n    require(tx.outputs[0].value == newAmountPayoutContract, "Recreate contract at output0 - invalid BCH amount");\r\n\r\n    // Construct new receipt state\r\n    int remainingStakedEpoch = int(remainingStakedEpochBytes);\r\n    int newAmountStaked = amountStakedReceipt * remainingStakedEpoch / totalStakedEpoch;\r\n    int newPeriodReceipt = periodPayout + 10;\r\n    bytes newReceipt = bytes4(newPeriodReceipt) + bytes(newAmountStaked);\r\n\r\n    // Create new user receipt output at outputIndex 1\r\n    require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory);\r\n    require(tx.outputs[1].nftCommitment == newReceipt, "Invalid new receipt, should have correct nftCommitment");\r\n    require(tx.outputs[1].value == 1000, "Invalid tokenoutput - needs to hold exactly 1000 sats");\r\n\r\n    // User Bch Payout output at outputIndex 2\r\n    // Allow for token category, disallow for StabilityPool/Payout category to be used\r\n    // Enables future extension of automatic payout distribution contract\r\n    bytes tokenCategoryOutput2 = tx.outputs[2].tokenCategory;\r\n    if(tokenCategoryOutput2 != 0x) require(tokenCategoryOutput2.split(32)[0] != stabilityPoolTokenId);\r\n\r\n    // Don\'t allow more outputs to prevent minting extra NFTs.\r\n    require(tx.outputs.length <= 3, "Invalid number of outputs - should have 3 at most");\r\n  }\r\n}',
  debug: {
    bytecode: 'c0009d00cf547f567f567f00ce01207f7551ce788851cf547f567a817b815a96785a969d00567a81537a8178009e635579817895527996537a757c6b7c6c6800c6537a9400d100ce8800d200cf8800cd00c78800cc9d557a81957c967c5a9354807c7e51d151ce8851d28851cc02e8039d52d1760087647601207f75527987916968c453a1777777',
    sourceMap: '29:12:29:33;:37::38;:4::91:1;32:63:32:64:0;:53::79:1;:86::87:0;:53::88:1;33:79:33:80:0;:58::81:1;34:89:34:90:0;:67::91:1;37:45:37:46:0;:35::61:1;:68::70:0;:35::71:1;:::74;38:22:38:23:0;:12::38:1;:42::62:0;:4::118:1;41:35:41:36:0;:25::51:1;42:83:42:84:0;:64::85:1;45:27:45:44:0;;:23::45:1;46:28:46:46:0;:24::47:1;47:28:47:30:0;:12:::1;:34::46:0;:49::51;:34:::1;:4::113;50:22:50:23:0;51:31:51:52;;:27::53:1;52:34:52:58:0;;:30::59:1;54:7:54:23:0;:27::28;:7:::1;:29:56:5:0;55:23:55:43;;:19::44:1;:47::66:0;:19:::1;:69::85:0;;:19:::1;:6::86;;;;;;;54:29:56:5;59:44:59:45:0;:34::52:1;:55::66:0;;:34:::1;60:23:60:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;61:23:61:24:0;:12::39:1;:53::54:0;:43::69:1;:4::127;62:23:62:24:0;:12::41:1;:55::56:0;:45::73:1;:4::133;63:23:63:24:0;:12::31:1;:4::113;66:35:66:60:0;;:31::61:1;67:26:67:68;:71::87:0;:26:::1;68:27:68:39:0;:42::44;:27:::1;69:23:69:47;;:56::71:0;:23::72:1;72::72:24:0;:12::39:1;:53::54:0;:43::69:1;:4::71;73:23:73:24:0;:12::39:1;:4::113;74:23:74:24:0;:12::31:1;:35::39:0;:4::98:1;79:44:79:45:0;:33::60:1;80:7:80:27:0;:31::33;:7:::1;:::102:0;:43::63;:70::72;:43::73:1;:::76;:80::100:0;;:43:::1;;:35::102;;83:12:83:29:0;:33::34;:4::89:1;27:2:84:3;;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 29,
        message: 'Payout contract must always be at input index 0',
      },
      {
        ip: 19,
        line: 38,
        message: 'Invalid claim receipt, should have correct tokenId',
      },
      {
        ip: 34,
        line: 47,
        message: 'Invalid claim receipt, should be from the correct period',
      },
      {
        ip: 71,
        line: 60,
        message: 'Recreate contract at output0 - invalid tokenCategory',
      },
      {
        ip: 76,
        line: 61,
        message: 'Recreate contract at output0 - invalid nftCommitment',
      },
      {
        ip: 81,
        line: 62,
        message: 'Recreate contract at output0 - invalid lockingBytecode',
      },
      {
        ip: 84,
        line: 63,
        message: 'Recreate contract at output0 - invalid BCH amount',
      },
      {
        ip: 102,
        line: 72,
      },
      {
        ip: 105,
        line: 73,
        message: 'Invalid new receipt, should have correct nftCommitment',
      },
      {
        ip: 109,
        line: 74,
        message: 'Invalid tokenoutput - needs to hold exactly 1000 sats',
      },
      {
        ip: 124,
        line: 80,
      },
      {
        ip: 129,
        line: 83,
        message: 'Invalid number of outputs - should have 3 at most',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:05.439Z',
} as const;
