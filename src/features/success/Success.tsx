import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import MobileLayout from '@/shared/components/MobileLayout'
import { useBooking } from '@/providers/BookingContext'

export default function Success() {
  const navigate = useNavigate()
  const { checkin, checkout, spaces, services, totalAmount, customer, bookingId, estimatedHours, clear } = useBooking()
  const [emailSent, setEmailSent] = useState(false)

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

  const formatDuration = (hours: number) => {
    if (!hours || hours <= 0 || !Number.isFinite(hours)) return '0p'
    const totalMinutes = Math.round(hours * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    if (h > 0 && m > 0) return `${h}h${m}p`
    if (h > 0) return `${h}h`
    if (m > 0) return `${m}p`
    return '0p'
  }

  // Send email confirmation when component mounts
  useEffect(() => {
    if (emailSent || !customer?.email || !bookingId) {
      if (!customer?.email) {
        // eslint-disable-next-line no-console
        console.log('Email not sent: customer email is missing')
      }
      return
    }

    const sendEmail = async () => {
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

        if (!serviceId || !templateId || !publicKey) {
          // eslint-disable-next-line no-console
          console.warn('EmailJS configuration missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env file')
          return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(customer.email)) {
          // eslint-disable-next-line no-console
          console.error('Invalid email format:', customer.email)
          return
        }

        // Prepare email template data
        const spaceItems = spaces.map(s => ({
          name: `${s.spaceTypeName} • ${s.spaceId}`,
          duration: formatDuration(estimatedHours),
          price: (s.unitPriceHourly * estimatedHours).toLocaleString('vi-VN')
        }))

        const serviceItems = services.map(s => ({
          name: s.serviceName,
          quantity: s.quantity,
          price: (s.unitPrice * s.quantity).toLocaleString('vi-VN')
        }))

        // Format template parameters for EmailJS
        // Important: EmailJS requires recipient email in template parameters
        // Try multiple variable names for compatibility
        const recipientEmail = customer.email.trim()
        const templateParams: Record<string, string> = {
          // Try all possible recipient email variable names
          to_email: recipientEmail,
          email: recipientEmail,
          user_email: recipientEmail,
          recipient_email: recipientEmail,
          to_name: customer.name,
          reply_to: recipientEmail,
          order_id: bookingId,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: recipientEmail,
          checkin: formatDateTime(checkin),
          checkout: formatDateTime(checkout),
          spaces_html: spaceItems.map(s => 
            `<tr style="vertical-align: top">
              <td style="padding: 12px 8px 0 4px; width: 100%">
                <div><strong>${s.name}</strong></div>
                <div style="font-size: 14px; color: #888; padding-top: 4px">Thời gian: ${s.duration}</div>
              </td>
              <td style="padding: 12px 4px 0 0; white-space: nowrap; text-align: right">
                <strong>${s.price}₫</strong>
              </td>
            </tr>`
          ).join(''),
          services_html: serviceItems.length > 0 ? serviceItems.map(s => 
            `<tr style="vertical-align: top">
              <td style="padding: 12px 8px 0 4px; width: 100%">
                <div><strong>${s.name}</strong></div>
                <div style="font-size: 14px; color: #888; padding-top: 4px">Số lượng: ${s.quantity}</div>
              </td>
              <td style="padding: 12px 4px 0 0; white-space: nowrap; text-align: right">
                <strong>${s.price}₫</strong>
              </td>
            </tr>`
          ).join('') : '<tr><td colspan="2" style="padding: 12px 8px; color: #888;">Chưa chọn dịch vụ</td></tr>',
          total_amount: totalAmount.toLocaleString('vi-VN'),
          website_link: import.meta.env.VITE_WEBSITE_LINK || '#'
        }

        // eslint-disable-next-line no-console
        console.log('Sending email to:', customer.email, 'with params:', { ...templateParams, spaces_html: '[HTML]', services_html: '[HTML]' })

        await emailjs.send(serviceId, templateId, templateParams, publicKey)
        setEmailSent(true)
        // eslint-disable-next-line no-console
        console.log('Email sent successfully')
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to send email:', error)
        // eslint-disable-next-line no-console
        console.error('Error details:', {
          status: error?.status,
          text: error?.text,
          customerEmail: customer.email,
          hasEmail: !!customer.email
        })
        // Don't show error to user, just log it
      }
    }

    sendEmail()
  }, [customer, bookingId, spaces, services, totalAmount, checkin, checkout, estimatedHours, emailSent])

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


