import { Routes, Route, useNavigate } from 'react-router-dom'
import { BookingProvider } from '@/providers/BookingContext'
import Landing from '@/features/landing/Landing'
import Booking from '@/features/booking/Booking'
import CustomerInfo from '@/features/customer/CustomerInfo'
import Success from '@/features/success/Success'

export default function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/book" element={<Booking />} />
        <Route path="/info" element={<CustomerInfo />} />
        <Route path="/done" element={<Success />} />
      </Routes>
    </BookingProvider>
  )
}


