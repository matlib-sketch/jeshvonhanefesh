import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, BarChart2, Target, Settings, Home } from 'lucide-react'

const tabs = [
  { to: '/today', icon: Home, key: 'nav.today', exact: false },
  { to: '/history', icon: CalendarDays, key: 'nav.history', exact: false },
  { to: '/progress', icon: BarChart2, key: 'nav.progress', exact: false },
  { to: '/goals', icon: Target, key: 'nav.goals', exact: false },
  { to: '/settings', icon: Settings, key: 'nav.settings', exact: false },
]

export const BottomNav = () => {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sepia-200 dark:border-sepia-700 bg-sepia-50 dark:bg-sepia-950 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, key, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-deep dark:text-blue-300'
                  : 'text-sepia-500 dark:text-sepia-400 hover:text-sepia-700',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{t(key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
