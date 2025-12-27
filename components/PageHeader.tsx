import Link from 'next/link';
import Lottie from 'lottie-react';
import AuthButton from '@/components/AuthButton';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { TrendingUp, BarChart3, Newspaper, PieChart } from 'lucide-react';
import globeAnimationData from '@/public/lottie/globe.json';

interface PageHeaderProps {
  showPollsButton?: boolean;
  showDataButton?: boolean;
  showNewsButton?: boolean;
  showStatisticsButton?: boolean;
}

const PageHeader = ({ showPollsButton = false, showDataButton = false, showNewsButton = false, showStatisticsButton = false }: PageHeaderProps) => {
  return (
    <div className='sticky top-0 z-50 w-full mb-8'>
      {/* Glassmorphism Container */}
      <div className='absolute inset-0 glass border-b border-white/20 dark:border-white/10 shadow-lg' />

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo Section */}
          <Link href="/" className='group flex items-center gap-3 relative z-10'>
            <div className='relative w-20 h-20 flex items-center justify-center'>
              <Lottie animationData={globeAnimationData} loop={true} />
            </div>
            <h1 className='font-display font-bold text-3xl tracking-tight text-zinc-800 dark:text-white group-hover:opacity-80 transition-opacity'>
              MyPeta
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {showPollsButton && (
              <Link href="/polls">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans">
                  <TrendingUp className="h-4 w-4" />
                  <span>Polls</span>
                </button>
              </Link>
            )}

            {showDataButton && (
              <Link href="/">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans">
                  <BarChart3 className="h-4 w-4" />
                  <span>Data</span>
                </button>
              </Link>
            )}

            {showNewsButton && (
              <Link href="/news">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans">
                  <Newspaper className="h-4 w-4" />
                  <span>News</span>
                </button>
              </Link>
            )}

            {showStatisticsButton && (
              <Link href="/statistics">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans">
                  <PieChart className="h-4 w-4" />
                  <span>Statistics</span>
                </button>
              </Link>
            )}

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

            <div className="flex items-center gap-2">
              <AuthButton />
              <ThemeToggleButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

