# Ensemble Sign

现场签到页面，数据通过 `/api/checkins` 写入与 `show-plan` 相同的 Firebase 后端。

## API

- `GET /api/checkins`
- `POST /api/checkins`

Firestore 默认集合：`ensembleCheckins`。

## Local

1. `npm install`
2. Configure `.env.local` from `.env.example`
3. `npm run dev`

If the API is not configured, the page falls back to local browser storage.
