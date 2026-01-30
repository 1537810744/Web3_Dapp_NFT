// src/app/api/test/route.ts
// 导入 Azure Table Storage 所需的 SDK
import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";

// 处理 GET 请求（访问该接口即触发写入）
export async function GET() {
  try {
    // 1. 从环境变量读取 Azure 存储配置（确保 .env.local 已配置）
    const account = process.env.AZURE_STORAGE_ACCOUNT;
    const key = process.env.AZURE_STORAGE_KEY;
    const tableName = process.env.AZURE_TABLE_NAME;

    // 2. 检查环境变量是否完整
    if (!account || !key || !tableName) {
      throw new Error(
        "缺少 Azure 存储配置！请检查 .env.local 文件是否配置 AZURE_STORAGE_ACCOUNT、AZURE_STORAGE_KEY、AZURE_TABLE_NAME"
      );
    }

    // 3. 创建 Azure Table Storage 凭证和客户端
    const credential = new AzureNamedKeyCredential(account, key);
    const tableClient = new TableClient(
      `https://${account}.table.core.windows.net`, // 存储账户终结点
      tableName, // 你的表名（比如 web3blackjack）
      credential
    );

    // 4. 定义要写入的数据：player=zhangsan，score=100
    const playerEntity = {
      partitionKey: "zhangsan", // 对应 player 字段
      rowKey: "score", // 固定行键保证组合主键唯一
      score: 100, // 数字类型的分数
    };

    // 5. 写入/更新实体（存在则更新，不存在则新增）
    await tableClient.upsertEntity(playerEntity);

    // 6. 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ 数据写入成功！player=zhangsan, score=100",
        data: playerEntity,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // 7. 捕获错误并返回失败响应
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