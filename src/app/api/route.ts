// src/app/api/test/route.ts
// 导入 Azure Cosmos DB 所需的 SDK
import { CosmosClient } from "@azure/cosmos";
import { verifyMessage } from 'viem';
// 写入函数
export async function write(player: string, score: number) {
  try {
    // 1. Azure Cosmos DB 配置
    const endpoint = "https://yangyuhao.documents.azure.com:443/";
    const key = "FdaA88esezOWNOfH2Yx4UN7HdxgGZf5OEdr591FxJbrZV19CpRbuI4vSY9GPSGimDR3wJ7PVjEX8ACDbLzomyQ==";
    const databaseId = "PlayerScoreDB";
    const containerId = "PlayerScores";

    // 2. 创建 Cosmos DB 客户端
    const client = new CosmosClient({ endpoint, key });

    // 3. 获取数据库和容器
    const database = client.database(databaseId);
    const container = database.container(containerId);

    // 4. 定义要写入的数据：player 和 score
    const playerEntity = {
      id: player, // id 与 player 相同
      player: player,
      score: score,
    };

    // 5. 写入/更新文档（存在则更新，不存在则新增）
    const { resource: createdItem } = await container.items.upsert(playerEntity);

    // 6. 返回成功结果
    return {
      success: true,
      message: `✅ 数据写入成功！player=${player}, score=${score}`,
      data: createdItem,
    };
  } catch (error) {
    // 7. 捕获错误并返回失败结果
    const errorMessage = (error as Error).message;
    return {
      success: false,
      error: `数据写入失败：${errorMessage}`,
    };
  }
}

// 读取函数
export async function read(player: string) {
  try {
    // 1. Azure Cosmos DB 配置
    const endpoint = "https://yangyuhao.documents.azure.com:443/";
    const key = "FdaA88esezOWNOfH2Yx4UN7HdxgGZf5OEdr591FxJbrZV19CpRbuI4vSY9GPSGimDR3wJ7PVjEX8ACDbLzomyQ==";
    const databaseId = "PlayerScoreDB";
    const containerId = "PlayerScores";

    // 2. 创建 Cosmos DB 客户端
    const client = new CosmosClient({ endpoint, key });

    // 3. 获取数据库和容器
    const database = client.database(databaseId);
    const container = database.container(containerId);

    // 4. 查询特定玩家的数据
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @player",
      parameters: [
        {
          name: "@player",
          value: player
        }
      ]
    };

    const { resources: results } = await container.items.query(querySpec).fetchAll();

    if (results.length > 0) {
      // 5. 返回成功结果
      return {
        success: true,
        data: results[0],
      };
    } else {
      return {
        success: false,
        error: "Player not found",
      };
    }
  } catch (error) {
    // 6. 捕获错误并返回失败结果
    const errorMessage = (error as Error).message;
    return {
      success: false,
      error: `数据读取失败：${errorMessage}`,
    };
  }
}

const DEFAULT_PLAYER = "default_player";


//when the game is inited, give player and dealer 2 random cards respectively
export interface Card{
    rank:string,
    suit:string
}

let gameState : {
    playerHand:Card[],
    dealerHand:Card[],
    deck:Card[]
    message:string,
    winner:string
    score:number
}={
    playerHand:[],
    dealerHand:[],
    deck:[],
    message:'',
    winner:'',
    score:0
}

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits = ['♥️', '♦️', '♣️', '♠️'];  
const initialDeck = ranks.map(rank => suits.map(suit => ( {"rank":rank , "suit":suit}))).flat();
gameState.deck = initialDeck;

function getRandomCards(deck:Card[],num:number){
    const randomIndexset = new Set<number>();
    while(randomIndexset.size<num){
        const randomIndex = Math.floor(Math.random()*deck.length);
        if(!randomIndexset.has(randomIndex))
            randomIndexset.add(randomIndex);
    }
    const randomcards=deck.filter((_,index)=>randomIndexset.has(index));
    const remainingDeck=deck.filter((_,index)=>!randomIndexset.has(index));
    return [randomcards,remainingDeck];
}

function resetGame(gameState:{
    playerHand:Card[],
    dealerHand:Card[],
    deck:Card[]
    message:string,
    winner:string
    score:number
}){
    gameState.playerHand=[];
    gameState.dealerHand=[];
    gameState.deck=initialDeck;
    gameState.message='';
    gameState.winner='';
   // gameState.score=gameState.score;//
    return gameState;
}


export async function GET(){
   
    gameState=resetGame(gameState);
    const [playerCards,remainingDeck] = getRandomCards(gameState.deck,2);
    const [dealerCards,newDeck] = getRandomCards(remainingDeck,2);
    gameState.playerHand=playerCards;   
    gameState.dealerHand=dealerCards;
    gameState.deck = newDeck;

    try{
        const data = await read(DEFAULT_PLAYER);
        if(!data.success){
            gameState.score=0;
        }else {
            gameState.score=data.data.score;
        }
    }catch(error){
        console.error("Error reading player data:", error);
        return new Response("Error reading player data from azure sql",{status:500});
    }
    

    return new Response(JSON.stringify(
        {
            playerHand:gameState.playerHand,
            dealerHand:[gameState.dealerHand[0],{rank:"?",suit:"?"} as Card] , //only show one dealer card
            message:gameState.message,
            score:gameState.score,
        }
    ),{
        status:200 
    })
}   


export async function POST(request:Request){
    const reqBody = await request.json();
    const {action} =reqBody;
    if(action==="sign"){
     const {address,signature,message} = reqBody;
     console.log('Verifying signature for signature:', signature);
     const isValid = await verifyMessage({address,message,signature});
     console.log('Verifying signature for address:', address);
     if(isValid){
        return new Response("Message signature is valid",{status:200});
     } else {
        return new Response("Message signature is invalid",{status:400});
     }
    }
    
    //when hit is clicked, give player a random card from the deck, and refresh the deck by removing the given card
    //continue until player clicks stand or busts(equal or over 21)
    //case1:player ==21, win
    //case2:player >21 , lose
    //case3: player <21 , continue
    if(action==="hit"){
        const [randomcards,remainingDeck]=getRandomCards(gameState.deck,1);
        gameState.playerHand.push(randomcards[0]);
        gameState.deck=remainingDeck;
        const playerHandValue = calculateHandValue(gameState.playerHand);
        if(playerHandValue===21){
            gameState.message="Player wins with Blackjack!";
            gameState.winner="player";
            gameState.score+=1;
        } else if(playerHandValue>21){
            gameState.message="Player busts! Dealer wins!";
            gameState.winner="dealer";
            gameState.score-=1;
        }   
    }
        
    //when stand is clicked, continuely give dealer cards until dealer's hand is equal or over 17
    // same as player

    //player<=21 and dealer>21, player win
    //player>dealer, player win
    //else dealer win
    else if(action==="stand"){    
        const [randomcards,remainingDeck]=getRandomCards(gameState.deck,1);
        while(calculateHandValue(gameState.dealerHand)<17){
            gameState.dealerHand.push(randomcards[0]);
            gameState.deck=remainingDeck;
        }
        const dealerHandValue = calculateHandValue(gameState.dealerHand);
        if(dealerHandValue>21){
            gameState.message="Dealer busts! Player wins!";
            gameState.winner="player";
            gameState.score+=1;
        }else if (dealerHandValue===21){
            gameState.message="Dealer wins with Blackjack!";
            gameState.winner="dealer";
            gameState.score-=1;
        } else {
            const playerHandValue = calculateHandValue(gameState.playerHand);
            if(playerHandValue>dealerHandValue){
                gameState.message="Player wins!";
                gameState.winner="player";
                gameState.score+=1;
            } else if (playerHandValue<dealerHandValue){
                gameState.message="Dealer wins!";
                gameState.winner="dealer";
                gameState.score-=1;
            } else {
                gameState.message="It's a tie!";
                gameState.winner="";
                gameState.score+=0;
            }
        }
    }else {
            return new Response("Invaild action",{status:400});
    }

    try {
        await write(DEFAULT_PLAYER,gameState.score);
    } catch (error) {
        console.error("Error writing player data:", error);
        return new Response("Error writing player data to azure sql",{status:500}); 
    }
    return new Response(JSON.stringify(
        {
            playerHand:gameState.playerHand,   
            dealerHand:gameState.message===""? 
            [gameState.dealerHand[0],{rank:"?",suit:"?"} as Card] :gameState.dealerHand , //only show one dealer card if game not ended
            message :gameState.message ,
            winner :gameState.winner,
            score:gameState.score
        }           
        ),{status:200})
}

function calculateHandValue(hand:Card[]){
    let value =0;
    let aceCount=0; 
    hand.forEach(card=>{
        if(card.rank==='A'){
            aceCount+=1;
            value+=11;
        } else if(['K','Q','J'].includes(card.rank)){
            value+=10;
        } else {
            value+=parseInt(card.rank);
        }  } )
    while(value>21 && aceCount>0){
        value-=10;
        aceCount-=1;
    }       
    return value;    

}

