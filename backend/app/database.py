from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()

# MongoDB 客户端和数据库实例
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """连接到 MongoDB"""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    # 创建索引
    await db.idea_cards.create_index("is_deleted")
    await db.idea_cards.create_index("create_time")
    await db.idea_cards.create_index("update_time")
    
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_mongo_connection():
    """关闭 MongoDB 连接"""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database() -> AsyncIOMotorDatabase:
    """获取数据库实例"""
    return db
