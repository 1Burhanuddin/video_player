import { useEffect, useRef, useState } from 'react'

function SecureVideo() {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

  const hideControlsTimeout = useRef(null)
  const progressBarRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragging, setDragging] = useState(false)

  const playerId = 'youtube-player-unique'

  // 🔐 Dev Tools Strict Blocker
  const handleDevToolsDetection = () => {
    const threshold = 160
    const isDevTools = window.outerWidth - window.innerWidth > threshold ||
                       window.outerHeight - window.innerHeight > threshold

    if (isDevTools) {
      localStorage.setItem('devtools_detected', 'true')

      // Force logout + redirect
      fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      }).finally(() => {
        window.location.href = '/'
      })

      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }

  // 🔐 Prevent access on page load if devtools previously detected
  useEffect(() => {
    if (localStorage.getItem('devtools_detected') === 'true') {
      fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      }).finally(() => {
        window.location.href = '/'
      })
    }

    const detectInterval = setInterval(handleDevToolsDetection, 1000)
    window.addEventListener('resize', handleDevToolsDetection)
    document.addEventListener('keydown', (e) => {
      const keys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key),
        e.ctrlKey && e.key === 'U'
      ]
      if (keys.some(Boolean)) {
        e.preventDefault()
        handleDevToolsDetection()
      }
    })

    window.onbeforeunload = () => {
      localStorage.removeItem('devtools_detected')
    }

    return () => {
      clearInterval(detectInterval)
      window.removeEventListener('resize', handleDevToolsDetection)
    }
  }, [])

  // 🎥 Create YouTube Player
  useEffect(() => {
    function createPlayer() {
      if (playerRef.current) return
      const playerDiv = document.getElementById(playerId)
      if (!playerDiv || !window.YT || !window.YT.Player) return

      playerRef.current = new window.YT.Player(playerId, {
        height: '360',
        width: '640',
        videoId: 'dqFY2ijqM-4',
        playerVars: {
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event) => {
            const state = window.YT.PlayerState
            if (event.data === state.PLAYING) {
              setIsPlaying(true)
              setIsPaused(false)
              setShowControls(true)
              setVideoEnded(false)
              startHideControlsTimer()
            } else if (event.data === state.PAUSED) {
              setIsPaused(true)
              setShowControls(true)
            } else if (event.data === state.ENDED) {
              setIsPlaying(false)
              setVideoEnded(true)
              setShowControls(true)
            }
          }
        }
      })
    }

    window.onYouTubeIframeAPIReady = createPlayer
    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.id = 'youtube-iframe-api'
      document.head.appendChild(tag)
    }

    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [])

  // 🔁 Video playback update
  useEffect(() => {
    let raf
    const update = () => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const d = playerRef.current.getDuration()
        const t = playerRef.current.getCurrentTime()
        setDuration(d)
        if (!dragging && d > 0) setProgress(t / d)
      }
      raf = requestAnimationFrame(update)
    }

    if (playerRef.current && isPlaying) {
      raf = requestAnimationFrame(update)
    }

    return () => raf && cancelAnimationFrame(raf)
  }, [dragging, isPlaying])

  const startHideControlsTimer = () => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }

  const handlePlayClick = () => {
    playerRef.current?.playVideo()
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handlePauseClick = () => {
    playerRef.current?.pauseVideo()
    setIsPaused(true)
  }

  const handleResumeClick = () => {
    playerRef.current?.playVideo()
    setIsPaused(false)
  }

  const handleRewindClick = () => {
    const t = playerRef.current?.getCurrentTime?.()
    if (t >= 10) playerRef.current?.seekTo(t - 10, true)
  }

  const handleReplayClick = () => {
    playerRef.current?.seekTo(0)
    playerRef.current?.playVideo()
    setVideoEnded(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handlePointerDown = (e) => {
    setDragging(true)
    moveThumb(e)
    window.addEventListener('pointermove', moveThumb)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerUp = (e) => {
    setDragging(false)
    moveThumb(e, true)
    window.removeEventListener('pointermove', moveThumb)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const moveThumb = (e, seek = false) => {
    if (!progressBarRef.current || !playerRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX : e.clientX
    let percent = (x - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))
    setProgress(percent)
    if (seek && playerRef.current.seekTo && duration) {
      playerRef.current.seekTo(percent * duration, true)
    }
  }

  const formatTime = (sec) => {
    if (!isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className="youtube-container"
      onMouseMove={() => {
        if (isPlaying && !isPaused) {
          setShowControls(true)
          startHideControlsTimer()
        }
      }}
      style={{ position: 'relative' }}
    >
      <div id={playerId}></div>

      <div
        className="video-overlay"
        style={{ pointerEvents: 'none' }}
      >
        {(isPlaying || isPaused) && showControls && (
          <div
            className="rewind-button"
            style={{ pointerEvents: 'auto' }}
            onClick={handleRewindClick}
            title="Rewind 10 seconds"
          >
            ⏪
          </div>
        )}
        {!isPlaying && playerReady && (
          <div className="play-button" style={{ pointerEvents: 'auto' }} onClick={handlePlayClick} />
        )}
        {isPlaying && isPaused && showControls && (
          <div className="resume-button" style={{ pointerEvents: 'auto' }} onClick={handleResumeClick} />
        )}
        {isPlaying && !isPaused && showControls && (
          <div className="pause-button" style={{ pointerEvents: 'auto' }} onClick={handlePauseClick} />
        )}
        {isPlaying && showControls && (
          <div className="fullscreen-button" style={{ pointerEvents: 'auto' }} onClick={toggleFullscreen}>
            {isFullscreen ? '⤢' : '⤢'}
          </div>
        )}
        {videoEnded && (
          <div className="replay-container" onClick={handleReplayClick}>
            <span>↺ Replay</span>
          </div>
        )}
      </div>

      <div
        ref={progressBarRef}
        className="yt-progress-bar"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          userSelect: 'none',
          zIndex: 10
        }}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <span style={{ color: '#fff', fontSize: 12, marginRight: 8 }}>
          {formatTime(progress * duration)}
        </span>
        <div style={{
          flex: 1,
          height: 6,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 3,
          position: 'relative',
          cursor: 'pointer'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #646cff, #00c6ff)',
            borderRadius: 3
          }} />
          <div style={{
            position: 'absolute',
            left: `calc(${progress * 100}% - 8px)`,
            top: -4,
            width: 16,
            height: 16,
            background: '#fff',
            borderRadius: '50%',
            border: '2px solid #646cff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }} />
        </div>
        <span style={{ color: '#fff', fontSize: 12, marginLeft: 8 }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default SecureVideo
