// src/app/api/test/route.ts
// 导入 Azure Cosmos DB 所需的 SDK
import { CosmosClient } from "@azure/cosmos";

// 处理 GET 请求（访问该接口即触发写入）
export async function GET(request: Request) {
  try {
    // 1. Azure Cosmos DB 配置
    const endpoint = "https://yangyuhao.documents.azure.com:443/";
    //FdaA88esezOWNOfH2Yx4UN7HdxgGZf5OEdr591FxJbrZV19CpRbuI4vSY9GPSGimDR3wJ7PVjEX8ACDbLzomyQ==
    const key = "above";
    const databaseId = "PlayerScoreDB";
    const containerId = "PlayerScores";

    // 2. 创建 Cosmos DB 客户端
    const client = new CosmosClient({ endpoint, key });

    // 3. 获取数据库和容器
    const database = client.database(databaseId);
    const container = database.container(containerId);

    // 4. 从查询参数获取 player 和 score，如果没有则使用默认值
    const url = new URL(request.url);
    const player = url.searchParams.get("player") || "dsfadsadfsdfssssssi";
    const scoreStr = url.searchParams.get("score") || "100000";
    const score = parseInt(scoreStr, 10);

    // 5. 定义要写入的数据：player 和 score
    const playerEntity = {
      id: player, // id 与 player 相同
      player: player,
      score: score,
    };

    // 6. 写入/更新文档（存在则更新，不存在则新增）
    const { resource: createdItem } = await container.items.upsert(playerEntity);

    // 7. 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ 数据写入成功！player=${player}, score=${score}`,
        data: createdItem,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // 8. 捕获错误并返回失败响应
    const errorMessage = (error as Error).message;
    return new Response(
      JSON.stringify({
        success: false,
        error: `数据写入失败：${errorMessage}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}