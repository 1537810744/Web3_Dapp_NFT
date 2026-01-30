

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
}={
    playerHand:[],
    dealerHand:[],
    deck:[],
    message:''
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
}){
    gameState.playerHand=[];
    gameState.dealerHand=[];
    gameState.deck=initialDeck;
    gameState.message='';
    return gameState;
}

export function GET(){
    gameState=resetGame(gameState);
    const [playerCards,remainingDeck] = getRandomCards(gameState.deck,2);
    const [dealerCards,newDeck] = getRandomCards(remainingDeck,2);
    gameState.playerHand=playerCards;   
    gameState.dealerHand=dealerCards;
    gameState.deck = newDeck;
    gameState.message='';
    return new Response(JSON.stringify(
        {
            playerHand:gameState.playerHand,
            dealerHand:[gameState.dealerHand[0],{rank:"?",suit:"?"} as Card] , //only show one dealer card
            message:gameState.message
        }
    ),{
        status:200 
    })
}   

//when hit is clicked, give player a random card from the deck, and refresh the deck by removing the given card
//continue until player clicks stand or busts(equal or over 21)
//case1:player ==21, win
//case2:player >21 , lose
//case3: player <21 , continue

//when stand is clicked, continuely give dealer cards until dealer's hand is equal or over 17
// same as player

//player<=21 and dealer>21, player win
//player>dealer, player win
//else dealer win
