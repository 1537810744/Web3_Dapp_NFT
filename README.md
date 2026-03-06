该项目是一个基于区块链技术的去中心化21点（Blackjack）游戏应用，由本人独立开发，项目结合了传统Web2技术
栈、Solidity 合约、Chainlink 链下预言机网络、Azure云服务以及遵循ERC721协议的NFT铸造等多个技术模块。项
目采用前后端分离架构，通过链上合约实现游戏NFT资产的去中心化，使用ChainlinkFunctions实现链下数据访问，
在累计胜利积分达阈值后允许用户申请铸造NFT作为游戏奖励。整个系统涉及多个技术层次的协作，包括前端交互、
钱包集成、后端API服务、AzureCosmosDB、AzureFunction、Solidity合约Remix部署以及IPFS去中心化存储等。
设计逻辑：TS前端负责用户交互与钱包连接，TS后端处理游戏逻辑与状态管理并同步至AzureCosmosDB；智能合
约遵循ERC721协议实现核心操作去中心化验证与NFT铸造；Go负责链下监听合约，同时将监听数据同步MySQL，
并且Go提供RestfulAPI 接口供前端访问；通过Docker打包为多个Image镜像，实现程序的容器化运行；Chainlink
实现链上链下数据互通；Azure提供稳定存储与计算能力。

项目详细的开发流程我已经上传到B站，欢迎大家指正！

【【项目实战】Dapp Web3全栈开发】 

https://www.bilibili.com/video/BV1vEFCzFEjL/?share_source=copy_web&vd_source=8733ea87ee7ae5ea7f6843a71bb71bde

项目框架图我已经通过tldraw分享，统一欢迎大家批判指正！

https://www.tldraw.com/p/0vGABXiWXqW1bYv0LaIzU?d=v-2974.-2290.7479.4302.page

![Project Framework](./framework.png)