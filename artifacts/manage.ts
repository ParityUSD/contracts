export default {
  contractName: 'manageLoan',
  constructorInputs: [],
  abi: [
    {
      name: 'manage',
      inputs: [
        {
          name: 'repayAmount',
          type: 'int',
        },
        {
          name: 'interestManagerConfiguration',
          type: 'bytes5',
        },
      ],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP 00 OP_EQUALVERIFY OP_1 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_7 OP_SPLIT OP_SWAP OP_1 OP_SPLIT OP_SWAP OP_1 OP_EQUALVERIFY OP_OVER OP_6 OP_SPLIT OP_DROP OP_SWAP OP_BIN2NUM OP_SWAP OP_BIN2NUM OP_2DUP OP_SUB OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_6 OP_PICK OP_2 OP_PICK OP_NUMEQUAL OP_SWAP OP_7 OP_PICK 1027 OP_GREATERTHANOREQUAL OP_BOOLOR OP_OVER OP_BOOLOR OP_VERIFY OP_6 OP_PICK OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_7 OP_PICK OP_SIZE OP_NIP OP_5 OP_NUMEQUALVERIFY OP_1 OP_ROT OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_BOOLAND OP_DUP OP_NOTIF OP_3 OP_ROT OP_DROP OP_SWAP OP_4 OP_PICK OP_8 OP_PICK OP_SUB OP_DUP 1027 OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_DUP OP_10 OP_MUL OP_11 OP_DIV OP_DUP OP_6 OP_PICK OP_MUL 00e1f505 OP_DIV OP_3 OP_PICK OP_OVER OP_LESSTHANOREQUAL OP_VERIFY OP_7 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_1 OP_UTXOVALUE OP_3 OP_PICK OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ENDIF OP_9 OP_PICK OP_15 OP_SPLIT OP_DROP OP_1 OP_5 OP_PICK OP_6 OP_NUM2BIN OP_CAT OP_OVER OP_CAT OP_14 OP_PICK OP_CAT OP_1 OP_OUTPUTBYTECODE OP_1 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_1 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE OP_4 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_ENDIF OP_OVER OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_OVER OP_OUTPUTTOKENCOMMITMENT OP_3 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_OVER OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_OVER OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_SWAP OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_6 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_5 OP_OVER OP_IF OP_DROP OP_2 OP_ENDIF OP_DUP OP_OUTPUTTOKENCATEGORY OP_7 OP_PICK OP_EQUALVERIFY OP_DUP OP_OUTPUTTOKENAMOUNT OP_8 OP_PICK OP_NUMEQUALVERIFY OP_DUP OP_OUTPUTBYTECODE 6a OP_0 OP_SIZE OP_SWAP OP_CAT OP_CAT OP_EQUALVERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Manage loan contract function\r\n// Is used to repay debt, add collateral, remove collateral, and change the loan\'s interestManagerConfiguration\r\n\r\n/*  --- State Immutable NFT ---\r\n    byte identifier == 0x02\r\n*/\r\n\r\n// for partial repayments:\r\n// minimumDebt = 100.00 ParityUSD\r\n// minimumRepay = 100.00 ParityUSD\r\n\r\n// Note: This function can only withdraw collateral if there are no ongoing redemptions against the loan\r\n\r\ncontract manageLoan(\r\n  ) {\r\n      // function manage\r\n      // Allows loankey holder to repay tokens, add collateral, remove collateral, and change the interestManagerConfiguration.\r\n      //\r\n      // Inputs: 00-pricecontract, 01-loan, 02-loanTokenSidecar, 03-manageLoan, 04-loanKey, 05-userBch, ?06-repayTokens\r\n      // Outputs: 00-pricecontract, 01-loan, 02-loanTokenSidecar, 03-manageLoan, 04-loanKey, ?05-opreturn, ??-changeTokens, ??-changeBch\r\n      //      or: 00-pricecontract, 01-manageLoan, 02-opreturn, ??-changeTokens, ??-changeBch\r\n\r\n    function manage(\r\n      int repayAmount,\r\n      // Note: the bytes length of function arguments are not automatically enforced\r\n      bytes5 interestManagerConfiguration\r\n    ){\r\n      // Require function to be at inputIndex 3\r\n      require(this.activeInputIndex == 3);\r\n\r\n      // Authenticate PriceContract at inputIndex 0\r\n      bytes parityTokenId = tx.inputs[this.activeInputIndex].tokenCategory;\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x00);\r\n\r\n      // Authenticate Loan at inputIndex 1, nftCommitment checked later\r\n      require(tx.inputs[1].tokenCategory == parityTokenId + 0x01);\r\n\r\n      // Check loanTokenId from tokensidecar at inputIndex2\r\n      bytes loanTokenId = tx.inputs[2].tokenCategory;\r\n\r\n      // Check loanTokenId provided at inputIndex4 to be the loanKey\r\n      require(tx.inputs[4].tokenCategory == loanTokenId + 0x02);\r\n\r\n      // Parse loan state\r\n      bytes loanState = tx.inputs[1].nftCommitment;\r\n      bytes7 firstPartLoanState, bytes remainingPartLoanState = loanState.split(7);\r\n      byte identifier, bytes6 borrowedAmountBytes = firstPartLoanState.split(1);\r\n      require(identifier == 0x01);\r\n      bytes6 amountBeingRedeemedBytes = remainingPartLoanState.split(6)[0];\r\n\r\n      // Calculate outstandingBorrowAmount because only the debt not being redeemed against can be repaid\r\n      int borrowedAmount = int(borrowedAmountBytes);\r\n      int amountBeingRedeemed = int(amountBeingRedeemedBytes);\r\n      int outstandingBorrowAmount = borrowedAmount - amountBeingRedeemed;\r\n      bool noRepayment = repayAmount == 0;\r\n      bool isFullRepayment = repayAmount == outstandingBorrowAmount;\r\n      // Check range repayAmount if non-zero: minimum treshold OR full isFullRepayment (if less than minimum)\r\n      require(noRepayment || repayAmount >= 100_00 || isFullRepayment, "RepayAmount loan needs to be in valid range");\r\n      // RepayAmount should not exceed outstandingBorrowAmount\r\n      require(repayAmount <= outstandingBorrowAmount);\r\n\r\n      // Read latest price from PriceContract contract\r\n      bytes4 oraclePriceBytes = tx.inputs[0].nftCommitment.slice(5,9);\r\n      int oraclePrice = int(oraclePriceBytes);\r\n\r\n      // Validate input interestManagerConfiguration\r\n      require(interestManagerConfiguration.length == 5);\r\n\r\n      // Assign index for the function nft output\r\n      int functionNftOutputIndex = 1;\r\n\r\n      // Loan can only be closed on full repayment AND no pending redemptions\r\n      bool closeLoan = isFullRepayment && amountBeingRedeemed == 0;\r\n\r\n      // Check whether to recreate the loan contract\r\n      if(!closeLoan){\r\n        // If the loan is not closed, the loan contract has to be recreated at output index 1\r\n        // The ManageLoan function contract is then re-created at output index 3\r\n        functionNftOutputIndex = 3;\r\n\r\n        // Check newBorrowAmount is greater than minimumDebt\r\n        int newBorrowAmount = borrowedAmount - repayAmount;\r\n        require(newBorrowAmount >= 100_00, "Invalid newBorrowAmount, needs to greater than minimumDebt");\r\n\r\n        // Calculate minimum collateral\r\n        int newCollateral = tx.outputs[1].value;\r\n        // Collateral has to be 10% greater than maxBorrowBase\r\n        int maxBorrowBase = ((newCollateral * 10) / 11);\r\n        int maxBorrow = maxBorrowBase * oraclePrice / 100_000_000;\r\n        require(newBorrowAmount <= maxBorrow, "Invalid newBorrowAmount, collateral ratio would get too low");\r\n\r\n        // If redemptions are ongoing, collateral cannot be withdrawn\r\n        if(amountBeingRedeemed > 0){\r\n          int collateral = tx.inputs[1].value;\r\n          require(newCollateral >= collateral, "Cannot withdraw collateral during redemptions");\r\n        }\r\n\r\n        // Update BorrowAmount & interestManagerConfiguration\r\n        bytes15 fixedPartLoanState = remainingPartLoanState.split(15)[0];\r\n        bytes27 newLoanCommitment = 0x01 + bytes6(newBorrowAmount) + fixedPartLoanState + interestManagerConfiguration;\r\n        \r\n        // Recreate loan contract with new state\r\n        require(tx.outputs[1].lockingBytecode == tx.inputs[1].lockingBytecode, "Recreate loan contract - invalid lockingBytecode");\r\n        require(tx.outputs[1].tokenCategory == tx.inputs[1].tokenCategory, "Recreate loan contract - invalid tokenCategory");\r\n        require(tx.outputs[1].nftCommitment == newLoanCommitment, "Invalid state loan contract - wrong nftCommitment");\r\n        require(tx.outputs[1].tokenAmount == 0, "Recreate loan contract - should have zero token amount");\r\n\r\n        // Recreate loanKey to user\r\n        require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode, "Recreate loanKey - invalid lockingBytecode");\r\n        require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory, "Recreate loanKey - invalid tokenCategory");\r\n        require(tx.outputs[4].nftCommitment == tx.inputs[4].nftCommitment, "Recreate loanKey - invalid nftCommitment");\r\n        require(tx.outputs[4].value == tx.inputs[4].value, "Recreate loanKey - invalid value");\r\n      }\r\n\r\n      // Recreate ManageLoan functionContract at output at index 1 or 3\r\n      require(tx.outputs[functionNftOutputIndex].lockingBytecode == tx.inputs[3].lockingBytecode);\r\n      require(tx.outputs[functionNftOutputIndex].nftCommitment == tx.inputs[3].nftCommitment);\r\n      require(tx.outputs[functionNftOutputIndex].tokenCategory == tx.inputs[3].tokenCategory);\r\n      require(tx.outputs[functionNftOutputIndex].value == 1000);\r\n      require(tx.outputs[functionNftOutputIndex].tokenAmount == 0);\r\n\r\n      if(repayAmount > 0){\r\n        // Burn repaid ParityUSD by sending to unspendable opreturn output at index 5\r\n        int opreturnOutputIndex = 5;\r\n        // If the loan is closed, the opreturn output is at index 2\r\n        if(closeLoan) opreturnOutputIndex = 2;\r\n        require(tx.outputs[opreturnOutputIndex].tokenCategory == parityTokenId);\r\n        require(tx.outputs[opreturnOutputIndex].tokenAmount == repayAmount);\r\n        require(tx.outputs[opreturnOutputIndex].lockingBytecode == new LockingBytecodeNullData([0x]));\r\n      }\r\n    }\r\n}',
  debug: {
    bytecode: 'c0539dc0ce00ce78517e8800cf517f7501008851ce78517e8852ce54ce7c527e8851cf577f7c517f7c518878567f757c817c816e945579009c567952799c7c5779021027a29b789b6956797ba16900cf597f75557f778157798277559d517b5379009c9a7664537b757c547958799476021027a26951cc765a955b96765679950400e1f50596537978a169577900a06351c6537978a269756859795f7f7551557956807e787e5e797e51cd51c78851d151ce8851d2788851d3009d54cd54c78854d154ce8854d254cf8854cc54c69d6d6d6d6878cd53c78878d253cf8878d153ce8878cc02e8039d7cd3009d567900a06355786375526876d157798876d358799d76cd016a00827c7e7e8875686d6d6d6d51',
    sourceMap: '31:14:31:35;:39::40;:6::42:1;34:38:34:59:0;:28::74:1;35:24:35:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;36:24:36:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;39:24:39:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;42:36:42:37:0;:26::52:1;45:24:45:25:0;:14::40:1;:44::55:0;:58::62;:44:::1;:6::64;48:34:48:35:0;:24::50:1;49:80:49:81:0;:64::82:1;50:52:50:70:0;:77::78;:52::79:1;51:14:51:24:0;:28::32;:6::34:1;52:40:52:62:0;:69::70;:40::71:1;:::74;55:31:55:50:0;:27::51:1;56:36:56:60:0;:32::61:1;57:36:57:72:0;::::1;58:25:58:36:0;;:40::41;:25:::1;59:29:59:40:0;;:44::67;;:29:::1;61:14:61:25:0;:29::40;;:44::50;:29:::1;:14;:54::69:0;:14:::1;:6::118;63:14:63:25:0;;:29::52;:14:::1;:6::54;66:42:66:43:0;:32::58:1;:67::68:0;:32::69:1;;:65::66:0;:32::69:1;;67:24:67:45;70:14:70:42:0;;:::49:1;;:53::54:0;:6::56:1;73:35:73:36:0;76:23:76:38;:42::61;;:65::66;:42:::1;:23;79:10:79:19:0;:9:116:7;82:33:82:34;:8::35:1;;;85:30:85:44:0;;:47::58;;:30:::1;86:16:86:31:0;:35::41;:16:::1;:8::105;89:39:89:40:0;:28::47:1;91:30:91:43:0;:46::48;:30:::1;:52::54:0;:29:::1;92:24:92:37:0;:40::51;;:24:::1;:54::65:0;:24:::1;93:16:93:31:0;;:35::44;:16:::1;:8::109;96:11:96:30:0;;:33::34;:11:::1;:35:99:9:0;97:37:97:38;:27::45:1;98:18:98:31:0;;:35::45;:18:::1;:10::96;96:35:99:9;;102:37:102:59:0;;:66::68;:37::69:1;:::72;103:36:103:40:0;:50::65;;:43::66:1;;:36;:69::87:0;:36:::1;:90::118:0;;:36:::1;106:27:106:28:0;:16::45:1;:59::60:0;:49::77:1;:8::131;107:27:107:28:0;:16::43:1;:57::58:0;:47::73:1;:8::125;108:27:108:28:0;:16::43:1;:47::64:0;:8::119:1;109:27:109:28:0;:16::41:1;:45::46:0;:8::106:1;112:27:112:28:0;:16::45:1;:59::60:0;:49::77:1;:8::125;113:27:113:28:0;:16::43:1;:57::58:0;:47::73:1;:8::119;114:27:114:28:0;:16::43:1;:57::58:0;:47::73:1;:8::119;115:27:115:28:0;:16::35:1;:49::50:0;:39::57:1;:8::95;79:20:116:7;;;;119:25:119:47:0;:14::64:1;:78::79:0;:68::96:1;:6::98;120:25:120:47:0;:14::62:1;:76::77:0;:66::92:1;:6::94;121:25:121:47:0;:14::62:1;:76::77:0;:66::92:1;:6::94;122:25:122:47:0;:14::54:1;:58::62:0;:6::64:1;123:25:123:47:0;:14::60:1;:64::65:0;:6::67:1;125:9:125:20:0;;:23::24;:9:::1;:25:133:7:0;127:34:127:35;129:11:129:20;:22::46;::::1;;;130:27:130::0;:16::61:1;:65::78:0;;:8::80:1;131:27:131:46:0;:16::59:1;:63::74:0;;:8::76:1;132:27:132:46:0;:16::63:1;:67::100:0;:96::98;::::1;;;;:8::102;125:25:133:7;;25:4:134:5;;;;',
    logs: [],
    requires: [
      {
        ip: 2,
        line: 31,
      },
      {
        ip: 10,
        line: 35,
      },
      {
        ip: 17,
        line: 36,
      },
      {
        ip: 23,
        line: 39,
      },
      {
        ip: 31,
        line: 45,
      },
      {
        ip: 41,
        line: 51,
      },
      {
        ip: 69,
        line: 61,
        message: 'RepayAmount loan needs to be in valid range',
      },
      {
        ip: 74,
        line: 63,
      },
      {
        ip: 89,
        line: 70,
      },
      {
        ip: 111,
        line: 86,
        message: 'Invalid newBorrowAmount, needs to greater than minimumDebt',
      },
      {
        ip: 129,
        line: 93,
        message: 'Invalid newBorrowAmount, collateral ratio would get too low',
      },
      {
        ip: 141,
        line: 98,
        message: 'Cannot withdraw collateral during redemptions',
      },
      {
        ip: 164,
        line: 106,
        message: 'Recreate loan contract - invalid lockingBytecode',
      },
      {
        ip: 169,
        line: 107,
        message: 'Recreate loan contract - invalid tokenCategory',
      },
      {
        ip: 173,
        line: 108,
        message: 'Invalid state loan contract - wrong nftCommitment',
      },
      {
        ip: 177,
        line: 109,
        message: 'Recreate loan contract - should have zero token amount',
      },
      {
        ip: 182,
        line: 112,
        message: 'Recreate loanKey - invalid lockingBytecode',
      },
      {
        ip: 187,
        line: 113,
        message: 'Recreate loanKey - invalid tokenCategory',
      },
      {
        ip: 192,
        line: 114,
        message: 'Recreate loanKey - invalid nftCommitment',
      },
      {
        ip: 197,
        line: 115,
        message: 'Recreate loanKey - invalid value',
      },
      {
        ip: 206,
        line: 119,
      },
      {
        ip: 211,
        line: 120,
      },
      {
        ip: 216,
        line: 121,
      },
      {
        ip: 220,
        line: 122,
      },
      {
        ip: 224,
        line: 123,
      },
      {
        ip: 240,
        line: 130,
      },
      {
        ip: 245,
        line: 131,
      },
      {
        ip: 254,
        line: 132,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:01.563Z',
} as const;
