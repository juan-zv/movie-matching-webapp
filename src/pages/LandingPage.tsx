import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const logo = '/android-chrome-192x192.png'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-between text-foreground overflow-hidden bg-background font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2670&auto=format&fit=crop")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/90 to-background/30 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 flex flex-col w-full h-full min-h-screen px-6 py-12 max-w-md md:max-w-5xl mx-auto items-center md:items-start">
        
        {/* Header / Logo */}
        <div className="flex items-center justify-center md:justify-start gap-4 w-full mt-8 mb-auto text-primary">
          <img 
            src={logo} 
            alt="Movie Matching Logo" 
            className="w-10 h-10 object-contain drop-shadow-md rounded-xl"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Movie Matching</h1>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col w-full mt-auto md:mt-32 mb-10 text-left">
          <h2 className="text-[3.5rem] md:text-[5rem] leading-[1.05] font-bold tracking-tight">
            <span className="block text-foreground">Discover Your</span>
            <span className="block text-primary italic font-serif">Next</span>
            <span className="block text-primary italic font-serif">Obsession.</span>
          </h2>
          
          <p className="mt-8 text-[16px] md:text-[19px] leading-relaxed text-muted-foreground font-light max-w-[20rem] md:max-w-[32rem]">
            Rate movies, match with favorites, and get curated picks just for you. Your personalized cinematic journey begins here.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mb-12 md:mb-auto">
          <Button 
            className="w-full md:w-48 h-14 rounded-2xl font-bold text-[17px] transition-all shadow-lg hover:shadow-primary/25"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            className="w-full md:w-48 h-14 rounded-2xl font-bold text-[17px] backdrop-blur-md bg-background/50 hover:bg-accent transition-all"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
        
        {/* Footer Attribution */}
        <div className="absolute bottom-4 center w-full flex justify-center text-xs text-muted-foreground/60 md:justify-end md:right-6 md:w-auto pointer-events-none">
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>
    </div>
  )
}
