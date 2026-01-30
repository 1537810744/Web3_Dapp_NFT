

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

export function GET(){
    gameState=resetGame(gameState);
    const [playerCards,remainingDeck] = getRandomCards(gameState.deck,2);
    const [dealerCards,newDeck] = getRandomCards(remainingDeck,2);
    gameState.playerHand=playerCards;   
    gameState.dealerHand=dealerCards;
    gameState.deck = newDeck;
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
    const {action} =await request.json();
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

