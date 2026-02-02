'use client';
import { useEffect, useState} from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {useAccount, useSignMessage} from 'wagmi';
import { parseAbi,createPublicClient,createWalletClient ,custom} from "viem";
import { avalancheFuji } from "viem/chains";

export default function Page(){

  const [winner,setWinner] = useState('');
  const [message,setMessage] = useState('');
  const [playerHand,setPlayerHand] = useState([{ rank: '', suit: '' }]);
  const [dealerHand,setDealerHand] = useState([{ rank: '', suit: '' }]);
  const [score,setScore] = useState(0);
  const {address,isConnected} = useAccount();
  const [isSigned,setIsSigned] = useState(false);
  const {signMessageAsync} = useSignMessage();
  const [publicClient ,setPublicClient] = useState<any>(null);
  const [walletClient ,setWalletClient] = useState<any>(null);

  const initGame = async ()=>{
    const response = await fetch(`/api?address=${address}`,{method:'GET'});
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setWinner(data.winner);
    setScore(data.score);
    if(typeof window !== 'undefined' && (window as any).ethereum){
        const publicClient = createPublicClient({
          chain:avalancheFuji,
          transport:custom((window as any).ethereum),
        })
        const walletClient = createWalletClient({
          chain:avalancheFuji,
          transport:custom((window as any).ethereum),
        })
        setPublicClient(publicClient);    
        setWalletClient(walletClient);
    }else{
      console.error('window.ethereum is undefined');
    }}

    //怎么发送交易？？？？？？？？？？？？？？？？？？
  // async function handleSendTx(){
  //   //get contract address 
  //   const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  //   //get abi
  //   const contractAbi = parseAbi([process.env.NEXT_PUBLIC_CONTRACT_ABI||""]);
  //   //we need 1contract address 2function name 3params
  //   //public client try
  //   await publicClient.simulateContract({
  //     address:contractAddress,
  //     abi:contractAbi,
  //     functionName:'sendRequest',
  //     args:[[address],address],
  //     accont:address
  //   })
  //   //wallet client
  //   const txHash = await walletClient.writeContract({
  //     to:contractAddress,
  //     abi:contractAbi,
  //     functionName:'sendRequest',
  //     args:[[address],address],
  //     account:address
  //   })
  //   console.log('txHash:',txHash);
  // }
  


  async function handleHit(){
    const response = await fetch('/api',{
      method:'POST',
      headers:{
        bearer:localStorage.getItem('token')||''
      },
      body:JSON.stringify({action:'hit',address})
    })
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setWinner(data.winner);
    setScore(data.score);
  }
  async function handleStand(){
    const response = await fetch('/api',{
      method:'POST',
      headers:{
        bearer:localStorage.getItem('token')||''
      },
      body:JSON.stringify({action:'stand',address}) 
    })
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setWinner(data.winner);
    setScore(data.score);
  }
  async function handleReset(){
    const response = await fetch(`/api?address=${address}`,{method:'GET'});
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setWinner(data.winner);
    setScore(data.score);
  }

  async function handleSign(){
    const message = `Welcome to web3 blackjack at  ${new Date().toISOString()}`;
    //sign the message
    console.log('message:',message);
    const signature = await signMessageAsync({message});
    console.log('signature:',signature);
    const response = await fetch('/api',{method:'POST',body:JSON.stringify({
      action:'sign',
      address,
      message,
      signature
    })});
    if(response.status===200){
      const {token} = await response.json();
      console.log('Received token:', token);
      localStorage.setItem('token',token);
      alert('Message signature is valid');
      setIsSigned(true);
      initGame();
    }else{
      alert('Message signature is invalid');
    }

  }

  if(!isSigned){
  return(
      <div className="justify-center items-center flex flex-col gap-2 p-4 h-screen bg-gray-400">
  <ConnectButton /> 
  <button onClick={handleSign} className="border-black bg-amber-300 p-2 rounded-md">Sign with wallet</button>
  </div>
  )
  }
  return (

    <div className="justify-center items-center flex flex-col gap-2 p-4 h-screen bg-gray-400">
      <ConnectButton /> 
      <button onClick={handleSign} className="border-black bg-amber-300 p-2 rounded-md">Sign with wallet</button>
      <h1 className="text-3xl bold ">Welcome to web3 game blackjack</h1>
      <h2 className={`text-2xl bold ${winner==="player"?"bg-green-300" :"bg-red-300"}`}> score:{score}{message}</h2>
      <button onClick={handleSendTx} className="bg-amber-300 rounded-md p-1 ">Get NFT</button>
      <div className="mt-4">
        <h2>Dealer's hand</h2>
        <div className="flex flex-row gap-2">
           {
            dealerHand.map((card,index)=>(
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
            playerHand.map((card,index)=>(
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
        {
          message===''?
          <>
          <button onClick={handleHit} className="bg-amber-300 rounded-md p-1 ">Hit</button>
          <button onClick={handleStand} className="bg-amber-300 rounded-md p-1 ">Stand</button>
          </>
          :
          <>
          <button onClick={handleReset} className="bg-amber-300 rounded-md p-1 ">Reset</button>
          </>
        }
        
        
      </div>

    </div>
  )
}