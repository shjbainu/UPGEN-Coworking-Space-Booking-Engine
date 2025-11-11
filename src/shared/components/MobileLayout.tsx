import React from 'react'

type MobileLayoutProps = {
  children: React.ReactNode
  bottom?: React.ReactNode
}

export default function MobileLayout({ children, bottom }: MobileLayoutProps) {
  return (
    <div className="container" style={{ paddingBottom: bottom ? 88 : 16 }}>
      {children}
      {bottom && <div className="bottom-bar">{bottom}</div>}
    </div>
  )
}


