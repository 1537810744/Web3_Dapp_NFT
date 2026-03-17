🎮 核心游戏机制
本作采用经典的21点（Blackjack）PVE对战模式。玩家与电脑进行博弈，通过“叫牌（Hit）”与“停牌（Stand）”的策略选择，最终以有效点数更高者获胜。游戏深度绑定积分系统，胜负直接决定积分的获取与扣除。当玩家积累的积分达到特定阈值时，即可解锁Web3资产兑换通道，将虚拟游戏积分转化为真实拥有的链上资产（NFT）。
🛠 技术架构解析
本项目采用 Web2 + Web3 的混合架构（Hybrid Architecture），分为三大核心模块：
Web2 游戏引擎与数据中心（保障流畅体验）：
游戏主体业务维持传统的前后端分离架构，确保对局体验的低延迟与高并发。玩家的对战逻辑、状态机流转以及积分数据的增减，均安全、高效地存储于 Azure Cosmos DB 云数据库中。
Web3 资产上链与预言机网络（实现资产确权）：
当玩家发起积分兑换NFT的请求时，前端将唤起用户的 Web3 钱包（如 MetaMask）进行数字签名并调用部署在链上的智能合约。为确保数据的防篡改与真实性，智能合约将通过**链下预言机（Oracle）**安全读取 Azure Cosmos DB 中的积分数据。验证达标后，合约自动触发铸造（Mint）逻辑，为玩家发放专属的 NFT 代币。该资产永久记录在区块链上，真正实现玩家的数字资产不可篡改与绝对所有权。
链下事件监听与实时同步（构建竞技生态）：
系统部署了独立的链下监听服务（Event Listener），持续监控指定智能合约地址产生的链上事件（如 NFT 铸造记录）。监听器将捕获到的链上数据实时解析并推送到前端，动态渲染出全网玩家的“NFT铸造榜单/积分榜”，打造完整的游戏内循环与社区竞技氛围。

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

项目框架图我已经通过tldraw分享，同样欢迎大家批判指正！

https://www.tldraw.com/p/0vGABXiWXqW1bYv0LaIzU?d=v-2974.-2290.7479.4302.page

![Project Framework](./framework.png)
