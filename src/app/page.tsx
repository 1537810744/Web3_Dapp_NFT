'use client';
import { useEffect, useState} from "react";

export default function Page(){
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♥️', '♦️', '♣️', '♠️'];  
  //?
  const initialDeck = ranks.map(rank => suits.map(suit => ( {"rank":rank , "suit":suit}))).flat();
  const [deck,setDeck] =  useState([{ rank: '', suit: '' }]);  
  const [winner,setWinner] = useState('');
  const [message,setMessage] = useState('');
  useEffect(()=>{
    setDeck(initialDeck);
    setWinner('player');
    setMessage('Player wins with Blackjack!');
  },[])
  return (

    <div className="justify-center items-center flex flex-col gap-2 p-4 h-screen bg-gray-400">
      <h1 className="text-3xl bold ">Welcome to web3 game blackjack</h1>
      <h2 className={`text-2xl bold ${winner==="player"?"bg-green-300" :"bg-red-300"}`}>{message}</h2>
      <div className="mt-4">
        <h2>Dealer's hand</h2>
        <div className="flex flex-row gap-2">
           {
            deck.slice(0,3).map((card,index)=>(
              <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between" > 
              <p className="self-start p-2 text-lg">{card.rank}</p> 
              <p className="self-center p-2 text-3xl">{card.suit}</p>
              <p className="self-end p-2 text-lg">{card.rank}</p> 
              </div>

            ))
          }
        </div>
      </div>

      <div>
        <h2>Player's hand</h2>
        <div className="flex flex-row gap-2">
           {
            deck.slice(0,3).map((card,index)=>(
              <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between" > 
              <p className="self-start p-2 text-lg">{card.rank}</p> 
              <p className="self-center p-2 text-3xl">{card.suit}</p>
              <p className="self-end p-2 text-lg">{card.rank}</p> 
              </div>
            ))
          }
        </div>
      </div>

      <div className="flex flex-rwo gap-3 mt-4">
        <button className="bg-amber-300 rounded-md p-1 ">Hit</button>
        <button className="bg-amber-300 rounded-md p-1 ">Stand</button>
        <button className="bg-amber-300 rounded-md p-1 ">Reset</button>
      </div>

    </div>
  )
}