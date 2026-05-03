import { Outlet, useLocation } from 'react-router-dom'

export function RouteTransition() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="animate-route-fade">
      <Outlet />
    </div>
  )
}
