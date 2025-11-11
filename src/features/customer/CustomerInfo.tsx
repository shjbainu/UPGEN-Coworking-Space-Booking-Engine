import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/shared/components/MobileLayout'
import { useBooking } from '@/providers/BookingContext'
import { supabase } from '@/config/supabaseClient'
import { useState } from 'react'

export default function CustomerInfo() {
  const navigate = useNavigate()
  const { checkin, checkout, spaces, services, totalAmount, setCustomer, clear } = useBooking()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng điền Họ tên và Số điện thoại')
      return
    }
    setCustomer({ name, phone, email: email || undefined })
    setLoading(true)
    try {
      // 0) Validate booking data
      if (!checkin || !checkout || spaces.length === 0) {
        alert('Vui lòng chọn ngày giờ và ít nhất một không gian trước khi xác nhận.')
        setLoading(false)
        return
      }

      // 1) Find or create customer by phone
      const cleanPhone = phone.replace(/\D+/g, '').trim()
      let customerId: string
      const { data: found, error: findErr } = await supabase
        .from('Khách hàng')
        .select('customer_id, customer_name, customer_phone')
        .eq('customer_phone', cleanPhone)
        .limit(1)
        .maybeSingle()
      if (findErr) {
        // eslint-disable-next-line no-console
        console.error('Error finding customer by phone:', findErr)
        alert(`Không thể kiểm tra khách hàng: ${findErr.message}`)
        setLoading(false)
        return
      }
      if (found?.customer_id) {
        customerId = String(found.customer_id)
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('Khách hàng')
          .insert({
            customer_name: name.trim(),
            customer_phone: cleanPhone,
            customer_email: email?.trim() || null,
            customer_type_id: 1
          })
          .select('customer_id')
          .single()
        if (insertErr) {
          // Nếu trùng khoá chính do sequence bị lệch, retry với customer_id = max + 1
          const msg = insertErr.message?.toLowerCase() || ''
          if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
            const { data: maxCus, error: maxErr } = await supabase
              .from('Khách hàng')
              .select('customer_id')
              .order('customer_id', { ascending: false })
              .limit(1)
            if (maxErr) {
              // eslint-disable-next-line no-console
              console.error('Error reading max customer_id:', maxErr)
              alert(`Không thể tạo khách hàng: ${insertErr.message}`)
              setLoading(false)
              return
            }
            const nextId = (maxCus && maxCus.length > 0) ? (Number(maxCus[0].customer_id) || 0) + 1 : 1
            const { data: retryInserted, error: retryErr } = await supabase
              .from('Khách hàng')
              .insert({
                customer_id: nextId,
                customer_name: name.trim(),
                customer_phone: cleanPhone,
                customer_email: email?.trim() || null,
                customer_type_id: 1
              })
              .select('customer_id')
              .single()
            if (retryErr) {
              // eslint-disable-next-line no-console
              console.error('Retry create customer failed:', retryErr)
              alert(`Không thể tạo khách hàng: ${retryErr.message}`)
              setLoading(false)
              return
            }
            customerId = String(retryInserted.customer_id)
          } else {
            // eslint-disable-next-line no-console
            console.error('Error creating customer:', insertErr)
            alert(`Không thể tạo khách hàng: ${insertErr.message}`)
            setLoading(false)
            return
          }
        }
        else {
          customerId = String(inserted.customer_id)
        }
      }

      // 2) Create booking (follow management flow)
      // Try with optional booking_id (max+1) then fallback to DB auto
      let bookingId: string = ''
      const { data: maxBookings } = await supabase
        .from('đặt chỗ')
        .select('booking_id')
        .order('booking_id', { ascending: false })
        .limit(1)
      if (maxBookings && maxBookings.length > 0) {
        const maxId = Number(maxBookings[0].booking_id) || 0
        bookingId = String(maxId + 1)
      }
      const bookingInsert: any = {
        checkin,
        checkout,
        customer_id: customerId,
        booking_status: 'Chưa check-in',
        customer_source_id: 3
      }
      if (bookingId) bookingInsert.booking_id = bookingId
      const { data: bookingRes, error: bookingErr } = await supabase
        .from('đặt chỗ')
        .insert(bookingInsert)
        .select('booking_id')
        .single()
      if (bookingErr) {
        if (bookingErr.message?.toLowerCase().includes('duplicate')) {
          delete bookingInsert.booking_id
          const { data: retry, error: retryErr } = await supabase
            .from('đặt chỗ')
            .insert(bookingInsert)
            .select('booking_id')
            .single()
          if (retryErr) {
            alert(`Lỗi tạo đặt chỗ: ${retryErr.message}`)
            setLoading(false)
            return
          }
          bookingId = String(retry.booking_id)
        } else {
          alert(`Lỗi tạo đặt chỗ: ${bookingErr.message}`)
          setLoading(false)
          return
        }
      } else {
        bookingId = String(bookingRes.booking_id)
      }

      // 3) Create booking service (group) to attach service details
      let bookingServiceId: string = ''
      const { data: maxSvc } = await supabase
        .from('booking dịch vụ')
        .select('booking_service_id')
        .order('booking_service_id', { ascending: false })
        .limit(1)
      let bookingServiceInsert: any = {}
      if (maxSvc && maxSvc.length > 0) {
        const maxId = Number(maxSvc[0].booking_service_id) || 0
        bookingServiceInsert.booking_service_id = String(maxId + 1)
      }
      const { data: svcRes, error: svcErr } = await supabase
        .from('booking dịch vụ')
        .insert(bookingServiceInsert)
        .select('booking_service_id')
        .single()
      if (svcErr) {
        if (svcErr.message?.toLowerCase().includes('duplicate')) {
          const { data: retrySvc, error: retrySvcErr } = await supabase
            .from('booking dịch vụ')
            .insert({})
            .select('booking_service_id')
            .single()
          if (retrySvcErr) {
            alert(`Lỗi tạo booking dịch vụ: ${retrySvcErr.message}`)
            setLoading(false)
            return
          }
          bookingServiceId = String(retrySvc.booking_service_id)
        } else {
          alert(`Lỗi tạo booking dịch vụ: ${svcErr.message}`)
          setLoading(false)
          return
        }
      } else {
        bookingServiceId = String(svcRes.booking_service_id)
      }

      // 4) Create invoice with calculated total
      const { error: invoiceErr } = await supabase
        .from('hóa đơn')
        .insert({
          booking_id: bookingId,
          booking_service_id: bookingServiceId,
          total: totalAmount,
          payment_medthod: null,
          customer_id: customerId,
          create_date: new Date().toISOString()
        })
      if (invoiceErr) {
        alert(`Lỗi tạo hóa đơn: ${invoiceErr.message}`)
        setLoading(false)
        return
      }

      // 5) Insert booking details for each selected space
      for (const sp of spaces) {
        const insert: any = { booking_id: bookingId, space_id: sp.spaceId }
        const idNum = Number(bookingId)
        const spNum = Number(sp.spaceId)
        if (!isNaN(idNum) && !isNaN(spNum)) {
          insert.booking_id = idNum
          insert.space_id = spNum
        }
        const { error: detailErr } = await supabase
          .from('chi tiết đặt chỗ')
          .insert(insert)
        if (detailErr) {
          // eslint-disable-next-line no-console
          console.error('Error creating booking detail:', detailErr, 'space:', sp.spaceId)
          alert(`Lỗi tạo chi tiết đặt chỗ cho không gian ${sp.spaceId}: ${detailErr.message}`)
          setLoading(false)
          return
        }
      }

      // 6) Insert service details
      for (const sv of services) {
        const { error: svcDetailErr } = await supabase
          .from('chi tiết booking dịch vụ')
          .insert({
            booking_service_id: bookingServiceId,
            service_id: sv.serviceId,
            service_quantity: sv.quantity
          })
        if (svcDetailErr) {
          // eslint-disable-next-line no-console
          console.error('Error creating service detail:', svcDetailErr, 'service:', sv.serviceId)
        }
      }

      navigate('/done')
    } finally {
      setLoading(false)
    }
  }

  const bottom = (
    <button className="btn full" onClick={handleNext} disabled={loading}>
      {loading ? 'Đang xử lý...' : 'Xác nhận thông tin'}
    </button>
  )

  return (
    <MobileLayout bottom={bottom}>
      <h2 className="title">Thông tin cá nhân</h2>
      <p className="subtitle">Vui lòng kiểm tra lựa chọn và điền thông tin</p>

      <div className="section">
        <div className="list-item">
          <div>Check-in</div>
          <div>{checkin ? new Date(checkin).toLocaleString('vi-VN') : '-'}</div>
        </div>
        <div className="list-item">
          <div>Check-out</div>
          <div>{checkout ? new Date(checkout).toLocaleString('vi-VN') : '-'}</div>
        </div>
        <div className="list-item">
          <strong>Tổng</strong>
          <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
        </div>
      </div>

      <div className="section">
        <h4 style={{ margin: 0 }}>Không gian</h4>
        {spaces.length === 0 && <div style={{ color: '#64748b' }}>Chưa chọn</div>}
        {spaces.map(s => (
          <div key={s.spaceId} className="list-item">
            <div>{s.spaceTypeName}</div>
            <div>{s.unitPriceHourly.toLocaleString('vi-VN')}đ/h</div>
          </div>
        ))}
      </div>

      <div className="section">
        <h4 style={{ margin: 0 }}>Dịch vụ</h4>
        {services.length === 0 && <div style={{ color: '#64748b' }}>Chưa chọn</div>}
        {services.map(s => (
          <div key={s.serviceId} className="list-item">
            <div>{s.serviceName} x{s.quantity}</div>
            <div>{(s.unitPrice * s.quantity).toLocaleString('vi-VN')}đ</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div>
          <label className="label">Họ và tên</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div style={{ height: 8 }} />
        <div>
          <label className="label">Số điện thoại</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
        </div>
        <div style={{ height: 8 }} />
        <div>
          <label className="label">Email (tuỳ chọn)</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
    </MobileLayout>
  )
}


