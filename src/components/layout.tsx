import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { IconHome, IconCards, IconUser, IconLogout } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const logo = '/android-chrome-192x192.png'

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Home', path: '/', icon: <IconHome className="w-6 h-6" /> },
    { label: 'Matching', path: '/matching', icon: <IconCards className="w-6 h-6" /> },
    { label: 'Profile', path: '/profile', icon: <IconUser className="w-6 h-6" /> },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      {/* Top Navigation for Desktop */}
      <nav className="hidden md:block border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <img 
              src={logo} 
              alt="Movie Matching" 
              className="h-8 w-auto cursor-pointer object-contain" 
              onClick={() => navigate('/')}
            />
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => navigate('/profile')}>
              {user?.email}
            </Button>
            <Button variant="secondary" onClick={signOut} size="icon" title="Sign Out">
              <IconLogout className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl p-4 pt-20 md:pt-8 md:py-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card shrink-0 z-50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Clone the icon element to add active styling dynamically, or just let CSS handle it through the parent text color */}
                <div className={cn("p-1 rounded-full", isActive && "bg-primary/10")}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header 
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b bg-background/95 backdrop-blur shadow-sm flex items-center justify-between px-4",
          isScrolled ? "h-12" : "h-16"
        )}
      >
        <img 
          src={logo} 
          alt="Movie Matching" 
          className={cn("w-auto cursor-pointer transition-all duration-300", isScrolled ? "h-6" : "h-8")}
          onClick={() => navigate('/')}
        />
        Movie Matching
        <ModeToggle />
      </header>
    </div>
  )
}
