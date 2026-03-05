# 《重建蓝图》- [项目名称]

## 1. 技术栈建议

根据本地部署环境推荐：

| 层级 | 技术选型 | 版本 | 理由 |
|------|---------|------|------|
| 前端 | [框架] | [版本] | [理由] |
| 后端 | [框架] | [版本] | [理由] |
| 数据库 | [类型] | [版本] | [理由] |
| 缓存 | [方案] | [版本] | [理由] |
| 部署 | [方式] | - | [理由] |

## 2. 目录结构

```
project-root/
├── src/
│   ├── modules/           # 业务模块
│   │   ├── module-a/
│   │   │   ├── dto/       # 数据传输对象
│   │   │   ├── service/   # 业务逻辑
│   │   │   └── controller/# API 接口
│   │   └── module-b/
│   ├── common/            # 公共代码
│   │   ├── utils/         # 工具函数
│   │   ├── middleware/    # 中间件
│   │   └── exceptions/    # 异常定义
│   └── config/            # 配置文件
├── tests/                 # 测试文件
├── docs/                  # 文档
└── scripts/               # 脚本工具
```

## 3. MVP 路线

### Phase 1: 核心骨架（可运行）
- [ ] 项目初始化
- [ ] 基础配置
- [ ] 第一个可运行的端点

### Phase 2: 核心功能
- [ ] 模块1：[描述]
- [ ] 模块2：[描述]

### Phase 3: 完善
- [ ] 错误处理
- [ ] 日志记录
- [ ] 基础测试

## 4. 模块拆分 + 接口契约

### 模块1：[模块名称]

**职责描述**：
[一句话描述该模块的职责]

**接口列表**：

#### 接口1.1: [接口名称]

- **Method**: GET/POST/PUT/DELETE
- **Path**: `/api/v1/...`
- **请求参数**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "field1": {
      "type": "string",
      "description": "字段说明"
    }
  },
  "required": ["field1"]
}
```

- **响应成功 (200)**：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "code": { "type": "integer", "enum": [0] },
    "data": { "type": "object" },
    "message": { "type": "string" }
  }
}
```

- **响应错误**：

| 错误码 | 含义 | 场景 |
|--------|------|------|
| 40001 | 参数错误 | 必填字段缺失 |
| 40002 | 格式错误 | 参数格式不符合要求 |
| 50001 | 服务内部错误 | 系统异常 |

---

### 模块2：[模块名称]

[同上格式...]

## 5. 数据模型

### 实体1: [实体名称]

```typescript
interface EntityName {
  id: string;           // 主键
  field1: string;       // 字段说明
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

## 6. 依赖关系图

```
[模块A] → [模块B]
   ↓
[模块C]
```

## 7. 风险与注意事项

1. **[风险1]**：[描述] → [缓解措施]
2. **[风险2]**：[描述] → [缓解措施]
