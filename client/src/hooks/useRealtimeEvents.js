import { useEffect, useRef } from 'react'

const useRealtimeEvents = (events, handler) => {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const key = events.join('|')

  useEffect(() => {
    const listeners = events.map((eventName) => {
      const listener = () => handlerRef.current && handlerRef.current()
      window.addEventListener(eventName, listener)
      return { eventName, listener }
    })
    return () => {
      listeners.forEach(({ eventName, listener }) => {
        window.removeEventListener(eventName, listener)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

export default useRealtimeEvents
