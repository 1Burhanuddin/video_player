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

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current) return;
      const playerDiv = document.getElementById(playerId);
      if (!playerDiv) return; // Wait until the div is mounted
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
              startHideControlsTimer()
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(true)
              setIsPaused(true)
              setShowControls(true)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false)
              setIsPaused(false)
              setShowControls(true)
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
    // Prevent right click on the whole container
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }
    document.addEventListener('contextmenu', handleContextMenu)

    // Prevent inspect element and dev tools
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

    // Detect dev tools
    const handleDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true)
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleDevTools)

    // Initial check
    handleDevTools()

    // Cleanup
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

  // Add rewind handler
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
      {/* Transparent overlay to block YouTube context menu */}
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
        {/* Rewind button: show when playing or paused and controls are visible */}
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
        {/* Controls get pointer events */}
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
      </div>
    </div>
  )
}

export default SecureVideo 