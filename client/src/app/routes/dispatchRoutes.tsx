import { type RouteObject, useNavigate } from 'react-router-dom';
import DispatchFlow from '@/flows/dispatch/DispatchFlow';

function DispatchRoute() {
  const navigate = useNavigate();

  return <DispatchFlow onCheckEstimate={() => navigate('/estimate')} />;
}

export const dispatchRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DispatchRoute />,
  },
  {
    path: '/seller-input/:token',
    element: <DispatchRoute />,
  },
  {
    path: '/final-amount/:token',
    element: <DispatchRoute />,
  },
];
