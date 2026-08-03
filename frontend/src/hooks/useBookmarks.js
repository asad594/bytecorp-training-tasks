import { useState, useEffect } from 'react'

export default function useBookmarks(storageKey = 'jobboard_bookmarks') {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(bookmarks))
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage:', e)
    }
  }, [bookmarks, storageKey])

  const toggleBookmark = (e, id) => {
    if (e && e.stopPropagation) e.stopPropagation()
    setBookmarks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const isBookmarked = (id) => !!bookmarks[id]

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
  }
}
