import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.id, label: item.label })
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

  useEffect(() => setSelectedIndex(0), [props.items])

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
    <div className="items bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden min-w-[200px] p-2 animate-in zoom-in-95 duration-200">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center text-xs px-4 py-2.5 rounded-lg outline-none text-left transition-all ${index === selectedIndex ? 'bg-primary text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50'
              }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="material-symbols-outlined text-[14px] mr-2 opacity-50">auto_stories</span>
            <span className="font-serif font-bold">{item.label}</span>
          </button>
        ))
      ) : (
        <div className="item text-sm px-2 py-1.5 text-muted-foreground">No result</div>
      )}
    </div>
  )
})

export default MentionList
