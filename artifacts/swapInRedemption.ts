export default {
  contractName: 'swapInRedemption',
  constructorInputs: [
    {
      name: 'redemptionTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'swapInRedemption',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_8 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_6 OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_ROT OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_OVER OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_SWAP OP_6 OP_SPLIT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_ROT OP_BIN2NUM OP_ROT OP_BIN2NUM OP_SWAP OP_OVER OP_SUB OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_5 OP_UTXOTOKENAMOUNT OP_SWAP OP_MIN OP_SWAP OP_OVER OP_ADD OP_7 OP_UTXOTOKENCATEGORY OP_ROT OP_6 OP_NUM2BIN OP_CAT OP_3 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_ROT OP_SWAP OP_6 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_6 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_6 OP_OUTPUTBYTECODE OP_6 OP_UTXOBYTECODE OP_EQUALVERIFY OP_6 OP_OUTPUTVALUE OP_6 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_6 OP_OUTPUTTOKENCATEGORY OP_6 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_6 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_8 OP_OUTPUTBYTECODE OP_8 OP_UTXOBYTECODE OP_EQUALVERIFY OP_8 OP_OUTPUTTOKENCOMMITMENT OP_8 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_8 OP_OUTPUTTOKENCATEGORY OP_8 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_8 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_8 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// SwapInRedemption loan contract function\r\n// Is used by an existing redemption, to change target of the redemption to be a lower interest loan than the original target loan\r\n// This function is attached to the lower interest loan that is being swapped in\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x05\r\n*/\r\n\r\n// Note: swapInRedemption can only be performed against loans with status "0x02" (mature loan)\r\n\r\ncontract swapInRedemption(\r\n  bytes32 redemptionTokenId\r\n  ) {\r\n      // function swapInRedemption\r\n      // Swaps in a lower interest paying loan as target loan for an active redemption\r\n      // The redemption can pay for the transaction fees of one redemption-swap (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-changeBch\r\n\r\n    function swapInRedemption(){\r\n      // Require function to be at inputIndex 8\r\n      require(this.activeInputIndex == 8);\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n\r\n      // Authenticate Loan at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate swapOutRedemption at inputIndex 2\r\n      require(tx.inputs[2].tokenCategory == parityTokenId);\r\n      require(tx.inputs[2].nftCommitment == 0x06);\r\n\r\n      // Authenticate redemption\r\n      require(tx.inputs[3].tokenCategory == redemptionTokenId + 0x01);\r\n\r\n      // Authenticate lower interest Loan at inputIndex 6, nftCommitment checked below\r\n      require(tx.inputs[6].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Parse loan state\r\n      bytes loanState = tx.inputs[6].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemedBytes, bytes lastPartLoanState = remainingPartLoanState.split(6);\r\n      byte loanStatus = lastPartLoanState.split(1)[0];\r\n\r\n      // This prevents new loans from being created just to swap targets of existing redemptions\r\n      require(loanStatus == 0x02, "swapInRedemption can only be performed against mature loans");\r\n\r\n      // Calculate outstanding debt available for redemptions\r\n      int borrowedAmount = int(borrowedAmountBytes);\r\n      int amountBeingRedeemed = int(amountBeingRedeemedBytes);\r\n      int outstandingBorrowAmount = borrowedAmount - amountBeingRedeemed;\r\n      // Check that swapIn loan is not fully being redeemed already\r\n      // Implicitly also checks that loan debt is non-zero\r\n      require(outstandingBorrowAmount > 0);\r\n\r\n      // Read original redemption amount from sidecar (not from state which is the current amount being redeemed)\r\n      int originalRedemptionAmount = tx.inputs[5].tokenAmount;\r\n      // New redemption amount should be the either originalRedemptionAmount or the maximum amount that can be still be redeemed\r\n      int newRedemptionAmount = min(originalRedemptionAmount, outstandingBorrowAmount);\r\n      int newAmountBeingRedeemed = amountBeingRedeemed + newRedemptionAmount;\r\n\r\n\r\n      // Update mutable redemption state at output index 3\r\n      // Read swappedIn tokenId from loansidecar at inputIndex 7\r\n      bytes swapedInLoanTokenId = tx.inputs[7].tokenCategory;\r\n      bytes6 newRedemptionAmountBytes = bytes6(newRedemptionAmount);\r\n      // Semantic typecast of \'swapedInLoanTokenId\' so the concatenated result is bytes38\r\n      bytes38 newRedemptionState = bytes32(swapedInLoanTokenId) + newRedemptionAmountBytes;\r\n      require(tx.outputs[3].nftCommitment == newRedemptionState);\r\n      // Logic for recreation of redemption contract is enforced in the redemption contract\r\n\r\n      // Construct new loan state\r\n      bytes27 newLoanState = firstPartLoanState + bytes6(newAmountBeingRedeemed) + bytes14(lastPartLoanState);\r\n\r\n      // Recreate loan contract with new state at output index 6\r\n      require(tx.outputs[6].nftCommitment == newLoanState, "Invalid state loan contract - wrong nftCommitment");\r\n      require(tx.outputs[6].lockingBytecode == tx.inputs[6].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\r\n      require(tx.outputs[6].value == tx.inputs[6].value, "Recreate loan contract with same BCH amount");\r\n      require(tx.outputs[6].tokenCategory == tx.inputs[6].tokenCategory, "Recreate loan contract - invalid tokenCategory");\r\n      require(tx.outputs[6].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\r\n\r\n      // Recreate functionContract at output index 8\r\n      require(tx.outputs[8].lockingBytecode == tx.inputs[8].lockingBytecode);\r\n      require(tx.outputs[8].nftCommitment == tx.inputs[8].nftCommitment);\r\n      require(tx.outputs[8].tokenCategory == tx.inputs[8].tokenCategory);\r\n      require(tx.outputs[8].value == 1000);\r\n      require(tx.outputs[8].tokenAmount == 0);\r\n    }\r\n}',
  debug: {
    bytecode: 'c0589dc0ce00ce78517e8800cf517f75518852ce788852cf568853ce7b517e8856ce7c517e8856cf577f78517f7c51887c567f76517f7552887b817b817c78947600a06955d07ca37c789357ce7b56807e53d2887b7c56807e7c7e56d28856cd56c78856cc56c69d56d156ce8856d3009d58cd58c78858d258cf8858d158ce8858cc02e8039d58d3009c',
    sourceMap: '25:14:25:35;:39::40;:6::42:1;26:38:26:59:0;:28::74:1;29:24:29:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;30:24:30:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;33:24:33:25:0;:14::40:1;:44::57:0;:6::59:1;34:24:34:25:0;:14::40:1;:44::48:0;:6::50:1;37:24:37:25:0;:14::40:1;:44::61:0;:64::68;:44:::1;:6::70;40:24:40:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;43:34:43:35:0;:24::50:1;44:80:44:81:0;:64::82:1;45:52:45:70:0;:77::78;:52::79:1;46:14:46:24:0;:28::32;:6::34:1;47:65:47:87:0;:94::95;:65::96:1;48:24:48:41:0;:48::49;:24::50:1;:::53;51:28:51:32:0;:6::97:1;54:31:54:50:0;:27::51:1;55:36:55:60:0;:32::61:1;56:36:56:50:0;:53::72;:36:::1;59:14:59:37:0;:40::41;:14:::1;:6::43;62:47:62:48:0;:37::61:1;64:62:64:85:0;:32::86:1;65:35:65:54:0;:57::76;:35:::1;70:44:70:45:0;:34::60:1;71:47:71:66:0;:40::67:1;;73:35:73:90;74:25:74:26:0;:14::41:1;:6::65;78:29:78:47:0;:57::79;:50::80:1;;:29;:91::108:0;:29::109:1;81:25:81:26:0;:14::41:1;:6::112;82:25:82:26:0;:14::43:1;:57::58:0;:47::75:1;:6::129;83:25:83:26:0;:14::33:1;:47::48:0;:37::55:1;:6::104;84:25:84:26:0;:14::41:1;:55::56:0;:45::71:1;:6::123;85:25:85:26:0;:14::39:1;:43::44:0;:6::104:1;88:25:88:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;89:25:89:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;90:25:90:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;91:25:91:26:0;:14::33:1;:37::41:0;:6::43:1;92:25:92:26:0;:14::39:1;:43::44:0;:6::46:1',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 25,
      },
      {
        ip: 11,
        line: 29,
      },
      {
        ip: 18,
        line: 30,
      },
      {
        ip: 22,
        line: 33,
      },
      {
        ip: 26,
        line: 34,
      },
      {
        ip: 32,
        line: 37,
      },
      {
        ip: 38,
        line: 40,
      },
      {
        ip: 48,
        line: 46,
      },
      {
        ip: 57,
        line: 51,
        message: 'swapInRedemption can only be performed against mature loans',
      },
      {
        ip: 68,
        line: 59,
      },
      {
        ip: 84,
        line: 74,
      },
      {
        ip: 94,
        line: 81,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 99,
        line: 82,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 104,
        line: 83,
        message: 'Recreate loan contract with same BCH amount',
      },
      {
        ip: 109,
        line: 84,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 113,
        line: 85,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 118,
        line: 88,
      },
      {
        ip: 123,
        line: 89,
      },
      {
        ip: 128,
        line: 90,
      },
      {
        ip: 132,
        line: 91,
      },
      {
        ip: 137,
        line: 92,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:03.842Z',
} as const;
