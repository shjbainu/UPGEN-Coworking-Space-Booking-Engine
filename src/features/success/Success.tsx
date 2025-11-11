import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/shared/components/MobileLayout'
import { useBooking } from '@/providers/BookingContext'

export default function Success() {
  const navigate = useNavigate()
  const { checkin, checkout, spaces, services, totalAmount, customer, clear } = useBooking()

  const handleGoHome = () => {
    clear()
    navigate('/')
  }

  const bottom = (
    <button className="btn full" onClick={handleGoHome}>Về trang chủ</button>
  )

  const formatDateTime = (iso: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <MobileLayout bottom={bottom}>
      <h2 className="title">Đặt chỗ thành công</h2>
      <p className="subtitle">Cảm ơn bạn đã đặt chỗ. Chúng tôi sẽ liên hệ xác nhận sớm.</p>

      {customer && (
        <div className="section">
          <h4 style={{ margin: 0, marginBottom: 8 }}>Thông tin khách hàng</h4>
          <div className="list-item">
            <div>Họ tên</div>
            <div>{customer.name}</div>
          </div>
          <div className="list-item">
            <div>Số điện thoại</div>
            <div>{customer.phone}</div>
          </div>
          {customer.email && (
            <div className="list-item">
              <div>Email</div>
              <div>{customer.email}</div>
            </div>
          )}
        </div>
      )}

      <div className="section">
        <h4 style={{ margin: 0, marginBottom: 8 }}>Chi tiết đặt chỗ</h4>
        <div className="list-item">
          <div>Check-in</div>
          <div>{formatDateTime(checkin)}</div>
        </div>
        <div className="list-item">
          <div>Check-out</div>
          <div>{formatDateTime(checkout)}</div>
        </div>
      </div>

      <div className="section">
        <h4 style={{ margin: 0, marginBottom: 8 }}>Không gian đã chọn</h4>
        {spaces.length === 0 ? (
          <div style={{ color: '#64748b' }}>Chưa có</div>
        ) : (
          spaces.map(s => (
            <div key={s.spaceId} className="list-item">
              <div>{s.spaceTypeName} • {s.spaceId}</div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h4 style={{ margin: 0, marginBottom: 8 }}>Dịch vụ đã chọn</h4>
        {services.length === 0 ? (
          <div style={{ color: '#64748b' }}>Chưa có</div>
        ) : (
          services.map(s => (
            <div key={s.serviceId} className="list-item">
              <div>{s.serviceName} x{s.quantity}</div>
              <div>{(s.unitPrice * s.quantity).toLocaleString('vi-VN')}đ</div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <div className="list-item">
          <strong>Tổng tiền</strong>
          <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
        </div>
      </div>

      <div className="section">
        <p style={{ color: '#64748b', fontSize: 14 }}>Vui lòng kiểm tra tin nhắn/SMS hoặc email để nhận thông tin chi tiết.</p>
      </div>
    </MobileLayout>
  )
}


