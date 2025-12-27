import { states } from '@/data/states';
import { getProjectCountByState } from '@/data/projects';

interface MalaysiaMapProps {
  activeState: string | null;
  onStateClick: (stateId: string) => void;
  onStateHover: (stateId: string | null) => void;
}

const MalaysiaMap = ({ activeState, onStateClick, onStateHover }: MalaysiaMapProps) => {
  const activeColor = '#3b82f6'; // Blue as primary color

  return (
    <div className="relative rounded-xl px-0 p-8 pt-36 lg:pt-8 flex flex-col justify-center items-center">
      {/* Header Stats */}
      <div className='absolute flex flex-col lg:flex-row gap-0 lg:gap-2 top-4 left-4 font-mono text-[10px] lg:text-xs'>
        <p className='text-zinc-500 dark:text-zinc-400'><span className="mr-2">🇲🇾</span>Project Tracker</p>
        <p className='tracking-widest font-bold text-zinc-700 dark:text-zinc-300'>Malaysia</p>
      </div>

      {/* States Count */}
      <div className='absolute flex flex-col lg:flex-row gap-0 lg:gap-2 top-4 right-4 font-mono text-[10px] lg:text-xs'>
        <p className='text-end text-zinc-500 dark:text-zinc-400'>3 Federal</p>
        <p className='text-end text-zinc-500 dark:text-zinc-400 hidden lg:block'>|</p>
        <p className='text-end tracking-widest font-bold text-zinc-700 dark:text-zinc-300'>13 States</p>
      </div>

      {/* State name and project count display */}
      <div className="absolute top-16 lg:top-20 text-center min-h-[100px] flex flex-col items-center justify-center">
        {activeState ? (
          <div key={activeState} className="animate-fade-in">
            <div
              className="text-xl lg:text-4xl font-bold mb-0 lg:mb-2"
              style={{ color: activeColor }}
            >
              {states.find(s => s.id === activeState)?.name}
            </div>
            <div className="text-xs lg:text-2xl text-zinc-700 dark:text-zinc-300">
              <div className="font-semibold text-zinc-500 dark:text-zinc-400 text-xs lg:text-base mb-1">
                Active Projects
              </div>
              <div
                className="font-bold"
                style={{ color: activeColor }}
              >
                {getProjectCountByState(activeState)} project{getProjectCountByState(activeState) !== 1 ? 's' : ''}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2">Click to view details</p>
          </div>
        ) : (
          <div className="tracking-wide font-bold text-zinc-400 dark:text-zinc-500 mb-2">
            Hover over a state or select one...
          </div>
        )}
      </div>

      <div className="relative w-full mt-0 lg:mt-12">
        {/* Interactive Map */}
        <svg
          viewBox="0 0 940 400"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="state-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {states.map((state) => {
            const isActive = activeState === state.id;
            const projectCount = getProjectCountByState(state.id);

            return (
              <g key={state.id}>
                <path
                  d={state.path}
                  fill={isActive ? 'url(#state-gradient)' : '#e5e7eb'}
                  stroke={isActive ? activeColor : '#374151'}
                  strokeWidth={isActive ? '2' : '1.5'}
                  className={`transition-all duration-200 cursor-pointer hover:opacity-80 ${!isActive && 'dark:fill-zinc-600 dark:stroke-zinc-400'}`}
                  onMouseEnter={() => onStateHover(state.id)}
                  onMouseLeave={() => onStateHover(null)}
                  onClick={() => onStateClick(state.id)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Selected State</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
          <span>Other States</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MalaysiaMap;
