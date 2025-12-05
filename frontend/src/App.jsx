import { useState, useEffect } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0) // Mock progress for cute UI
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [serverStatus, setServerStatus] = useState('sleeping') // sleeping, waking, ready

  // Initialize Dark Mode based on system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  // Update HTML class for Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Server Wake-up Logic
  useEffect(() => {
    const wakeUpServer = async () => {
      setServerStatus('waking')
      try {
        const start = Date.now()
        const res = await fetch('/api/health')
        if (res.ok) {
          const elapsed = Date.now() - start
          // If response was too fast, add a small delay for smoother UI transition
          if (elapsed < 800) await new Promise(r => setTimeout(r, 800))
          setServerStatus('ready')
        } else {
          throw new Error('Health check failed')
        }
      } catch (err) {
        console.error("Server wake-up failed (retrying in 5s...)", err)
        // Simple retry logic could go here, for now stick to 'waking' or set error
        setTimeout(wakeUpServer, 5000)
      }
    }

    wakeUpServer()
  }, [])

  // Mock progress animation
  useEffect(() => {
    if (status === 'uploading') {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 500)
      return () => clearInterval(interval)
    } else if (status === 'success') {
      setUploadProgress(100)
    } else {
      setUploadProgress(0)
    }
  }, [status])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setErrorMsg('')
      setStatus('idle')
    } else {
      setFile(null)
      setErrorMsg('Please select a valid PDF file.')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    setErrorMsg('')
    setDownloadUrl('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Use the Vite proxy for /api -> http://127.0.0.1:8001/api
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Conversion failed')
      }

      const data = await response.json()

      // Backend now returns JSON with download_url
      const serverDownloadUrl = data.download_url

      setDownloadUrl(serverDownloadUrl)
      // We reverted server to pure PPTX download, so we expect .pptx
      setDownloadFilename(file.name.replace(/\.pdf$/i, '.pptx'))

      setStatus('success')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred during conversion.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden flex items-center justify-center transition-colors duration-500 bg-brand-50 dark:bg-slate-900">

      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-900 dark:mix-blend-lighten"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-900 dark:mix-blend-lighten"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-brand-900 dark:mix-blend-lighten"></div>

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 shadow-lg hover:scale-110 transition-transform active:scale-95 z-50 group cursor-pointer"
      >
        {darkMode ? (
          <span className="text-2xl group-hover:rotate-12 transition-transform block">🌙</span>
        ) : (
          <span className="text-2xl group-hover:rotate-90 transition-transform block">☀️</span>
        )}
      </button>

      {/* Main Glass Card */}
      <div className="relative w-full max-w-lg mx-4">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20"></div>

        <div className="relative p-10 flex flex-col items-center">

          {/* Header */}
          <div className="mb-8 text-center animate-fade-in relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30 mb-4 transform rotate-3">
              <span className="text-3xl text-white">✨</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
              PDF to PPTX
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
              Convert slides to editable magic
            </p>

            {/* Server Status Indicator */}
            <div className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-500
              ${serverStatus === 'ready'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 scale-100'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 scale-110 animate-pulse'
              }
            `}>
              {serverStatus === 'ready' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Server Ready
                </>
              ) : (
                <>
                  <span className="text-sm">😴</span>
                  Waking up server...
                </>
              )}
            </div>
          </div>

          {/* Upload Zone */}
          <div className="w-full relative group">
            <div className={`
              relative w-full aspect-[4/3] rounded-3xl border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center
              ${file
                ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-500'
                : 'border-slate-300 hover:border-brand-400 bg-white/50 hover:bg-white/80 dark:bg-white/5 dark:border-slate-600 dark:hover:border-slate-400'
              }
            `}>
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                onChange={handleFileChange}
                disabled={serverStatus !== 'ready'}
              />

              {file ? (
                <div className="text-center p-6 animate-fade-in">
                  <div className="text-6xl mb-4 drop-shadow-md">📄</div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-lg break-all line-clamp-2 px-4">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    className="mt-4 text-xs font-bold text-red-400 hover:text-red-500 transition-colors z-20 relative pointer-events-auto"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
                  <div className="text-6xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    {serverStatus === 'ready' ? '☁️' : '💤'}
                  </div>
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-lg">
                    {serverStatus === 'ready' ? 'Drop your PDF here' : 'Server is napping...'}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    {serverStatus === 'ready' ? 'or click to browse' : 'Please wait a moment'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="w-full mt-8 space-y-4">
            {/* Error Message */}
            {status === 'error' && (
              <div className="p-4 rounded-2xl bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium text-center animate-fade-in backdrop-blur-sm">
                ❌ {errorMsg}
              </div>
            )}

            {/* Progress Bar */}
            {status === 'uploading' && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden relative">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Main Button */}
            {status === 'success' ? (
              <a
                href={downloadUrl}
                download={downloadFilename}
                className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 text-white font-bold text-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full"></span>
                <span className="relative flex items-center gap-2">
                  Download PowerPoint 🎉
                </span>
              </a>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading' || serverStatus !== 'ready'}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center
                  ${!file || status === 'uploading' || serverStatus !== 'ready'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  }
                `}
              >
                {status === 'uploading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : serverStatus !== 'ready' ? 'Waking up Server...' : 'Convert Magic ✨'}
              </button>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              Powered by <span className="font-semibold">Upstage Document AI</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
