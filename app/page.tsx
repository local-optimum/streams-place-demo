import { Canvas } from '@/components/Canvas';
import { ColorPicker } from '@/components/ColorPicker';
import { StatsPanel } from '@/components/StatsPanel';
import { Toast } from '@/components/Toast';

export default function Home() {
  return (
    <main className="min-h-screen flex items-start justify-center relative z-10">
      <div className="w-full max-w-[1400px] px-2 sm:px-4 py-4 sm:py-8">
        {/* Header with Somnia Branding - Centered */}
        <header className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-press-start)' }}>
            <span className="gradient-text">SOMNIA PLACE</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm px-2">
            Real-time on-chain collaboration powered by{' '}
            <a 
              href="https://datastreams.somnia.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors underline"
            >
              Data Streams
            </a>
          </p>
        </header>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[auto_320px] gap-3 sm:gap-4 items-start lg:items-stretch justify-center">
          {/* Canvas Area */}
          <div className="glass-strong rounded-xl p-2 sm:p-3 shadow-2xl w-full lg:w-fit mx-auto h-fit">
            <Canvas />
            <div className="mt-2 sm:mt-3">
              <ColorPicker />
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="w-full lg:w-auto">
            <StatsPanel />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center text-gray-400 text-xs px-2">
          <div className="glass rounded-lg px-4 sm:px-6 py-2 sm:py-3 inline-block hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-shadow">
            <p className="leading-relaxed">
              Built with{' '}
              <a
                href="https://datastreams.somnia.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Somnia Data Streams
              </a>
              {' '}by{' '}
              <a
                href="https://github.com/local-optimum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
              >
                local-optimum
              </a>
            </p>
          </div>
        </footer>
      </div>
      
      {/* Toast Notifications */}
      <Toast />
    </main>
  );
}

