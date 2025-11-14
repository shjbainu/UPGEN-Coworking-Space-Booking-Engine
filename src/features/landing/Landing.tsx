import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/shared/components/MobileLayout'

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Refs for sections
  const overviewRef = useRef<HTMLDivElement>(null)
  const spacesRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const branchesRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', ref: overviewRef },
    { id: 'spaces', label: 'Không gian tại UPGEN', ref: spacesRef },
    { id: 'services', label: 'Dịch vụ và tiện ích', ref: servicesRef },
    { id: 'branches', label: 'Chi nhánh UPGEN', ref: branchesRef },
    { id: 'faq', label: 'Câu hỏi thường gặp', ref: faqRef }
  ]

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    setMenuOpen(false)
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Click outside to close menu
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const bottom = (
    <div style={{ 
      display: 'flex', 
      gap: 12, 
      alignItems: 'center',
      padding: '8px 16px'
    }}>
      <button 
        className="btn secondary" 
        style={{ 
          flex: 1,
          height: 48, 
          padding: 0,
          borderRadius: '24px',
          background: '#000',
          color: '#fff',
          border: '1px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }} 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          <line x1="9" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
          <line x1="9" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
          <line x1="9" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <button 
        className="btn" 
        style={{ 
          flex: 3,
          height: 48,
          background: '#000',
          color: '#fff',
          borderRadius: '24px',
          border: '1px solid #fff',
          fontWeight: 600,
          cursor: 'pointer'
        }} 
        onClick={() => navigate('/book')}
      >
        Đặt lịch ngay
      </button>
    </div>
  )

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000' }}>
      <MobileLayout bottom={bottom}>
        <div style={{ paddingBottom: 100, background: '#000' }}>
          {/* Hero image at top */}
          <div style={{
            position: 'relative',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            marginTop: -16,
            height: '90vh',
            minHeight: 700,
            overflow: 'hidden'
          }}>
            <img 
              src="/background.jpg" 
              alt="UPGEN Coworking Space"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)'
            }} />
          </div>

          <div ref={overviewRef} className="section" style={{ background: 'rgba(255,255,255,0.95)', marginTop: 24 }}>
            <h3 style={{ marginTop: 0 }}>Tổng quan</h3>
            <p>UPGEN Coworking Space mang đến không gian làm việc chuyên nghiệp, hiện đại với đầy đủ tiện ích. Phù hợp cho freelancer, startup và doanh nghiệp vừa và nhỏ.</p>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li>Vị trí trung tâm, tiện di chuyển</li>
              <li>Không gian yên tĩnh, đầy đủ tiện nghi</li>
              <li>Hỗ trợ linh hoạt theo giờ/ngày</li>
              <li>WiFi tốc độ cao, không giới hạn</li>
            </ul>
          </div>

          <div ref={spacesRef} className="section" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <h3 style={{ marginTop: 0 }}>Không gian tại UPGEN</h3>
            <p>Chúng tôi cung cấp đa dạng loại không gian phù hợp với nhu cầu của bạn:</p>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li><strong>Ghế đơn:</strong> Không gian cá nhân linh hoạt hoặc cố định</li>
              <li><strong>Ghế đôi:</strong> Phù hợp cho cặp đôi hoặc nhóm nhỏ</li>
              <li><strong>Ghế nhóm:</strong> Không gian mở cho nhóm làm việc</li>
              <li><strong>Phòng private:</strong> Phòng riêng biệt, yên tĩnh</li>
              <li><strong>Phòng họp:</strong> Phòng họp nhỏ và lớn với thiết bị đầy đủ</li>
              <li><strong>Không gian sự kiện:</strong> Không gian rộng rãi cho sự kiện, workshop</li>
            </ul>
          </div>

          <div ref={servicesRef} className="section" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <h3 style={{ marginTop: 0 }}>Dịch vụ và tiện ích</h3>
            <p>UPGEN cung cấp đầy đủ dịch vụ hỗ trợ công việc của bạn:</p>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li><strong>In ấn:</strong> In tài liệu với chất lượng cao</li>
              <li><strong>Cà phê/Trà:</strong> Đồ uống miễn phí trong không gian</li>
              <li><strong>Tủ khóa:</strong> Lưu trữ đồ cá nhân an toàn</li>
              <li><strong>Máy chiếu:</strong> Thiết bị trình chiếu cho meeting</li>
              <li><strong>WiFi:</strong> Internet tốc độ cao không giới hạn</li>
              <li><strong>Điều hòa:</strong> Không gian mát mẻ, thoải mái</li>
            </ul>
          </div>

          <div ref={branchesRef} className="section" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <h3 style={{ marginTop: 0 }}>Chi nhánh UPGEN</h3>
            <p>Hiện tại UPGEN đang phục vụ tại:</p>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginTop: 8 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>UPGEN Coworking Space</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
                Địa chỉ: [Cập nhật địa chỉ]<br />
                Giờ mở cửa: 8:00 - 20:00 hàng ngày<br />
                Hotline: [Cập nhật số điện thoại]
              </p>
            </div>
          </div>

          <div ref={faqRef} className="section" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <h3 style={{ marginTop: 0 }}>Câu hỏi thường gặp</h3>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Giờ mở cửa?</p>
              <p style={{ marginTop: 0, color: '#64748b' }}>UPGEN mở cửa từ 8:00 - 20:00 hàng ngày, kể cả cuối tuần.</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Chính sách hủy đặt chỗ?</p>
              <p style={{ marginTop: 0, color: '#64748b' }}>Bạn có thể hủy đặt chỗ trước 2 giờ để được hoàn tiền 100%.</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Phương thức thanh toán?</p>
              <p style={{ marginTop: 0, color: '#64748b' }}>Chấp nhận thanh toán bằng tiền mặt, chuyển khoản, hoặc thẻ tín dụng.</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Có WiFi không?</p>
              <p style={{ marginTop: 0, color: '#64748b' }}>Có, WiFi tốc độ cao miễn phí cho tất cả khách hàng.</p>
            </div>
          </div>
        </div>
      </MobileLayout>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu dropdown */}
      {menuOpen && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            bottom: 64,
            left: 16,
            right: 16,
            background: 'rgba(0, 0, 0, 0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ padding: '8px 0' }}>
            {menuItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => scrollTo(item.ref)}
                style={{
                  padding: '12px 16px',
                  borderBottom: idx < menuItems.length - 1 ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: '#fff',
                    display: 'inline-block'
                  }} />
                  <span style={{ color: '#fff', fontSize: 15 }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
