import { useEffect, useRef, useState } from 'react'

function SecureVideo() {
  const containerRef = useRef(null)
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

  useEffect(() => {

    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }


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


    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleDevTools)


    handleDevTools()


    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleDevTools)
    }
  }, [])

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