import { useEffect, useRef, useState } from 'react'

function SecureVideo() {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const hideControlsTimeout = useRef(null)
  const playerId = 'youtube-player-unique'

  
  const [progress, setProgress] = useState(0); 
  const [dragging, setDragging] = useState(false);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef(null);
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current) return;
      const playerDiv = document.getElementById(playerId);
      if (!playerDiv) return; 
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
          onReady: (event) => {
            setPlayerReady(true)
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              setIsPaused(false)
              setShowControls(true)
              setVideoEnded(false)
              startHideControlsTimer()
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(true)
              setIsPaused(true)
              setShowControls(true)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false)
              setIsPaused(false)
              setShowControls(true)
              setVideoEnded(true)
            }
          },
          onError: (event) => {
            console.error('Player Error:', event.data)
          }
        }
      })
    }
    window.onYouTubeIframeAPIReady = createPlayer;
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        tag.id = 'youtube-iframe-api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }
    }
    
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }
    document.addEventListener('contextmenu', handleContextMenu)

    
    const handleKeyDown = (e) => {
      const devToolsKeys = [
        { key: 'F12' },
        { key: 'I', ctrl: true, shift: true },
        { key: 'C', ctrl: true, shift: true },
        { key: 'J', ctrl: true, shift: true },
        { key: 'U', ctrl: true }
      ]

      const isDevToolsKey = devToolsKeys.some(
        ({ key, ctrl, shift }) => 
          e.key === key && 
          (!ctrl || e.ctrlKey) && 
          (!shift || e.shiftKey)
      )

      if (isDevToolsKey) {
        e.preventDefault()
        setIsDevToolsOpen(true)
        return false
      }
    }

    
    const handleDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true)
      }
    }

    
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleDevTools)

    
    handleDevTools()

    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleDevTools)
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [])

  const handlePlayClick = () => {
    console.log('Play clicked')
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo()
      setIsPlaying(true)
      setIsPaused(false)
    }
  }

  const handlePauseClick = () => {
    console.log('Pause clicked')
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo()
      setIsPaused(true)
    }
  }

  const handleResumeClick = () => {
    console.log('Resume clicked')
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo()
      setIsPaused(false)
    }
  }

  const startHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    if (isPlaying && !isPaused) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 2000)
    }
  }

  const handleMouseMove = () => {
    if (isPlaying && !isPaused) {
      setShowControls(true)
      startHideControlsTimer()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  
  const handleRewindClick = () => {
    if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.seekTo) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
    }
  }

  useEffect(() => {
    if (isPaused) {
      setShowControls(true)
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
    }
  }, [isPaused])

  
  useEffect(() => {
    let raf;
    function update() {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const d = playerRef.current.getDuration();
        const t = playerRef.current.getCurrentTime();
        setDuration(d);
        if (!dragging && d > 0) setProgress(t / d);
      }
      raf = requestAnimationFrame(update);
    }
    if (playerRef.current && isPlaying !== false) {
      raf = requestAnimationFrame(update);
    }
    return () => raf && cancelAnimationFrame(raf);
  }, [dragging, isPlaying]);

  
  function handlePointerDown(e) {
    setDragging(true);
    moveThumb(e);
    window.addEventListener("pointermove", moveThumb);
    window.addEventListener("pointerup", handlePointerUp);
  }
  function handlePointerUp(e) {
    setDragging(false);
    moveThumb(e, true);
    window.removeEventListener("pointermove", moveThumb);
    window.removeEventListener("pointerup", handlePointerUp);
  }
  function moveThumb(e, seek = false) {
    if (!progressBarRef.current || !playerRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (x - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    setProgress(percent);
    if (seek && playerRef.current.seekTo && duration) {
      playerRef.current.seekTo(percent * duration, true);
    }
  }
  
  function formatTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const handleReplayClick = () => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(0)
      playerRef.current.playVideo()
      setVideoEnded(false)
    }
  }

  if (isDevToolsOpen) {
    return (
      <div className="dev-tools-warning">
        <h2>Access Denied</h2>
        <p>Developer tools are not allowed on this page.</p>
        <p>Please close developer tools to continue.</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="youtube-container"
      onMouseMove={handleMouseMove}
      style={{ position: 'relative' }}
    >
      <div id={playerId} />
      
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          background: 'transparent',
          pointerEvents: 'auto',
        }}
        onContextMenu={e => e.preventDefault()}
      />
      <div 
        className="video-overlay"
        style={{ pointerEvents: 'none' }}
      >
        {(isPlaying || isPaused) && showControls && (
          <div
            className="rewind-button"
            style={{ pointerEvents: 'auto', position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: 60, height: 60, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, cursor: 'pointer' }}
            onClick={handleRewindClick}
            onContextMenu={e => e.preventDefault()}
            title="Rewind 10 seconds"
          >
            &#8630;
          </div>
        )}
        {!isPlaying && playerReady && (
          <div 
            className="play-button"
            style={{ pointerEvents: 'auto' }}
            onClick={handlePlayClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && isPaused && showControls && (
          <div 
            className="resume-button"
            style={{ pointerEvents: 'auto' }}
            onClick={handleResumeClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && !isPaused && showControls && (
          <div 
            className="pause-button"
            style={{ pointerEvents: 'auto' }}
            onClick={handlePauseClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && showControls && (
          <div 
            className="fullscreen-button"
            style={{ pointerEvents: 'auto' }}
            onClick={toggleFullscreen}
            onContextMenu={(e) => e.preventDefault()}
          >
            {isFullscreen ? '⤢' : '⤢'}
          </div>
        )}
        
        {videoEnded && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'black',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              zIndex: 3
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: 16
              }}
              onClick={handleReplayClick}
            >
              <span style={{ fontSize: 40, color: 'white' }}>↺</span>
            </div>
            <span style={{ color: 'white', fontSize: 18 }}>Replay Video</span>
          </div>
        )}
      </div>
      <div
        ref={progressBarRef}
        className="yt-progress-bar"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 32,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          zIndex: 10,
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <span style={{ color: "#fff", fontSize: 12, marginRight: 8 }}>
          {formatTime(progress * duration)}
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            position: "relative",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #646cff, #00c6ff)",
              borderRadius: 3,
              transition: dragging ? "none" : "width 0.1s",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `calc(${progress * 100}% - 8px)`,
              top: -4,
              width: 16,
              height: 16,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              border: "2px solid #646cff",
              cursor: "pointer",
              transition: dragging ? "none" : "left 0.1s",
              zIndex: 2,
            }}
          />
        </div>
        <span style={{ color: "#fff", fontSize: 12, marginLeft: 8 }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default SecureVideo 