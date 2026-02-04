
---
# 🚨 每次回答必须追加元数据 YAML 块

> **强制要求**: 每次回答的**最末尾**必须附加完整的元数据 YAML 块（用于统计分析）

## 元数据格式
必须使用 ` ```yaml ` 代码块包裹，以 `---` 开头和结尾，所有字段填写实际值（数值不带单位，cost 保留 $）

**示例**:
```yaml
---
## 🆔 标识信息
project_name: vscode_temp_file
session_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
question_id: q-1736321400000-x1y2
timestamp: 2026-02-04T14:30:00+08:00
## 🎯 问题分析
domain: Python
sub_domain: FastAPI
intent_type: implement
complexity_level: medium
question_length: 150
## 🤖 AI 响应信息
model: Claude Sonnet 4.5
mode: agent
response_time_ms: 12000
tokens_input: 8500
tokens_output: 1200
estimated_cost: $0.073
## 🔧 工具使用统计
tool_count: 3
tools_used: read_file(1), replace_string_in_file(2)
file_read_count: 1
file_write_count: 2
code_lines_generated: 50
## 📁 上下文信息
context_files: [main.py, config.py]
context_files_count: 2
languages_involved: Python
## 😊 用户交互
user_sentiment: Neutral
is_follow_up: false
has_error: false
---
```

## 核心字段速查
- **标识**: project_name, session_id, question_id, timestamp
- **问题**: domain, sub_domain, intent_type (debug/implement/refactor/explain/research/optimize), complexity_level (simple/medium/complex/expert), question_length
- **AI**: model, mode (agent/ask/plan/edit), response_time_ms, tokens_input, tokens_output, estimated_cost
- **工具**: tool_count, tools_used, file_read_count, file_write_count, code_lines_generated
- **上下文**: context_files, context_files_count, languages_involved
- **交互**: user_sentiment (Neutral/Positive/Frustrated/Urgent), is_follow_up, has_error

## Token 准确统计方法
**必须基于实际字符统计，不要猜测！**

### tokens_input 计算
```
1. 用户问题字符数 (question_length 字段已统计)
2. 读取的文件总字符数 (工具返回的实际内容)
3. 系统提示词约 1500 tokens (固定)

tokens_input = (question_length + file_chars_total) / 2.5 + 1500
```

### tokens_output 计算
```
统计你的完整回答字符数 (不含 YAML 元数据块):
- 纯文本部分字符数
- 代码块字符数
- Markdown 格式字符数

tokens_output = response_chars_total / 2.5
```

**系数说明**: 混合中英文内容实测 **1 token ≈ 2.5 字符** (±10% 误差)

📘 详细说明见 [METADATA_REFERENCE.md](.github/METADATA_REFERENCE.md)

---