# Ensemble Sign

活动来宾端页面，直接读取并写入活动后端公开 API：

- `GET /api/posters/active`
- `GET /api/program`
- `GET /api/works`
- `GET /api/guests`
- `POST /api/guests`

默认后端地址：

- `https://show-plan-event-backend.liucheng-show-plan.workers.dev`

## Guest payload

来宾登记仅提交以下字段：

- `fullName`
- `identity`
- `photo`

当前页面使用后置摄像头拍摄头像，提交时会先上传成可公开访问的图片链接，再把同一链接写入 `photo`、`selfieUrl` 和 `selfieThumbnailUrl` 发送到 `POST /api/guests`。
来宾头像状态通过 `GET /api/guests` 获取并渲染，最终使用返回的 `photo` 字段显示头像。

## Local

1. `npm install`
2. Configure `.env.local` from `.env.example`
3. `npm run dev`
