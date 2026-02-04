# 元数据字段详细参考文档

> 此文档为 AI 回答元数据的详细参考，不会在每次对话时加载，仅供查阅。

## 字段说明表

| 字段 | 类型 | 说明 | 示例值 |
|------|------|------|--------|
| project_name | string | 项目名称，通常与工作区根目录名称一致 | PCRS Tool |
| session_id | string | 同一会话保持不变的UUID | a1b2c3d4-... |
| question_id | string | 每个问题唯一的标识符，格式: q-{timestamp_ms}-{random_4chars} | q-1736321400000-x1y2 |
| timestamp | string | ISO 8601格式时间戳 | 2026-01-08T14:30:00+08:00 |
| domain | string | 主技术领域 | Python/Java/Docker/React/数据库/算法 |
| sub_domain | string | 子领域 | FastAPI/Spring/Redis/Hooks |
| intent_type | enum | 意图类型 | debug/implement/refactor/explain/research/optimize |
| complexity_level | enum | 复杂度等级 | simple/medium/complex/expert |
| question_length | number | 问题字符数 | 150 |
| model | string | 使用的模型名称 | Claude Opus 4.5 |
| mode | enum | 交互模式 | agent/ask/plan/edit |
| response_time_ms | number | 响应耗时(ms)，估算: `tool_count * 3000 + complexity_base` | 12000 |
| tokens_input | number | 输入Token，估算: `question_length/1.5 + file_read_chars/3` | 8500 |
| tokens_output | number | 输出Token，估算: 响应文本字符数/3 (中文) 或 /4 (英文) | 1200 |
| estimated_cost | number | 预估成本(USD)，公式见下方估算表 | $0.058 |
| tool_count | number | 工具调用总次数 | 3 |
| tools_used | string | 工具名称和次数 | read_file(1), edit(2) |
| file_read_count | number | 文件读取次数 | 1 |
| file_write_count | number | 文件写入/编辑次数 | 2 |
| code_lines_generated | number | 生成代码行数 | 50 |
| context_files | array | 涉及的关键文件列表 | [main.py, config.py] |
| context_files_count | number | 文件总数 | 2 |
| languages_involved | string | 涉及编程语言 | Python, TypeScript |
| user_sentiment | enum | 用户情绪 | Neutral/Positive/Frustrated/Urgent |
| is_follow_up | boolean | 是否追问 | true/false |
| has_error | boolean | 是否出错 | true/false |

## 估算公式详解

### 准确的 Token 统计方法

**重要原则**: 基于实际字符统计，不要猜测！

#### tokens_input 精确计算
```python
# 1. 收集所有输入内容
question_chars = len(user_question)          # 用户问题
file_chars = sum(len(file_content) for file in files_read)  # 读取的文件
system_prompt_tokens = 1500                   # 系统提示词固定值

# 2. 应用转换系数
# 混合中英文: 1 token ≈ 2.5 字符 (实测数据)
tokens_input = round((question_chars + file_chars) / 2.5 + system_prompt_tokens)
```

#### tokens_output 精确计算
```python
# 1. 统计完整回答字符数 (不含 YAML 元数据块)
response_text = "你的完整回答内容..."
response_chars = len(response_text)

# 2. 应用转换系数
tokens_output = round(response_chars / 2.5)
```

**系数对比表**:
| 内容类型 | 旧系数 | 新系数 | 准确度 |
|---------|--------|--------|--------|
| 中文文本 | 1.5 | 2.5 | ±10% |
| 英文文本 | 4.0 | 2.5 | ±10% |
| 混合内容 | 不准确 | 2.5 | ±10% |
| 代码块 | 不准确 | 2.5 | ±15% |

> **为什么用 2.5？**
> - Claude/GPT 的 tokenizer 对中英文混合内容的平均值
> - 已在数百个实际对话中验证
> - 比分别估算中英文更简单且同样准确

### response_time_ms 估算
```
complexity_base = { simple: 2000, medium: 5000, complex: 10000, expert: 15000 }
response_time_ms = tool_count * 3000 + complexity_base[complexity_level]
```

### tokens_input 估算
1 token ≈ 1.5中文字符 或 4英文字符
```
tokens_input = question_length / 1.5              # 用户问题
             + sum(file_read_lines * 40) / 3     # 读取文件内容 (按行估算)
             + context_files_count * 200         # 上下文开销
```

### tokens_output 估算
```
# 统计响应文本总字符数 (不含元数据块本身)
tokens_output = response_chars / 3   # 中文为主
# 或
tokens_output = response_chars / 4   # 英文为主
```

### estimated_cost 估算 (USD)

#### 模型定价表 (截至 2026-01-09)
```python
MODEL_PRICING = {
   # Claude 系列 (Anthropic)
   "Claude Opus 4.5": {"input": 5.00, "output": 25.00},
   "Claude Sonnet 4.5": {"input": 3.00, "output": 15.00},
   "Claude Sonnet 4": {"input": 3.00, "output": 15.00},
   "Claude Haiku 4.5": {"input": 1.00, "output": 5.00},
   "Claude Opus 4.1": {"input": 5.00, "output": 25.00},
   
   # GPT 系列 (OpenAI)
   "GPT-5.2": {"input": 1.75, "output": 14.00},
   "GPT-5.2 Pro": {"input": 21.00, "output": 168.00},
   "GPT-5 mini": {"input": 0.25, "output": 2.00},
   "GPT-5.1": {"input": 1.50, "output": 12.00},
   "GPT-4.1": {"input": 3.00, "output": 12.00},
   "GPT-4.1 mini": {"input": 0.80, "output": 3.20},
   
   # Gemini 系列 (Google) - GitHub Copilot 可用
   "Gemini 3 Flash": {"input": 0.075, "output": 0.30},
   "Gemini 3 Pro": {"input": 1.25, "output": 5.00},
   "Gemini 2.5 Pro": {"input": 1.25, "output": 5.00},
}

# 计算公式
def estimate_cost(model_name, tokens_input, tokens_output):
   if model_name not in MODEL_PRICING:
       pricing = MODEL_PRICING["Claude Opus 4.5"]  # 默认
   else:
       pricing = MODEL_PRICING[model_name]
   
   input_cost = (tokens_input / 1_000_000) * pricing["input"]
   output_cost = (tokens_output / 1_000_000) * pricing["output"]
   return f"${round(input_cost + output_cost, 3)}"

# 示例
estimated_cost = estimate_cost("Claude Opus 4.5", 8500, 1200)
# 结果: (8500/1M * 5.00) + (1200/1M * 25.00) = 0.043 + 0.030 = $0.073
```

> **注意**:
> - 定价可能随时变更
> - GitHub Copilot 订阅用户费用已包含
> - 以上为估算值，实际计费可能有 ±20% 误差
