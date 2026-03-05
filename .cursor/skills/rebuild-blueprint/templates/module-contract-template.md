# 模块接口契约模板

## 模块信息

- **模块名称**：
- **职责描述**：
- **依赖模块**：
- **被依赖模块**：

---

## 接口清单

### 接口1: [接口名称]

#### 基本信息
- **接口ID**: `module_name.operation_name`
- **HTTP Method**: GET/POST/PUT/DELETE/PATCH
- **Path**: `/api/v1/module/operation`
- **鉴权方式**: 无需鉴权/JWT/ApiKey

#### 请求定义

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Query Parameters** (GET请求):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| param1 | string | 是 | 参数说明 |

**Request Body** (POST/PUT/PATCH):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "field1": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "字段1说明"
    },
    "field2": {
      "type": "integer",
      "minimum": 0,
      "description": "字段2说明"
    },
    "field3": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "数组字段"
    }
  },
  "required": ["field1", "field2"],
  "additionalProperties": false
}
```

#### 响应定义

**成功响应 (HTTP 200)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "code": {
      "type": "integer",
      "enum": [0],
      "description": "业务状态码，0表示成功"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    },
    "message": {
      "type": "string",
      "enum": ["success"]
    }
  },
  "required": ["code", "data", "message"]
}
```

**错误响应**:

| HTTP状态码 | 业务错误码 | 错误消息 | 场景 |
|-----------|-----------|---------|------|
| 400 | 40001 | 参数校验失败 | 必填字段缺失或格式错误 |
| 400 | 40002 | 参数格式错误 | JSON解析失败 |
| 401 | 40101 | 未授权 | Token缺失或无效 |
| 403 | 40301 | 权限不足 | 无操作权限 |
| 404 | 40401 | 资源不存在 | 请求的资源不存在 |
| 409 | 40901 | 资源冲突 | 唯一约束冲突 |
| 429 | 42901 | 请求过于频繁 | 触发限流 |
| 500 | 50001 | 服务器内部错误 | 系统异常 |

**错误响应示例**:
```json
{
  "code": 40001,
  "data": null,
  "message": "参数 'field1' 不能为空"
}
```

#### 边界情况

1. **空值处理**:
   - [ ] 可选字段为null时的处理
   - [ ] 空字符串的处理

2. **并发安全**:
   - [ ] 是否存在竞态条件
   - [ ] 是否需要分布式锁

3. **性能考虑**:
   - [ ] 大数据量分页
   - [ ] 慢查询优化

4. **幂等性**:
   - [ ] 是否支持重试
   - [ ] 幂等键策略

---

## 数据模型

### 实体定义

```typescript
interface ModuleEntity {
  // 主键
  id: string;
  
  // 业务字段
  name: string;
  status: 'active' | 'inactive';
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### 数据库表结构

```sql
CREATE TABLE module_table (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## 测试用例

### 正常流程

| 用例ID | 场景 | 输入 | 预期输出 |
|--------|------|------|---------|
| TC001 | 正常创建 | 有效参数 | 201 Created |
| TC002 | 正常查询 | 存在ID | 200 OK + 数据 |

### 异常流程

| 用例ID | 场景 | 输入 | 预期输出 |
|--------|------|------|---------|
| TC101 | 参数缺失 | 缺少必填字段 | 400 Bad Request |
| TC102 | 无权访问 | 无Token | 401 Unauthorized |

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | YYYY-MM-DD | 初始版本 | - |
