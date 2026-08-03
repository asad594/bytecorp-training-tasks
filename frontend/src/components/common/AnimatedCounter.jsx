import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()

          const updateCounter = (currentTime) => {
            const elapsedTime = currentTime - startTime
            const progress = Math.min(elapsedTime / duration, 1)

            // Cubic ease-out deceleration
            const easeOutProgress = 1 - Math.pow(1 - progress, 3)
            const currentVal = easeOutProgress * end

            setCount(currentVal)

            if (progress < 1) {
              rafRef.current = requestAnimationFrame(updateCounter)
            } else {
              setCount(end)
            }
          }

          rafRef.current = requestAnimationFrame(updateCounter)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [end, duration])

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  )
}
