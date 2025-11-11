import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/shared/components/MobileLayout'
import { supabase } from '@/config/supabaseClient'
import { useBooking } from '@/providers/BookingContext'

type SpaceTypeRow = { space_type_id: string; space_name: string; unit_price_hourly: number }
type SpaceRow = { space_id: string; space_type_id: string }
type ServiceRow = { service_id: string; service_name: string; unit: string; unit_price: number }

const formatDuration = (hours: number) => {
  if (!hours || hours <= 0 || !Number.isFinite(hours)) return '0p'
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h}h${m}p`
  if (h > 0) return `${h}h`
  return `${m}p`
}

export default function Booking() {
  const navigate = useNavigate()
  const {
    checkin, checkout, setCheckin, setCheckout,
    spaces, addSpace, removeSpace,
    services, addService, setServiceQuantity, removeService,
    totalAmount, estimatedHours
  } = useBooking()

  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeRow[]>([])
  const [spacesAll, setSpacesAll] = useState<SpaceRow[]>([])
  const [servicesAll, setServicesAll] = useState<ServiceRow[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [bookingDate, setBookingDate] = useState<string>('')
  const [checkinTime, setCheckinTime] = useState<string>('09:00')
  const [checkoutTime, setCheckoutTime] = useState<string>('18:00')
  // Modal choose specific spaces
  const [spaceModalOpen, setSpaceModalOpen] = useState(false)
  const [spaceModalTitle, setSpaceModalTitle] = useState('')
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [availableSpacesByType, setAvailableSpacesByType] = useState<{ space_id: string }[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)
  const spaceModalRef = useRef<HTMLDivElement>(null)
  const drawerStartY = useRef<number | null>(null)
  const drawerOffset = useRef<number>(0)
  const [drawerTranslate, setDrawerTranslate] = useState(0)
  const modalStartY = useRef<number | null>(null)
  const modalOffset = useRef<number>(0)
  const [modalTranslate, setModalTranslate] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: st, error: stErr, status: stStatus }, { data: sps, error: spErr, status: spStatus }, { data: svs, error: svErr, status: svStatus }] = await Promise.all([
          supabase.from('loại không gian').select('space_type_id, space_name, unit_price_hourly'),
          supabase.from('không gian').select('space_id, space_type_id'),
          supabase.from('dịch vụ').select('service_id, service_name, unit, unit_price')
        ])
        if (stErr) {
          // eslint-disable-next-line no-console
          console.error('Error fetching loại không gian:', stErr, 'status:', stStatus)
        }
        if (spErr) {
          // eslint-disable-next-line no-console
          console.error('Error fetching không gian:', spErr, 'status:', spStatus)
        }
        if (svErr) {
          // eslint-disable-next-line no-console
          console.error('Error fetching dịch vụ:', svErr, 'status:', svStatus)
        }
        setSpaceTypes((st || []).map((r: any) => ({
        space_type_id: String(r.space_type_id),
        space_name: String(r.space_name || ''),
        unit_price_hourly: Number(r.unit_price_hourly || 0)
        })))
        setSpacesAll((sps || []).map((r: any) => ({
        space_id: String(r.space_id),
        space_type_id: String(r.space_type_id)
        })))
        setServicesAll((svs || []).map((r: any) => ({
        service_id: String(r.service_id),
        service_name: String(r.service_name || ''),
        unit: String(r.unit || ''),
        unit_price: Number(r.unit_price || 0)
        })))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error initializing data:', e)
      }
    }
    load()
  }, [])

  // Initialize date field from context values (when navigating back)
  useEffect(() => {
    if (checkin) {
      const d = new Date(checkin)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      if (!bookingDate) setBookingDate(`${yyyy}-${mm}-${dd}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compose ISO strings from single date (default hours 09:00-18:00)
  useEffect(() => {
    if (bookingDate && checkinTime) {
      const checkinLocal = new Date(`${bookingDate}T${checkinTime}:00`)
      setCheckin(checkinLocal.toISOString())
    } else {
      setCheckin('')
    }
  }, [bookingDate, checkinTime, setCheckin])

  useEffect(() => {
    if (bookingDate && checkoutTime) {
      const checkoutLocal = new Date(`${bookingDate}T${checkoutTime}:00`)
      setCheckout(checkoutLocal.toISOString())
    } else {
      setCheckout('')
    }
  }, [bookingDate, checkoutTime, setCheckout])

  useEffect(() => {
    if (!drawerOpen) return
    const handleClickOutside = (event: PointerEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [drawerOpen])

  useEffect(() => {
    if (!spaceModalOpen) return
    const handleClickOutside = (event: PointerEvent) => {
      if (spaceModalRef.current && !spaceModalRef.current.contains(event.target as Node)) {
        setSpaceModalOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [spaceModalOpen])

  // Drag-to-close for drawer
  const onDrawerPointerDown = (e: React.PointerEvent) => {
    drawerStartY.current = e.clientY
    drawerOffset.current = 0
    const target = e.target as Element | null
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId)
    }
  }
  const onDrawerPointerMove = (e: React.PointerEvent) => {
    if (drawerStartY.current == null) return
    const dy = e.clientY - drawerStartY.current
    const clamped = Math.max(0, dy)
    drawerOffset.current = clamped
    setDrawerTranslate(clamped)
  }
  const onDrawerPointerUp = (_e: React.PointerEvent) => {
    if (drawerStartY.current == null) return
    const dy = drawerOffset.current
    drawerStartY.current = null
    drawerOffset.current = 0
    if (dy > 120) {
      setDrawerOpen(false)
      setDrawerTranslate(0)
    } else {
      setDrawerTranslate(0)
    }
  }

  // Drag-to-close for modal
  const onModalPointerDown = (e: React.PointerEvent) => {
    modalStartY.current = e.clientY
    modalOffset.current = 0
    const target = e.target as Element | null
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId)
    }
  }
  const onModalPointerMove = (e: React.PointerEvent) => {
    if (modalStartY.current == null) return
    const dy = e.clientY - modalStartY.current
    const clamped = Math.max(0, dy)
    modalOffset.current = clamped
    setModalTranslate(clamped)
  }
  const onModalPointerUp = (_e: React.PointerEvent) => {
    if (modalStartY.current == null) return
    const dy = modalOffset.current
    modalStartY.current = null
    modalOffset.current = 0
    if (dy > 120) {
      setSpaceModalOpen(false)
      setModalTranslate(0)
    } else {
      setModalTranslate(0)
    }
  }

  const handleAddSpaceByType = (typeId: string) => {
    openSpaceModal(typeId)
  }

  const openSpaceModal = async (typeId: string) => {
    if (!bookingDate || !checkinTime || !checkoutTime) {
      alert('Vui lòng chọn ngày và giờ check-in/check-out')
      return
    }
    const type = spaceTypes.find(t => t.space_type_id === typeId)
    if (!type) return
    setSelectedTypeId(typeId)
    setSpaceModalTitle(type.space_name)
    setSpaceModalOpen(true)
    setLoadingSpaces(true)
    try {
      // Compose ISO
      const checkinISO = new Date(`${bookingDate}T${checkinTime}:00`).toISOString()
      const checkoutISO = new Date(`${bookingDate}T${checkoutTime}:00`).toISOString()
      // 1) All spaces of this type from cached list
      const allSpaces = spacesAll.filter(s => s.space_type_id === typeId)
      // 2) Find overlapping bookings for the time range
      const { data: overlapping, error: overlapError, status: overlapStatus } = await supabase
        .from('đặt chỗ')
        .select('booking_id, booking_status, checkin, checkout')
        .lt('checkin', checkoutISO)
        .gt('checkout', checkinISO)
      if (overlapError) {
        // eslint-disable-next-line no-console
        console.error('Error fetching overlapping bookings:', overlapError, 'status:', overlapStatus)
        alert(`Không thể tải dữ liệu đặt chỗ: ${overlapError.message}`)
        setAvailableSpacesByType([])
        return
      }
      // 3) Filter to active bookings (occupy spaces)
      const activeBookings = (overlapping || []).filter((b: any) => {
        const status = String(b.booking_status || '').toLowerCase()
        return !status.includes('đã hủy') &&
               !status.includes('da huy') &&
               !status.includes('hủy') &&
               !status.includes('huy') &&
               !status.includes('no show') &&
               !status.includes('đã check-out') &&
               !status.includes('da check-out')
      })
      let bookedSpaceIds = new Set<string>()
      if (activeBookings.length > 0) {
        const activeIds = activeBookings.map((b: any) => b.booking_id)
        const { data: bookedDetails, error: detailError, status: detailStatus } = await supabase
          .from('chi tiết đặt chỗ')
          .select('space_id, booking_id')
          .in('booking_id', activeIds)
        if (detailError) {
          // eslint-disable-next-line no-console
          console.error('Error fetching booking details:', detailError, 'status:', detailStatus)
          alert(`Không thể tải chi tiết đặt chỗ: ${detailError.message}`)
          setAvailableSpacesByType([])
          return
        }
        bookedSpaceIds = new Set<string>((bookedDetails || []).map((d: any) => String(d.space_id)))
      }
      // 4) Available = spaces of this type not in bookedSpaceIds
      const available = allSpaces
        .filter((s: SpaceRow) => !bookedSpaceIds.has(String(s.space_id)))
        .map(s => ({ space_id: String(s.space_id) }))
      setAvailableSpacesByType(available)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error loading available spaces:', e)
      setAvailableSpacesByType([])
    } finally {
      setLoadingSpaces(false)
    }
  }

  const handleChooseSpace = (spaceId: string) => {
    const type = spaceTypes.find(t => t.space_type_id === selectedTypeId)
    if (!type) return
    addSpace({
      spaceId,
      spaceTypeId: type.space_type_id,
      spaceTypeName: type.space_name,
      unitPriceHourly: type.unit_price_hourly
    })
    setSpaceModalOpen(false)
  }

  const bottom = (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button className="btn secondary" style={{ flex: 1 }} onClick={() => setDrawerOpen(true)}>
        Tổng: {totalAmount.toLocaleString('vi-VN')}đ
      </button>
      <button
        className="btn"
        style={{ flex: 1 }}
        onClick={() => navigate('/info')}
        disabled={!checkin || !checkout || spaces.length === 0}
      >
        Tiếp tục
      </button>
    </div>
  )

  return (
    <MobileLayout bottom={bottom}>
      <div className="section" style={{ textAlign: 'center' }}>
        <label className="label" style={{ textAlign: 'left' }}>Ngày sử dụng</label>
        <input
          className="input"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          style={{ margin: '0 auto', maxWidth: 220 }}
        />
        <div style={{ height: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Check-in</label>
            <input className="input" type="time" value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input className="input" type="time" value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} />
          </div>
        </div>
        {estimatedHours > 0 && (
          <div style={{ marginTop: 8, color: '#64748b' }}>
            Tổng thời gian dự kiến: {formatDuration(estimatedHours)}
          </div>
        )}
      </div>

      <div className="section">
        <h4 style={{ margin: 0 }}>Chọn loại không gian</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          {spaceTypes.map(t => (
            <button
              key={t.space_type_id}
              className="btn secondary"
              onClick={() => handleAddSpaceByType(t.space_type_id)}
            >
              {t.space_name}
            </button>
          ))}
        </div>
        {spaces.length > 0 && (
          <>
            <div style={{ height: 12 }} />
            <div className="list-item"><strong>Đã chọn</strong></div>
            {spaces.map(s => (
              <div key={s.spaceId} className="list-item">
                <div>
                  <div>{s.spaceTypeName} • {s.spaceId}</div>
                </div>
                <button className="btn ghost" onClick={() => removeSpace(s.spaceId)}>Xoá</button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="section">
        <h4 style={{ margin: 0 }}>Dịch vụ</h4>
        {servicesAll.map(s => {
          const selected = services.find(x => x.serviceId === s.service_id)
          return (
            <div key={s.service_id} className="list-item">
              <div>
                <div>{s.service_name}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{s.unit_price.toLocaleString('vi-VN')}đ/{s.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!selected ? (
                  <button className="btn" onClick={() => addService({
                    serviceId: s.service_id,
                    serviceName: s.service_name,
                    unit: s.unit,
                    unitPrice: s.unit_price
                  }, 1)}>Thêm</button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn ghost" onClick={() => setServiceQuantity(s.service_id, Math.max(0, selected.quantity - 1))}>-</button>
                    <div style={{ minWidth: 24, textAlign: 'center' }}>{selected.quantity}</div>
                    <button className="btn ghost" onClick={() => setServiceQuantity(s.service_id, selected.quantity + 1)}>+</button>
                    <button className="btn ghost" onClick={() => removeService(s.service_id)}>Xoá</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {drawerOpen && (
        <div
          ref={drawerRef}
          className="sheet"
          style={{ padding: 16, transform: `translateY(${drawerTranslate}px)` }}
        >
          <div
            className="sheet-handle"
            onPointerDown={onDrawerPointerDown}
            onPointerMove={onDrawerPointerMove}
            onPointerUp={onDrawerPointerUp}
          />
          <h3 style={{ marginTop: 4 }}>Chi tiết đã chọn</h3>
          <div className="list-item"><strong>Không gian</strong></div>
          {spaces.length === 0 && <div style={{ color: '#64748b' }}>Chưa chọn</div>}
          {spaces.map(s => (
            <div key={s.spaceId} className="list-item">
              <div>{s.spaceTypeName} • {s.spaceId}</div>
              <div>{(s.unitPriceHourly * Math.max(estimatedHours, 0)).toLocaleString('vi-VN')}đ</div>
            </div>
          ))}
          <div className="list-item"><strong>Dịch vụ</strong></div>
          {services.length === 0 && <div style={{ color: '#64748b' }}>Chưa chọn</div>}
          {services.map(s => (
            <div key={s.serviceId} className="list-item">
              <div>{s.serviceName} x{s.quantity}</div>
              <div>{(s.unitPrice * s.quantity).toLocaleString('vi-VN')}đ</div>
            </div>
          ))}
          <div className="list-item">
            <strong>Tổng</strong>
            <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
          </div>
      <button className="btn full" style={{ marginTop: 12 }} onClick={() => setDrawerOpen(false)}>Đóng</button>
        </div>
      )}
      {spaceModalOpen && (
        <div
          ref={spaceModalRef}
          className="sheet"
          style={{ padding: 16, transform: `translateY(${modalTranslate}px)` }}
        >
          <div
            className="sheet-handle"
            onPointerDown={onModalPointerDown}
            onPointerMove={onModalPointerMove}
            onPointerUp={onModalPointerUp}
          />
          <h3 style={{ marginTop: 4 }}>Chọn không gian - {spaceModalTitle}</h3>
          {loadingSpaces ? (
            <div style={{ padding: 16, color: '#64748b' }}>Đang tải danh sách...</div>
          ) : (
            <>
              {availableSpacesByType.length === 0 ? (
                <div style={{ padding: 16, color: '#64748b' }}>Không còn không gian trống trong khoảng thời gian đã chọn.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {availableSpacesByType.map(s => (
                    <button
                      key={s.space_id}
                      className="btn secondary"
                      style={{ aspectRatio: '1 / 1', padding: 8 }}
                      onClick={() => handleChooseSpace(s.space_id)}
                    >
                      <div style={{ fontWeight: 700 }}>{s.space_id}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <button className="btn full" style={{ marginTop: 12 }} onClick={() => setSpaceModalOpen(false)}>Đóng</button>
        </div>
      )}
    </MobileLayout>
  )
}


