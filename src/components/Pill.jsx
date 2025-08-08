import React from 'react'

const Pill = ({ pill, onDrag }) => {
  const { id, x, y, width, height, color, borderRadius } = pill

  // Calculate CSS border-radius string (20px or 0px per corner)
  const radius = {
    borderTopLeftRadius: borderRadius.tl ? '20px' : '0px',
    borderTopRightRadius: borderRadius.tr ? '20px' : '0px',
    borderBottomLeftRadius: borderRadius.bl ? '20px' : '0px',
    borderBottomRightRadius: borderRadius.br ? '20px' : '0px',
  }

  return (
    <div
      onMouseDown={(e) => onDrag(e, id)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor: color,
        borderRadius: `${radius.borderTopLeftRadius} ${radius.borderTopRightRadius} ${radius.borderBottomRightRadius} ${radius.borderBottomLeftRadius}`,
        border: '4px solid #333',
        boxSizing: 'border-box',
        cursor: 'grab',
        userSelect: 'none',
      }}
      draggable={false}
    />
  )
}

export default Pill
