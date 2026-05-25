import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { createCheckin, fetchCheckins } from './lib/api'

const identityOptions = ['老师', '本课程同学', '其他学生', '其他观众']

const storageKey = 'ensemble-check-in-entries'
const stepLabels = ['NAME', 'PHOTO', 'ROLE', 'JOIN']

function getIdentityTone(identity) {
  const toneMap = {
    老师: 'teacher',
    本课程同学: 'course-student',
    其他学生: 'outside-student',
    其他观众: 'other-visitor',
  }

  return toneMap[identity] || 'other-visitor'
}

function saveEntry(entry) {
  const existingEntries = JSON.parse(localStorage.getItem(storageKey) || '[]')
  const nextEntries = [...existingEntries, entry]
  localStorage.setItem(storageKey, JSON.stringify(nextEntries))
  return nextEntries
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]')
  } catch {
    return []
  }
}

function isExpiredInvite() {
  const params = new URLSearchParams(window.location.search)
  const expires = params.get('expires')

  if (!expires) {
    return false
  }

  const expiresAt = Date.parse(expires)
  return Number.isFinite(expiresAt) && Date.now() > expiresAt
}

function AmbientStage() {
  const traceLines = [
    'M-30 590 C130 510 120 360 250 310 S380 200 505 250 665 470 830 350 980 310',
    'M40 720 C190 620 285 705 382 585 510 425 610 690 790 520 930 430',
    'M120 85 C260 170 185 300 330 330 475 380 430 505 610 535 735 566 750 430 960 365',
    'M-20 250 C110 205 180 160 255 220 340 295 455 110 555 180 675 252 720 120 920 92',
    'M260 850 C340 710 505 768 588 632 720 415 850 630 1000 515',
    'M25 430 L160 515 L285 475 L390 610 L520 565 L670 730 L830 690 L985 780',
    'M690 -40 C625 125 760 260 690 390 610 540 685 660 640 860',
  ]

  return (
    <div className="ambient-stage" aria-hidden="true">
      <div className="deep-field" />
      <div className="signal-dust" />
      <svg className="constellation-map" viewBox="0 0 1000 860" preserveAspectRatio="none">
        {traceLines.map((line, index) => (
          <path className="trace-line" d={line} key={line} style={{ '--i': index }} />
        ))}
        {Array.from({ length: 34 }).map((_, index) => (
          <circle
            className="trace-node"
            cx={(index * 89 + 42) % 1000}
            cy={(index * 137 + 64) % 860}
            key={index}
            r={(index % 4) + 1.2}
            style={{ '--delay': `${(index % 8) * 0.31}s` }}
          />
        ))}
      </svg>
      <div className="wave wave-a" />
      <div className="wave wave-b" />
      <div className="grid-noise" />
      {Array.from({ length: 86 }).map((_, index) => (
        <span
          className="particle"
          key={index}
          style={{
            '--x': `${(index * 47 + 11) % 100}%`,
            '--y': `${(index * 61 + 7) % 100}%`,
            '--delay': `${(index % 13) * 0.28}s`,
            '--size': `${2 + (index % 4)}px`,
          }}
        />
      ))}
      {Array.from({ length: 26 }).map((_, index) => (
        <span
          className="shard"
          key={index}
          style={{
            '--x': `${(index * 73 + 5) % 100}%`,
            '--y': `${(index * 41 + 13) % 100}%`,
            '--r': `${(index * 29) % 180}deg`,
            '--s': `${0.72 + (index % 5) * 0.13}`,
            '--delay': `${(index % 7) * 0.43}s`,
          }}
        />
      ))}
    </div>
  )
}

function SignalPills() {
  return (
    <div className="signal-pills" aria-hidden="true">
      <span>System Loading...</span>
      <span>Voices Joining...</span>
      <span>Visual / Interaction / Sound</span>
    </div>
  )
}

function Avatar({ entry, className = '' }) {
  const initial = (entry.name || '?').trim().slice(0, 1).toUpperCase()
  const toneClass = `avatar-${getIdentityTone(entry.identity)}`

  return entry.photo ? (
    <img className={`avatar-image ${toneClass} ${className}`} src={entry.photo} alt="" />
  ) : (
    <span className={`avatar-image avatar-fallback ${toneClass} ${className}`}>
      {initial}
    </span>
  )
}

function FloatingMembers({ entries }) {
  const visibleEntries = entries.slice(-28)

  if (visibleEntries.length === 0) {
    return (
      <div className="empty-ensemble">
        <span>NO VOICES YET</span>
        <p>等待第一位成员加入合奏。</p>
      </div>
    )
  }

  return (
    <div className="members-field" aria-label="正在参与合奏的成员">
      {visibleEntries.map((entry, index) => (
        <div
          className="floating-member"
          key={`${entry.timestamp}-${index}`}
          style={{
            '--x': `${8 + ((index * 29) % 82)}%`,
            '--y': `${12 + ((index * 43) % 70)}%`,
            '--delay': `${(index % 9) * -0.8}s`,
            '--scale': `${0.88 + (index % 5) * 0.05}`,
          }}
        >
          <Avatar entry={entry} />
          <span>{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

function EntrancePage({ entries, onEnter }) {
  return (
    <main className="screen entrance-screen members-screen">
      <AmbientStage />
      <section className="members-home page-fade">
        <div className="members-heading">
          <SignalPills />
          <p className="eyebrow">合奏 Ensemble</p>
          <h1>正在参与合奏的成员</h1>
          <p>圆形头像与名字正在现场中漂浮。加入后，你也会成为其中一个声部。</p>
        </div>
        <FloatingMembers entries={entries} />
        <div className="members-action">
          <button className="primary-action" type="button" onClick={onEnter}>
            加入合奏
          </button>
        </div>
      </section>
    </main>
  )
}

function ExpiredPage() {
  return (
    <main className="screen expired-screen">
      <AmbientStage />
      <section className="success-shell page-fade">
        <p className="eyebrow">ENTRY CLOSED</p>
        <h1>
          This Ensemble entrance has expired.
          <span>本次合奏入口已失效。</span>
        </h1>
        <p className="look-up">请向现场工作人员获取新的签到二维码。</p>
      </section>
    </main>
  )
}

async function getCameraStream() {
  const baseVideo = {
    width: { ideal: 960 },
    height: { ideal: 960 },
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        ...baseVideo,
        facingMode: { ideal: 'user' },
      },
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: baseVideo,
    })
  }
}

function CameraCapture({ photo, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraState, setCameraState] = useState('idle')
  const [message, setMessage] = useState('')

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error')
      setMessage('当前浏览器不支持实时摄像头。请使用手机自带浏览器重新打开页面。')
      return
    }

    if (!window.isSecureContext) {
      setCameraState('error')
      setMessage('摄像头需要 HTTPS 或 localhost 安全环境。手机扫码访问局域网 HTTP 地址时，浏览器会阻止摄像头。')
      return
    }

    try {
      setCameraState('starting')
      streamRef.current?.getTracks().forEach((track) => track.stop())
      const stream = await getCameraStream()

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setMessage('')
      setCameraState('ready')
    } catch {
      setCameraState('error')
      setMessage('无法启动摄像头。请确认浏览器已允许摄像头权限，然后重新打开摄像头。')
    }
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function captureFromVideo() {
    const video = videoRef.current
    if (!video?.videoWidth) {
      return
    }

    const canvas = document.createElement('canvas')
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    context.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      512,
      512,
    )
    onCapture(canvas.toDataURL('image/jpeg', 0.78))
  }

  function retakePhoto() {
    onCapture('')
    startCamera()
  }

  return (
    <div className="camera-capture">
      <div className="camera-preview">
        {photo ? (
          <img src={photo} alt="已拍摄头像预览" />
        ) : (
          <>
            <video ref={videoRef} playsInline muted />
            {cameraState !== 'ready' && <span>CAMERA INPUT</span>}
          </>
        )}
      </div>
      {message && <p className="camera-message">{message}</p>}
      <div className="camera-actions">
        <button className="ghost-action" type="button" onClick={photo ? retakePhoto : startCamera}>
          {photo ? '重新拍摄' : cameraState === 'ready' ? '重启摄像头' : '打开摄像头'}
        </button>
        {!photo && (
          <button
            className="primary-action"
            disabled={cameraState !== 'ready'}
            type="button"
            onClick={captureFromVideo}
          >
            拍摄头像
          </button>
        )}
      </div>
    </div>
  )
}

function CheckInForm({ onSubmit }) {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    identity: '',
  })
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function validateStep(step = formStep) {
    const nextErrors = {}

    if (step === 0 && !formData.name.trim()) {
      nextErrors.name = '请输入你的姓名或昵称'
    }

    if (step === 2 && !formData.identity) {
      nextErrors.identity = '请选择身份'
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  function goNext() {
    if (!validateStep()) {
      return
    }

    setFormStep((current) => Math.min(current + 1, stepLabels.length - 1))
  }

  function goBack() {
    setErrors({})
    setFormStep((current) => Math.max(current - 1, 0))
  }

  function selectAndAdvance(field, value) {
    updateField(field, value)
    window.setTimeout(() => {
      setFormStep((current) => Math.min(current + 1, stepLabels.length - 1))
    }, 220)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.name.trim()) {
      setFormStep(0)
      setErrors({ name: '请输入你的姓名或昵称' })
      return
    }

    if (!formData.identity) {
      setFormStep(2)
      setErrors({ identity: '请选择身份' })
      return
    }

    const entry = {
      name: formData.name.trim(),
      photo: formData.photo,
      identity: formData.identity,
      timestamp: new Date().toISOString(),
    }

    onSubmit(entry)
  }

  return (
    <main className="screen form-screen">
      <AmbientStage />
      <section className="form-shell page-fade">
        <SignalPills />
        <div className="section-heading">
          <p className="eyebrow">CHECK-IN SIGNAL</p>
          <h1>Leave Your Voice / 留下你的声部</h1>
          <p>
            你的输入将成为现场合奏的一部分，并可能在“声成”与“回响”环节中出现。
          </p>
        </div>

        <div className="step-progress" aria-label="check-in progress">
          {stepLabels.map((label, index) => (
            <span
              className={index <= formStep ? 'progress-dot active' : 'progress-dot'}
              key={label}
            >
              {label}
            </span>
          ))}
        </div>

        <form className="checkin-form step-form" onSubmit={handleSubmit} noValidate>
          {formStep === 0 && (
            <section className="form-step page-fade" aria-label="姓名">
              <label className="field-block focus-field">
                <span>姓名 / 昵称</span>
                <input
                  autoComplete="name"
                  autoFocus
                  onChange={(event) => updateField('name', event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      goNext()
                    }
                  }}
                  placeholder="请输入你的姓名或昵称"
                  value={formData.name}
                />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <button className="primary-action submit-action" type="button" onClick={goNext}>
                Continue / 继续
              </button>
            </section>
          )}

          {formStep === 1 && (
            <section className="form-step page-fade" aria-label="拍摄头像">
              <div className="field-block">
                <span>拍摄参展人员头像</span>
                <CameraCapture
                  photo={formData.photo}
                  onCapture={(photo) => updateField('photo', photo)}
                />
              </div>
              <div className="step-actions two-actions">
                <button className="ghost-action" type="button" onClick={goBack}>
                  Back
                </button>
                <button className="primary-action" type="button" onClick={goNext}>
                  {formData.photo ? 'Continue / 继续' : 'Skip / 跳过'}
                </button>
              </div>
            </section>
          )}

          {formStep === 2 && (
            <section className="form-step page-fade" aria-label="身份">
              <fieldset className="field-block">
                <legend>身份</legend>
                <div className="option-grid identity-grid">
                  {identityOptions.map((option) => (
                    <label
                      className={
                        formData.identity === option ? 'option selected' : 'option'
                      }
                      key={option}
                    >
                      <input
                        checked={formData.identity === option}
                        name="identity"
                        onChange={() => selectAndAdvance('identity', option)}
                        type="radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.identity && <em>{errors.identity}</em>}
              </fieldset>
              <div className="step-actions">
                <button className="ghost-action" type="button" onClick={goBack}>
                  Back
                </button>
              </div>
            </section>
          )}

          {formStep === 3 && (
            <section className="form-step join-step page-fade" aria-label="加入合奏">
              <div className="join-summary">
                <span>READY TO JOIN</span>
                <Avatar entry={formData} className="join-avatar" />
                <strong>{formData.name || 'Unnamed Voice'}</strong>
                <p>{formData.identity}</p>
              </div>
              <div className="step-actions two-actions">
                <button className="ghost-action" type="button" onClick={goBack}>
                  Back
                </button>
                <button className="primary-action submit-action" type="submit">
                  Join the Ensemble / 加入合奏
                </button>
              </div>
            </section>
          )}
        </form>
      </section>
    </main>
  )
}

function EntryCard({ entry }) {
  return (
    <article className="entry-card">
      <div className="entry-card-top">
        <span>Ensemble Entry Card</span>
        <b>LIVE</b>
      </div>
      <dl>
        <div>
          <dt>Avatar</dt>
          <dd>
            <Avatar entry={entry} className="card-avatar" />
          </dd>
        </div>
        <div>
          <dt>Name</dt>
          <dd>{entry.name}</dd>
        </div>
        <div>
          <dt>Identity</dt>
          <dd>{entry.identity}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>Ready to Generate</dd>
        </div>
      </dl>
    </article>
  )
}

function SuccessPage({ entry, onReturnHome }) {
  useEffect(() => {
    const timer = window.setTimeout(onReturnHome, 2000)
    return () => window.clearTimeout(timer)
  }, [onReturnHome])

  return (
    <main className="screen success-screen">
      <AmbientStage />
      <section className="success-shell page-fade">
        <p className="eyebrow">VOICE JOINED</p>
        <h1>
          You are now part of the Ensemble.
          <span>你已加入合奏。</span>
        </h1>
        <EntryCard entry={entry} />
        <p className="look-up">请抬头看向大屏，等待合奏开始。</p>
        <button className="ghost-action" type="button" onClick={onReturnHome}>
          Back to Ensemble
        </button>
      </section>
    </main>
  )
}

function App() {
  const [isInviteExpired] = useState(isExpiredInvite)
  const [step, setStep] = useState('entrance')
  const [latestEntry, setLatestEntry] = useState(null)
  const [entries, setEntries] = useState(loadEntries)
  const [syncMessage, setSyncMessage] = useState('syncing')

  useEffect(() => {
    let ignore = false

    async function loadRemoteEntries() {
      try {
        const remoteEntries = await fetchCheckins()
        if (ignore) return
        localStorage.setItem(storageKey, JSON.stringify(remoteEntries))
        setEntries(remoteEntries)
        setSyncMessage('synced')
      } catch (error) {
        console.warn('Unable to load remote check-ins', error)
        if (!ignore) setSyncMessage('local')
      }
    }

    loadRemoteEntries()
    const interval = window.setInterval(loadRemoteEntries, 15000)
    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [])

  async function handleSubmit(entry) {
    try {
      const savedEntry = await createCheckin(entry)
      const nextEntries = [...entries, savedEntry]
      localStorage.setItem(storageKey, JSON.stringify(nextEntries))
      setLatestEntry(savedEntry)
      setEntries(nextEntries)
      setSyncMessage('synced')
    } catch (error) {
      console.warn('Unable to save remote check-in', error)
      const nextEntries = saveEntry(entry)
      setLatestEntry(entry)
      setEntries(nextEntries)
      setSyncMessage('local')
    }
    setStep('success')
  }

  return (
    <div className="app">
      {isInviteExpired ? (
        <ExpiredPage />
      ) : (
        <>
          {step === 'entrance' && (
            <EntrancePage entries={entries} onEnter={() => setStep('form')} />
          )}
          {step === 'form' && <CheckInForm onSubmit={handleSubmit} />}
          {step === 'success' && latestEntry && (
            <SuccessPage
              entry={latestEntry}
              onReturnHome={() => {
                setLatestEntry(null)
                setStep('entrance')
              }}
            />
          )}
        </>
      )}
      <aside className="entry-counter" aria-label="local entry count">
        {syncMessage === 'synced' ? 'synced voices' : syncMessage === 'syncing' ? 'syncing voices' : 'local voices'}: {entries.length}
      </aside>
    </div>
  )
}

export default App
