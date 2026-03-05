 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";

import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract FunctionsConsumerExample is FunctionsClient, ConfirmedOwner , ERC721URIStorage {
  using FunctionsRequest for FunctionsRequest.Request;

  bytes32 public s_lastRequestId;
  bytes public s_lastResponse;
  bytes public s_lastError;
  mapping (bytes32 reqId => address player ) reqIdToPlayer; 
  uint256 tokenId  = 0; 

  uint8 private donHostedSecretsSlotID;
  uint64 private donHostedSecretsVersion;
  uint64 private subscriptionId;

  string constant SOURCE = 
    'if(!secrets.apiKey){throw Error("apiKey not be provided ");}'
    'const externalPlayer = args[0] || "default_player";'
    'const requestConfig = {'
    '  url: "https://chainlinktocusmos-hmdugjbmfkb6czfz.eastasia-01.azurewebsites.net/api/httptrigger1",'
    '  method: "GET", '
    '  headers: {'
    '    "Content-Type": "application/json",'
    '    "player": externalPlayer,'
    '    "apiKey": secrets.apiKey'
    '  }'
    '};'
    'const response = await Functions.makeHttpRequest(requestConfig);'
    'if (response.status !== 200) {'
    '  throw new Error(`request failed:status ${response.status},${JSON.stringify(response.data)}`);'
    '}'
    'const targetPlayer = requestConfig.headers.player || "default_player";'
    'let targetData = null;'
    'if (Array.isArray(response.data)) {'
    '  targetData = response.data.find(item => item.player === targetPlayer);'
    '}'
    'if (!targetData) {'
    '  targetData = { player: targetPlayer, score: 1 };'
    '}'
    
    'return Functions.encodeInt256(targetData.score);';

  uint32 constant GAS_LIMIT = 300_000;
  //fuji
  bytes32 constant DON_ID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;
  string constant META_DATA = "ipfs:QmbEseErg5xQYaJQ2oFyvtm7NF1GKQh9qbT7AFVT3ru1sw";
  address constant ROUTER = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;

  error UnexpectedRequestID(bytes32 requestId);

  event Response(bytes32 indexed requestId, bytes response, bytes err);

  constructor() FunctionsClient(ROUTER) ConfirmedOwner(msg.sender) ERC721("BlackJack", "BJK") {}


  function setDonHostSecretConfig(uint8 _slotID, uint64 _version, uint64 _sub_id) public onlyOwner{
    donHostedSecretsVersion = _version;
    donHostedSecretsSlotID = _slotID;
    subscriptionId = _sub_id;
  }
  /**
   * @notice Send a simple request
   

   * @param args List of arguments accessible from within the source code

   */
function sendRequest(
    string[] memory args,
    address player
) external returns (bytes32 requestId) {
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(SOURCE);

    req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);

    if (args.length > 0) req.setArgs(args);

    s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, GAS_LIMIT, DON_ID);
    reqIdToPlayer[s_lastRequestId] = player;
    return s_lastRequestId;
}


  /**
   * @notice Store latest result/error
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    if (s_lastRequestId != requestId) {
      revert UnexpectedRequestID(requestId);
    }
    s_lastResponse = response;
    s_lastError = err;
    //check if the player's score is greater than 10
    int256 score = abi.decode(response, (int256));
    if(score >= 10){
      //mint a token for player   nft meta data?
    address player = reqIdToPlayer[requestId];
    _safeMint(player,tokenId);
    _setTokenURI(tokenId,META_DATA);
    tokenId++;
    }
    

    emit Response(requestId, s_lastResponse, s_lastError);
  }
}
