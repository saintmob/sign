import {
  buildImageUrl,
  cloudflareRequest,
  sendUploadError,
  UploadApiError,
} from './_shared.js'

async function waitForUploadedImage(imageId) {
  let lastResult = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const data = await cloudflareRequest(`/images/v1/${imageId}`, { method: 'GET' })
      lastResult = data.result || data
      if (!lastResult?.draft) {
        return lastResult
      }
    } catch (error) {
      lastResult = null
      if (attempt === 4) {
        throw error
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  return lastResult
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = req.body || {}
    const imageId = String(body.uploadId || body.key || body.imageId || body.id || '').trim()

    if (!imageId) {
      throw new UploadApiError(400, '缺少上传 ID')
    }

    const details = await waitForUploadedImage(imageId)
    if (!details?.id) {
      throw new UploadApiError(502, '未能确认头像上传结果')
    }

    const photo = buildImageUrl(imageId)
    res.status(200).json({
      uploadId: imageId,
      key: imageId,
      photo,
      publicUrl: photo,
      image: details,
    })
  } catch (error) {
    sendUploadError(res, error)
  }
}
