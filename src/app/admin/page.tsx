import { redirect } from 'next/navigation'

// Dashboard temporarily disabled - redirect to apartments
export default function AdminDashboard() {
  redirect('/admin/apartments')
}
