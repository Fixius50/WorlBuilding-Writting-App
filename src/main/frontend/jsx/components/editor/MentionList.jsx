
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex items-center w-full text-left px-3 py-2 text-sm transition-colors ${
              index === selectedIndex ? 'bg-indigo-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
             <span className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded mr-2 text-xs font-bold opacity-70">
                @
             </span>
             {item}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-zinc-500">
          No result
        </div>
      )}
    </div>
  )
})
