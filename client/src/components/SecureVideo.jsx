import { useEffect, useRef, useState } from 'react'

function SecureVideo() {
  const containerRef = useRef(null)
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideControlsTimeout = useRef(null)

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

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
    document.addEventListener('contextmenu', handleContextMenu)
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
    }
  }, [])

  const handlePlayClick = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setShowControls(true)
    startHideControlsTimer()
  }

  const handlePauseClick = () => {
    setIsPaused(true)
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
  }

  const handleResumeClick = () => {
    setIsPaused(false)
    setShowControls(true)
    startHideControlsTimer()
  }

  const startHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isPaused) {
        setShowControls(false)
      }
    }, 2000)
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
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
    >
      <div 
        className="video-overlay"
        onContextMenu={(e) => e.preventDefault()}
      >
        {!isPlaying && (
          <div 
            className="play-button"
            onClick={handlePlayClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && isPaused && showControls && (
          <div 
            className="resume-button"
            onClick={handleResumeClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && !isPaused && showControls && (
          <div 
            className="pause-button"
            onClick={handlePauseClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {isPlaying && showControls && (
          <div 
            className="fullscreen-button"
            onClick={toggleFullscreen}
            onContextMenu={(e) => e.preventDefault()}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </div>
        )}
        <iframe
          width="100%"
          height="500"
          src={`https://www.youtube.com/embed/dqFY2ijqM-4?modestbranding=1&rel=0&showinfo=0&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1${isPlaying ? '&autoplay=1' : ''}`}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          style={{ 
            pointerEvents: 'none',
            opacity: isPaused ? 0.5 : 1
          }}
        />
      </div>
    </div>
  )
}

export default SecureVideo 