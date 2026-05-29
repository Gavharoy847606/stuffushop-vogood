'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoginPage } from '@/components/erp/login-page'
import { DashboardLayout } from '@/components/erp/dashboard-layout'
import { DashboardPage } from '@/components/erp/dashboard-page'
import { InventoryPage } from '@/components/erp/inventory-page'
import { OrdersPage } from '@/components/erp/orders-page'
import { InfrastructurePage } from '@/components/erp/infrastructure-page'

type Page = 'dashboard' | 'inventory' | 'orders' | 'infrastructure'

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'inventory':
        return <InventoryPage />
      case 'orders':
        return <OrdersPage />
      case 'infrastructure':
        return <InfrastructurePage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  )
}
