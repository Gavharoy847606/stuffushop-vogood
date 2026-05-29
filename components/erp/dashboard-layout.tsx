'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Server
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Page = 'dashboard' | 'inventory' | 'orders' | 'infrastructure'

interface DashboardLayoutProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  children: React.ReactNode
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'infrastructure', label: 'Infra', icon: <Server className="w-5 h-5" /> },
]

function Sidebar({ currentPage, onPageChange, isOpen, onClose }: {
  currentPage: Page
  onPageChange: (page: Page) => void
  isOpen: boolean
  onClose: () => void
}) {
  const { user, logout } = useAuthStore()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72
        glass-card border-r border-glass-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-emerald">
                  <span className="text-lg font-bold text-primary">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-foreground">STUFFUS<span className="text-primary">.ERP</span></h1>
                  <p className="text-xs text-muted-foreground">Enterprise System</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  onClose()
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${currentPage === item.id
                    ? 'bg-primary/20 text-primary glow-emerald'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {currentPage === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-glass-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <Avatar className="w-10 h-10 border-2 border-primary/30">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-glass-border">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-glass-border" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}

function BottomNav({ currentPage, onPageChange }: {
  currentPage: Page
  onPageChange: (page: Page) => void
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass-card border-t border-glass-border rounded-t-2xl px-2 py-2 mx-2 mb-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                transition-all duration-200
                ${currentPage === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className={`
                p-2 rounded-xl transition-all duration-200
                ${currentPage === item.id ? 'bg-primary/20 glow-emerald' : ''}
              `}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore()
  const isMobile = useIsMobile()

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-glass-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          {isMobile && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">S</span>
              </div>
              <span className="font-semibold text-foreground">STUFFUS<span className="text-primary">.ERP</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isMobile && (
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="text-foreground font-medium">{user?.name}</span>
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="w-9 h-9 border-2 border-primary/30 hover:border-primary/50 transition-colors">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-glass-border">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-glass-border" />
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-glass-border" />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export function DashboardLayout({ currentPage, onPageChange, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop/tablet */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${isMobile ? 'pb-28' : ''}`}>
          {children}
        </main>
      </div>

      {/* Bottom Navigation for mobile */}
      {isMobile && (
        <BottomNav currentPage={currentPage} onPageChange={onPageChange} />
      )}
    </div>
  )
}
