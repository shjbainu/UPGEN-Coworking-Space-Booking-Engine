import React, { createContext, useContext, useMemo, useState } from 'react'

export type SelectedSpace = {
  spaceId: string
  spaceTypeId: string
  spaceTypeName: string
  unitPriceHourly: number
}

export type SelectedService = {
  serviceId: string
  serviceName: string
  unit: string
  unitPrice: number
  quantity: number
}

export type CustomerInfo = {
  name: string
  phone: string
  email?: string
  sourceId?: string
}

type BookingState = {
  checkin: string
  checkout: string
  spaces: SelectedSpace[]
  services: SelectedService[]
  customer?: CustomerInfo
  bookingId?: string
}

type BookingContextValue = BookingState & {
  setCheckin: (iso: string) => void
  setCheckout: (iso: string) => void
  addSpace: (s: SelectedSpace) => void
  removeSpace: (spaceId: string) => void
  addService: (s: Omit<SelectedService, 'quantity'>, quantity: number) => void
  setServiceQuantity: (serviceId: string, quantity: number) => void
  removeService: (serviceId: string) => void
  setCustomer: (c: CustomerInfo) => void
  setBookingId: (id: string) => void
  clear: () => void
  totalAmount: number
  estimatedHours: number
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined)

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkin, setCheckin] = useState<string>('')
  const [checkout, setCheckout] = useState<string>('')
  const [spaces, setSpaces] = useState<SelectedSpace[]>([])
  const [services, setServices] = useState<SelectedService[]>([])
  const [customer, setCustomer] = useState<CustomerInfo | undefined>(undefined)
  const [bookingId, setBookingId] = useState<string | undefined>(undefined)

  const estimatedHours = useMemo(() => {
    const s = new Date(checkin).getTime()
    const e = new Date(checkout).getTime()
    if (!s || !e || e <= s) return 0
    return (e - s) / 36e5
  }, [checkin, checkout])

  const totalAmount = useMemo(() => {
    const spaceTotal = spaces.reduce((sum, s) => sum + s.unitPriceHourly * estimatedHours, 0)
    const serviceTotal = services.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0)
    return Math.round(spaceTotal + serviceTotal)
  }, [spaces, services, estimatedHours])

  const addSpace = (s: SelectedSpace) => {
    setSpaces(prev => {
      if (prev.find(p => p.spaceId === s.spaceId)) return prev
      return [...prev, s]
    })
  }
  const removeSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.spaceId !== spaceId))
  }
  const addService = (s: Omit<SelectedService, 'quantity'>, quantity: number) => {
    setServices(prev => {
      const found = prev.find(p => p.serviceId === s.serviceId)
      if (found) return prev.map(p => p.serviceId === s.serviceId ? { ...p, quantity: p.quantity + quantity } : p)
      return [...prev, { ...s, quantity }]
    })
  }
  const setServiceQuantity = (serviceId: string, quantity: number) => {
    setServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, quantity } : s))
  }
  const removeService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.serviceId !== serviceId))
  }
  const clear = () => {
    setCheckin('')
    setCheckout('')
    setSpaces([])
    setServices([])
    setCustomer(undefined)
    setBookingId(undefined)
  }

  const value: BookingContextValue = {
    checkin, checkout, spaces, services, customer, bookingId,
    setCheckin, setCheckout,
    addSpace, removeSpace,
    addService, setServiceQuantity, removeService,
    setCustomer,
    setBookingId,
    clear,
    totalAmount,
    estimatedHours
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}


