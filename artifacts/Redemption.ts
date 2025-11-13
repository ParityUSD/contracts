export default {
  contractName: 'Redemption',
  constructorInputs: [
    {
      name: 'parityTokenId',
      type: 'bytes32',
    },
  ],
  abi: [
    {
      name: 'finalizeRedemption',
      inputs: [],
    },
    {
      name: 'swapTargetLoan',
      inputs: [],
    },
  ],
  bytecode: 'OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_3 OP_EQUALVERIFY OP_4 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_4 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_5 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_5 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_2 OP_ADD OP_NUMEQUALVERIFY OP_0 OP_UTXOVALUE OP_0 OP_OUTPUTVALUE OP_SUB e803 OP_MAX OP_4 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP 76a914 OP_SWAP OP_CAT 88ac OP_CAT OP_4 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_4 OP_OUTPUTVALUE OP_ROT OP_NUMEQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_5 OP_UTXOTOKENAMOUNT OP_3 OP_OUTPUTTOKENAMOUNT OP_SUB OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_2 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_OVER OP_NUMEQUALVERIFY OP_ELSE OP_TXOUTPUTCOUNT OP_5 OP_GREATERTHAN OP_IF OP_5 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_LESSTHANOREQUAL OP_VERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_6 OP_GREATERTHAN OP_IF OP_6 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_TXOUTPUTCOUNT OP_7 OP_LESSTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_SWAP OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_3 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_6 OP_EQUALVERIFY OP_4 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_4 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_1ADD OP_NUMEQUALVERIFY OP_5 OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_5 OP_OUTPOINTTXHASH OP_3 OP_OUTPOINTTXHASH OP_EQUALVERIFY OP_5 OP_OUTPOINTINDEX OP_3 OP_OUTPOINTINDEX OP_2 OP_ADD OP_NUMEQUALVERIFY OP_6 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_6 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_0 OP_UTXOTOKENCOMMITMENT 14 OP_SPLIT OP_DROP OP_14 OP_SPLIT OP_NIP OP_4 OP_SPLIT OP_BIN2NUM OP_ROT OP_GREATERTHAN OP_VERIFY OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_EQUALVERIFY OP_3 OP_OUTPUTTOKENCATEGORY OP_3 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_3 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_4 OP_OUTPUTBYTECODE OP_4 OP_UTXOBYTECODE OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCATEGORY OP_4 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_4 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_5 OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_5 OP_OUTPUTBYTECODE OP_5 OP_UTXOBYTECODE OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENCATEGORY OP_5 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_5 OP_OUTPUTTOKENAMOUNT OP_5 OP_UTXOTOKENAMOUNT OP_NUMEQUAL OP_ENDIF',
  source: 'pragma cashscript ^0.12.0;\r\n\r\n// Individual redemption contract, processes an ongoing redemption against a target loan\r\n// Always tied to a redemptionStateSidecar and a redemptionTokenSidecar\r\n// Either the redemptions finalizes against the target loan or the redemption target gets swapped for a lower interest loan\r\n// The target loan + redemptionAmount of the redemption is kept in a mutable NFT on the redemption itself\r\n// The payout address (redeemerPkh) and redemptionPrice are stored in the redemptionStateSidecar as an immutable NFT\r\n\r\n/*  --- State redemption Mutable NFT ---\r\n    bytes32 targetLoanTokenId\r\n    bytes6 redemptionAmount (tokens)\r\n*/\r\n\r\n/*  --- State redemptionSidecar Immutable NFT ---\r\n    bytes20 redeemerPkh\r\n    bytes4 redemptionPrice\r\n*/\r\n\r\ncontract Redemption(\r\n    bytes32 parityTokenId\r\n  ) {\r\n      // function finalizeRedemption\r\n      // Completes the redemption against the target loan, redeems ParityUSD tokens for BCH collateral\r\n      // Any redemption still pending when a newer period starts can be cancelled\r\n      // The redemption pays for the transaction fees (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-loanFunction, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, ?06-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-loanFunction, 03-opreturn, 04-payoutRedemption, 05?-tokenChangeOutput, ?06-BchChange\r\n    function finalizeRedemption(){\r\n      // Require redemption to be at inputIndex 3\r\n      require(this.activeInputIndex == 3);\r\n\r\n      // Authenticate Loan at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate redeem loanFunction at inputIndex 2\r\n      require(tx.inputs[2].tokenCategory == parityTokenId);\r\n      require(tx.inputs[2].nftCommitment == 0x03);\r\n\r\n      // Authenticate redemptionStateSidecar at inputIndex 4\r\n      require(tx.inputs[4].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\r\n      require(tx.inputs[4].outpointIndex == tx.inputs[3].outpointIndex + 1);\r\n\r\n      // Authenticate redemptionTokenSidecar at inputIndex 5\r\n      require(tx.inputs[5].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\r\n      require(tx.inputs[5].outpointIndex == tx.inputs[3].outpointIndex + 2);\r\n\r\n      // Specific logic for redemption or cancellation is enforced in the redeem loan function\r\n      // The redeem loan function enforces the final redemption amount to be burned to an opreturn at output index 3\r\n      // The redemption enforces the redemptionPayout and tokenChangeOutput are correct\r\n\r\n      // Calculate new redemption payout amount, clamp to minimum 1000 sats\r\n      // The redeem loan function calculates the new loan collateral, which we can read through introspection\r\n      int redeemedCollateral = tx.inputs[0].value - tx.outputs[0].value;\r\n      int redeemedCollateralClamped = max(redeemedCollateral, 1000);\r\n\r\n      // Read state from redemptionStateSidecar\r\n      bytes20 redeemerPkh = tx.inputs[4].nftCommitment.split(20)[0];\r\n\r\n      // Create redemptionPayout at output index 4\r\n      bytes25 redeemerLockingBytecode = new LockingBytecodeP2PKH(redeemerPkh);\r\n      require(tx.outputs[4].lockingBytecode == redeemerLockingBytecode);\r\n      require(tx.outputs[4].value == redeemedCollateralClamped);\r\n      require(tx.outputs[4].tokenCategory == 0x);\r\n\r\n      // For the effective redemption amount, the output values enforced by the redeem loan function are used\r\n      int originalRedemptionAmount = tx.inputs[5].tokenAmount; \r\n      int effectiveRedemptionAmount = tx.outputs[3].tokenAmount;\r\n      // Check if token change output is needed\r\n      int tokenChangeAmount = originalRedemptionAmount - effectiveRedemptionAmount;\r\n      if(tokenChangeAmount > 0){\r\n        // Create tokenChangeOutput at output index 5\r\n        require(tx.outputs[5].value == 1000);\r\n        require(tx.outputs[5].lockingBytecode == redeemerLockingBytecode);\r\n        require(tx.outputs[5].tokenCategory == parityTokenId);\r\n        require(tx.outputs[5].tokenAmount == tokenChangeAmount);\r\n      } else {\r\n        // If no token change, optionally allow output index 5 for BCH change but prevent holding tokens\r\n        if(tx.outputs.length > 5){\r\n          require(tx.outputs[5].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n        }\r\n        // No seventh output should be present if there is no token change for the redemption\r\n        require(tx.outputs.length <= 6);\r\n      }\r\n\r\n      // Optionally allow output index 6 for BCH change but prevent holding tokens\r\n      if(tx.outputs.length > 6){\r\n        require(tx.outputs[6].tokenCategory == 0x, "Invalid BCH output - should not hold any tokens");\r\n      }\r\n\r\n      // Restrict maximum outputs to 7 total not to recreate redemption outputs\r\n      require(tx.outputs.length <= 7);\r\n    }\r\n      // function swapTargetLoan\r\n      // Swaps the original target loan with a compatible one with a lower interest rate.\r\n      // The redemption can pay for the transaction fees of one redemption-swap (normally no external fee input required).\r\n      //\r\n      // Inputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-feeBch\r\n      // Outputs: 00-loan, 01-loanTokenSidecar, 02-swapOutRedemption, 03-redemption, 04-redemptionStateSidecar, 05-redemptionTokenSidecar, 06-loanLowerInterest, 07-loanTokenSidecar, 08-swapInRedemption, ?09-changeBch\r\n    function swapTargetLoan(){\r\n      // Require redemption to be at inputIndex 3\r\n      require(this.activeInputIndex == 3);\r\n\r\n      // Authenticate Loan at inputIndex 0\r\n      require(tx.inputs[0].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[0].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Authenticate swapOutRedemeption loanFunction at inputIndex 2\r\n      require(tx.inputs[2].tokenCategory == parityTokenId);\r\n      require(tx.inputs[2].nftCommitment == 0x06);\r\n\r\n      // Authenticate redemptionStateSidecar at inputIndex 4\r\n      require(tx.inputs[4].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\r\n      require(tx.inputs[4].outpointIndex == tx.inputs[3].outpointIndex + 1);\r\n\r\n      // Authenticate redemptionTokenSidecar at inputIndex 5\r\n      require(tx.inputs[5].tokenCategory == parityTokenId);\r\n      require(tx.inputs[5].outpointTransactionHash == tx.inputs[3].outpointTransactionHash);\r\n      require(tx.inputs[5].outpointIndex == tx.inputs[3].outpointIndex + 2);\r\n\r\n      // Authenticate Loan at inputIndex 6\r\n      require(tx.inputs[6].tokenCategory == parityTokenId + 0x01);\r\n      require(tx.inputs[6].nftCommitment.split(1)[0] == 0x01);\r\n\r\n      // Parse swappedIn loan state\r\n      bytes swappedInLoanCommitment = tx.inputs[6].nftCommitment;\r\n      bytes6 swappedInLoanCommitmentSlice = swappedInLoanCommitment.slice(14,20);\r\n      bytes4 swappedInlastPeriodInterestPaidBytes, bytes2 swappedInCurrentInterestBytes = swappedInLoanCommitmentSlice.split(4);\r\n      int swappedInCurrentInterest = int(swappedInCurrentInterestBytes);\r\n\r\n      // Parse swappedOut loan state\r\n      bytes swappedOutLoanCommitment = tx.inputs[0].nftCommitment;\r\n      bytes6 swappedOutLoanCommitmentSlice = swappedOutLoanCommitment.slice(14,20);\r\n      bytes4 swappedOutlastPeriodInterestPaidBytes, bytes2 swappedOutCurrentInterestBytes = swappedOutLoanCommitmentSlice.split(4);\r\n      int swappedOutCurrentInterest = int(swappedOutCurrentInterestBytes);\r\n\r\n      // Check swappedOut pays higher interest\r\n      require(swappedInCurrentInterest < swappedOutCurrentInterest);\r\n\r\n      // Check that both loan lastPeriodInterestPaid stats is equal (and thus are in the same period)\r\n      require(swappedInlastPeriodInterestPaidBytes == swappedOutlastPeriodInterestPaidBytes);\r\n\r\n      // Recreate redemption contract at output index 3\r\n      require(tx.outputs[3].lockingBytecode == tx.inputs[3].lockingBytecode);\r\n      require(tx.outputs[3].tokenCategory == tx.inputs[3].tokenCategory);\r\n      require(tx.outputs[3].value == 1000);\r\n      // Logic for updating redemption state is enforced in the swapInRedemption contract function\r\n\r\n      // Replicate state sidecar at output index 4\r\n      require(tx.outputs[4].value == 1000);\r\n      require(tx.outputs[4].lockingBytecode == tx.inputs[4].lockingBytecode);\r\n      require(tx.outputs[4].tokenCategory == tx.inputs[4].tokenCategory);\r\n      require(tx.outputs[4].nftCommitment == tx.inputs[4].nftCommitment);\r\n\r\n      // Replicate tokensidecar at output index 5\r\n      require(tx.outputs[5].value == 1000);\r\n      require(tx.outputs[5].lockingBytecode == tx.inputs[5].lockingBytecode);\r\n      require(tx.outputs[5].tokenCategory == tx.inputs[5].tokenCategory);\r\n      require(tx.outputs[5].tokenAmount == tx.inputs[5].tokenAmount);\r\n\r\n      // Logic for updating loan state is enforced in the loan contract function\r\n    }\r\n}',
  debug: {
    bytecode: '78009c63c0539d00ce78517e8800cf517f75518852ce788852cf538854c853c88854c953c98b9d55c853c88855c953c952939d00c600cc9402e803a454cf01147f750376a9147c7e0288ac7e54cd788854cc7b9d54d1008855d053d3947600a06355cc02e8039d55cd52798855d153798855d3789d67c455a06355d1008868c456a16968c456a06356d1008868c457a1696d6d51677c519dc0539d00ce78517e8800cf517f75518852ce788852cf568854c853c88854c953c98b9d55ce788855c853c88855c953c952939d56ce7c517e8856cf517f75518856cf01147f755e7f77547f8100cf01147f755e7f77547f817ba0698853cd53c78853d153ce8853cc02e8039d54cc02e8039d54cd54c78854d154ce8854d254cf8855cc02e8039d55cd55c78855d155ce8855d355d09c68',
    sourceMap: '29:4:94:5;;;;31:14:31:35;:39::40;:6::42:1;34:24:34:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;35:24:35:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;38:24:38:25:0;:14::40:1;:44::57:0;:6::59:1;39:24:39:25:0;:14::40:1;:44::48:0;:6::50:1;42:24:42:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;43:24:43:25:0;:14::40:1;:54::55:0;:44::70:1;:::74;:6::76;46:24:46:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;47:24:47:25:0;:14::40:1;:54::55:0;:44::70:1;:73::74:0;:44:::1;:6::76;55:41:55:42:0;:31::49:1;:63::64:0;:52::71:1;:31;56:62:56:66:0;:38::67:1;59::59:39:0;:28::54:1;:61::63:0;:28::64:1;:::67;62:40:62:77:0;:65::76;:40::77:1;;;63:25:63:26:0;:14::43:1;:47::70:0;:6::72:1;64:25:64:26:0;:14::33:1;:37::62:0;:6::64:1;65:25:65:26:0;:14::41:1;:45::47:0;:6::49:1;68:47:68:48:0;:37::61:1;69:49:69:50:0;:38::63:1;71:30:71:82;72:9:72:26:0;:29::30;:9:::1;:31:78:7:0;74:27:74:28;:16::35:1;:39::43:0;:8::45:1;75:27:75:28:0;:16::45:1;:49::72:0;;:8::74:1;76:27:76:28:0;:16::43:1;:47::60:0;;:8::62:1;77:27:77:28:0;:16::41:1;:45::62:0;:8::64:1;78:13:85:7:0;80:11:80:28;:31::32;:11:::1;:33:82:9:0;81:29:81:30;:18::45:1;:49::51:0;:10::104:1;80:33:82:9;84:16:84:33:0;:37::38;:16:::1;:8::40;78:13:85:7;88:9:88:26:0;:29::30;:9:::1;:31:90:7:0;89:27:89:28;:16::43:1;:47::49:0;:8::102:1;88:31:90:7;93:14:93:31:0;:35::36;:14:::1;:6::38;29:4:94:5;;;;101::163::0;;;103:14:103:35;:39::40;:6::42:1;106:24:106:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;107:24:107:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;110:24:110:25:0;:14::40:1;:44::57:0;:6::59:1;111:24:111:25:0;:14::40:1;:44::48:0;:6::50:1;114:24:114:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;115:24:115:25:0;:14::40:1;:54::55:0;:44::70:1;:::74;:6::76;118:24:118:25:0;:14::40:1;:44::57:0;:6::59:1;119:24:119:25:0;:14::50:1;:64::65:0;:54::90:1;:6::92;120:24:120:25:0;:14::40:1;:54::55:0;:44::70:1;:73::74:0;:44:::1;:6::76;123:24:123:25:0;:14::40:1;:44::57:0;:60::64;:44:::1;:6::66;124:24:124:25:0;:14::40:1;:47::48:0;:14::49:1;:::52;:56::60:0;:6::62:1;127:48:127:49:0;:38::64:1;128:77:128:79:0;:44::80:1;;:74::76:0;:44::80:1;;129:125:129:126:0;:90::127:1;130:37:130:71;133:49:133:50:0;:39::65:1;134:79:134:81:0;:45::82:1;;:76::78:0;:45::82:1;;135:128:135:129:0;:92::130:1;136:38:136:73;139:14:139:38:0;:::66:1;:6::68;142::142:93;145:25:145:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;146:25:146:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;147:25:147:26:0;:14::33:1;:37::41:0;:6::43:1;151:25:151:26:0;:14::33:1;:37::41:0;:6::43:1;152:25:152:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;153:25:153:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;154:25:154:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;157:25:157:26:0;:14::33:1;:37::41:0;:6::43:1;158:25:158:26:0;:14::43:1;:57::58:0;:47::75:1;:6::77;159:25:159:26:0;:14::41:1;:55::56:0;:45::71:1;:6::73;160:25:160:26:0;:14::39:1;:53::54:0;:43::67:1;:6::69;19:0:164:1',
    logs: [],
    requires: [
      {
        ip: 7,
        line: 31,
      },
      {
        ip: 13,
        line: 34,
      },
      {
        ip: 20,
        line: 35,
      },
      {
        ip: 24,
        line: 38,
      },
      {
        ip: 28,
        line: 39,
      },
      {
        ip: 33,
        line: 42,
      },
      {
        ip: 39,
        line: 43,
      },
      {
        ip: 44,
        line: 46,
      },
      {
        ip: 51,
        line: 47,
      },
      {
        ip: 72,
        line: 63,
      },
      {
        ip: 76,
        line: 64,
      },
      {
        ip: 80,
        line: 65,
      },
      {
        ip: 93,
        line: 74,
      },
      {
        ip: 98,
        line: 75,
      },
      {
        ip: 103,
        line: 76,
      },
      {
        ip: 107,
        line: 77,
      },
      {
        ip: 116,
        line: 81,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 121,
        line: 84,
      },
      {
        ip: 130,
        line: 89,
        message: 'Invalid BCH output - should not hold any tokens',
      },
      {
        ip: 135,
        line: 93,
      },
      {
        ip: 145,
        line: 103,
      },
      {
        ip: 151,
        line: 106,
      },
      {
        ip: 158,
        line: 107,
      },
      {
        ip: 162,
        line: 110,
      },
      {
        ip: 166,
        line: 111,
      },
      {
        ip: 171,
        line: 114,
      },
      {
        ip: 177,
        line: 115,
      },
      {
        ip: 181,
        line: 118,
      },
      {
        ip: 186,
        line: 119,
      },
      {
        ip: 193,
        line: 120,
      },
      {
        ip: 199,
        line: 123,
      },
      {
        ip: 206,
        line: 124,
      },
      {
        ip: 231,
        line: 139,
      },
      {
        ip: 232,
        line: 142,
      },
      {
        ip: 237,
        line: 145,
      },
      {
        ip: 242,
        line: 146,
      },
      {
        ip: 246,
        line: 147,
      },
      {
        ip: 250,
        line: 151,
      },
      {
        ip: 255,
        line: 152,
      },
      {
        ip: 260,
        line: 153,
      },
      {
        ip: 265,
        line: 154,
      },
      {
        ip: 269,
        line: 157,
      },
      {
        ip: 274,
        line: 158,
      },
      {
        ip: 279,
        line: 159,
      },
      {
        ip: 285,
        line: 160,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.12.0',
  },
  updatedAt: '2025-11-10T07:34:10.555Z',
} as const;
