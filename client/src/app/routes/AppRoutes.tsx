import { type RouteObject, useRoutes } from 'react-router-dom';
import { estimateRoutes } from '@/flows/estimate/routes';
import { operatorRoutes } from '@/flows/operator/routes';
import NotFoundPage from '@/app/not-found/NotFoundPage';
import { dispatchRoutes } from './dispatchRoutes';

const appRoutes: RouteObject[] = [
  ...dispatchRoutes,
  ...estimateRoutes,
  ...operatorRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default function AppRoutes() {
  return useRoutes(appRoutes);
}
