import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/shared/components/MobileLayout'

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const introRef = useRef<HTMLDivElement>(null)
  const spacesRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    setMenuOpen(false)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const bottom = (
    <div style={{ display: 'flex', gap: 12 }}>
      <button className="btn secondary" style={{ flex: 1 }} onClick={() => setMenuOpen(true)}>Thông tin</button>
      <button className="btn" style={{ flex: 1 }} onClick={() => navigate('/book')}>Đặt lịch ngay</button>
    </div>
  )

  return (
    <MobileLayout bottom={bottom}>
      <h1 className="title">UPGEN Coworking</h1>
      <p className="subtitle">Không gian làm việc chung hiện đại, linh hoạt, tối ưu chi phí.</p>

      <div ref={introRef} className="section">
        <h3 style={{ marginTop: 0 }}>Tại sao chọn chúng tôi?</h3>
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          <li>Vị trí trung tâm, tiện di chuyển</li>
          <li>Không gian yên tĩnh, đầy đủ tiện nghi</li>
          <li>Hỗ trợ linh hoạt theo giờ/ngày</li>
        </ul>
      </div>

      <div ref={spacesRef} className="section">
        <h3 style={{ marginTop: 0 }}>Không gian</h3>
        <p>Open Desk, Private Office, Meeting Room, Event Space...</p>
      </div>

      <div ref={servicesRef} className="section">
        <h3 style={{ marginTop: 0 }}>Dịch vụ</h3>
        <p>Coffee/Tea, In/Out Printing, Locker, Projector...</p>
      </div>

      <div ref={faqRef} className="section">
        <h3 style={{ marginTop: 0 }}>Câu hỏi thường gặp</h3>
        <p>Giờ mở cửa, chính sách hủy, thanh toán...</p>
      </div>

      {menuOpen && (
        <div className="sheet" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 4 }}>Danh mục</h3>
          <div className="list-item" onClick={() => scrollTo(introRef)}><span>Giới thiệu</span></div>
          <div className="list-item" onClick={() => scrollTo(spacesRef)}><span>Không gian</span></div>
          <div className="list-item" onClick={() => scrollTo(servicesRef)}><span>Dịch vụ</span></div>
          <div className="list-item" onClick={() => scrollTo(faqRef)}><span>FAQ</span></div>
          <button className="btn full" style={{ marginTop: 12 }} onClick={() => setMenuOpen(false)}>Đóng</button>
        </div>
      )}
    </MobileLayout>
  )
}


