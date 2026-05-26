import {
  cloudflareRequest,
  sendUploadError,
  toCloudflareMetadata,
  UploadApiError,
  validateAvatarUploadInput,
} from './_shared.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const input = validateAvatarUploadInput(req.body)
    const formData = new FormData()
    formData.set('metadata', toCloudflareMetadata(input))
    formData.set('requireSignedURLs', 'false')

    const data = await cloudflareRequest('/images/v2/direct_upload', {
      method: 'POST',
      body: formData,
    })

    const upload = data.result || data
    const uploadId = String(upload.id || upload.uploadId || '').trim()
    const uploadURL = String(upload.uploadURL || upload.uploadUrl || '').trim()

    if (!uploadId || !uploadURL) {
      throw new UploadApiError(502, 'Cloudflare 未返回上传地址')
    }

    res.status(200).json({
      uploadId,
      key: uploadId,
      uploadURL,
      purpose: input.purpose,
      fileName: input.fileName,
      contentType: input.contentType,
      size: input.size,
    })
  } catch (error) {
    sendUploadError(res, error)
  }
}

