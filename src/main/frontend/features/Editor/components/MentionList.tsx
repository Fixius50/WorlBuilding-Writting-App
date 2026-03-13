import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command({
        id: item.id,
        label: item.label,
        type: item.type,
        desc: item.description
      })
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
        props.items.map((item, index) => {
          const getIconAndColor = (type) => {
            switch (type?.toLowerCase()) {
              case 'individual': return { icon: 'person', color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
              case 'location': return { icon: 'public', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
              case 'group': return { icon: 'groups', color: 'text-purple-400', bg: 'bg-purple-500/10' };
              case 'timeline': return { icon: 'history', color: 'text-orange-400', bg: 'bg-orange-500/10' };
              case 'event': return { icon: 'event', color: 'text-red-400', bg: 'bg-red-500/10' };
              case 'item': return { icon: 'token', color: 'text-amber-400', bg: 'bg-amber-500/10' };
              default: return { icon: 'auto_stories', color: 'text-slate-400', bg: 'bg-slate-500/10' };
            }
          };
          const style = getIconAndColor(item.type);

          return (
            <button
              className={`flex w-full items-center text-xs px-3 py-2 rounded-lg outline-none text-left transition-all gap-3 ${index === selectedIndex
                ? 'bg-primary text-white shadow-lg scale-[1.02]'
                : 'text-slate-300 hover:bg-white/5'
                }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className={`p-1 rounded flex items-center justify-center ${index === selectedIndex ? 'bg-white/20' : style.bg}`}>
                <span className={`material-symbols-outlined text-[14px] ${index === selectedIndex ? 'text-white' : style.color}`}>
                  {style.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm">{item.label}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-60 font-medium">{item.type}</span>
              </div>
            </button>
          );
        })
      ) : (
        <div className="item text-xs px-4 py-3 text-slate-500 italic text-center">No results found</div>
      )}
    </div>
  )
})

export default MentionList
