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
    <div className="items bg-popover border border-border rounded-md shadow-lg overflow-hidden min-w-[200px] p-1">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center text-sm px-2 py-1.5 rounded-sm outline-none text-left ${index === selectedIndex ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
              }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className="item text-sm px-2 py-1.5 text-muted-foreground">No result</div>
      )}
    </div>
  )
})

export default MentionList
