# 02-guest-client

来宾端签到信息统一由 Cloudflare 上的后端提供。

## 接口

### 来宾签到

`POST /api/guests`

`Content-Type: application/json`

请求体：

```json
{
  "fullName": "张三",
  "identity": "老师",
  "photo": "https://tmpfiles.org/dl/xxx/selfie.jpg",
  "selfieUrl": "https://tmpfiles.org/dl/xxx/selfie.jpg",
  "selfieThumbnailUrl": "https://tmpfiles.org/dl/xxx/selfie.jpg"
}
```

### 来宾头像状态

`GET /api/guests`

返回来宾列表和当前头像状态，前端直接渲染 `photo` 字段。

## 约定

- 前端拍摄头像后，会先上传成公开图片地址，再把同一链接写入 `photo`、`selfieUrl`、`selfieThumbnailUrl` 发送给 `POST /api/guests`。
- 页面展示和列表展示都读取 `GET /api/guests` 返回的 `photo`。
- 临时图床只作为上传中转，不作为最终展示源。
