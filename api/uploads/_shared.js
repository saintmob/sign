export class UploadApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

const CLOUD_FLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUD_FLARE_IMAGES_TOKEN =
  process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN
const CLOUD_FLARE_IMAGES_ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
const CLOUD_FLARE_IMAGES_VARIANT = process.env.CLOUDFLARE_IMAGES_VARIANT || 'public'

export function sendUploadError(res, error) {
  const statusCode = error instanceof UploadApiError ? error.statusCode : 500
  const message = error instanceof Error ? error.message : '上传服务错误'
  res.status(statusCode).json({ error: message })
}

function assertConfigured() {
  if (!CLOUD_FLARE_ACCOUNT_ID) {
    throw new UploadApiError(503, '缺少 CLOUDFLARE_ACCOUNT_ID')
  }
  if (!CLOUD_FLARE_IMAGES_TOKEN) {
    throw new UploadApiError(503, '缺少 CLOUDFLARE_IMAGES_API_TOKEN')
  }
  if (!CLOUD_FLARE_IMAGES_ACCOUNT_HASH) {
    throw new UploadApiError(503, '缺少 CLOUDFLARE_IMAGES_ACCOUNT_HASH')
  }
}

export function buildImageUrl(imageId) {
  return `https://imagedelivery.net/${CLOUD_FLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${CLOUD_FLARE_IMAGES_VARIANT}`
}

async function readJson(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok || data?.success === false) {
    const errorMessage =
      data?.errors?.[0]?.message || data?.error || data?.message || 'Cloudflare API request failed'
    throw new UploadApiError(response.status, errorMessage)
  }
  return data
}

export async function cloudflareRequest(path, options = {}) {
  assertConfigured()
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUD_FLARE_ACCOUNT_ID}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLOUD_FLARE_IMAGES_TOKEN}`,
      ...(options.headers || {}),
    },
  })
  return readJson(response)
}

export function validateAvatarUploadInput(body) {
  const purpose = String(body?.purpose || '').trim()
  const fileName = String(body?.fileName || body?.filename || body?.name || '').trim()
  const contentType = String(body?.contentType || body?.mimeType || '').trim().toLowerCase()
  const size = Number(body?.size || 0)

  if (!fileName) {
    throw new UploadApiError(400, '缺少文件名')
  }

  if (!contentType.startsWith('image/')) {
    throw new UploadApiError(400, '仅支持图片头像上传')
  }

  if (!Number.isFinite(size) || size <= 0) {
    throw new UploadApiError(400, '文件大小无效')
  }

  return {
    purpose: purpose || 'guest-avatar',
    fileName,
    contentType,
    size,
  }
}

export function toCloudflareMetadata(input) {
  return JSON.stringify({
    purpose: input.purpose,
    fileName: input.fileName,
    contentType: input.contentType,
    size: input.size,
  })
}

