from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import idea_cards

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时连接数据库
    await connect_to_mongo()
    yield
    # 关闭时断开连接
    await close_mongo_connection()


# 创建 FastAPI 应用
app = FastAPI(
    title="ThoughtFlow API",
    description="想法卡片管理系统 API - 支持卡片的创建、编辑、软删除和编辑历史追溯",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(idea_cards.router)


@app.get("/", tags=["health"])
async def root():
    """健康检查"""
    return {"message": "ThoughtFlow API is running", "status": "healthy"}


@app.get("/health", tags=["health"])
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "ThoughtFlow API"}
