import { useEffect, useRef } from 'react'

function SecureVideo() {
  const containerRef = useRef(null)

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    // Prevent inspect element
    const handleKeyDown = (e) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      // Prevent Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      // Prevent Ctrl+Shift+C (Windows) or Cmd+Option+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }
    }

    // Prevent dev tools
    const handleDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = 'Developer tools are not allowed on this page.'
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleDevTools)

    // Initial check for dev tools
    handleDevTools()

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleDevTools)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="youtube-container"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        width="100%"
        height="500"
        src="https://www.youtube.com/embed/dqFY2ijqM-4"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default SecureVideo 