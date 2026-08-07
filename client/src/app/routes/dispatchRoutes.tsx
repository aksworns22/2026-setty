import { Navigate, type RouteObject, useNavigate, useParams } from 'react-router-dom';
import DispatchFlow from '@/flows/dispatch/DispatchFlow';
import SellerWaitingScreen from '@/flows/dispatch/screens/SellerWaitingScreen';

function DispatchRoute() {
  const navigate = useNavigate();

  return (
    <DispatchFlow
      onCheckEstimate={() => navigate('/estimate')}
      onOpenBuyerStatus={(buyerToken) =>
        navigate(`/dispatch/${encodeURIComponent(buyerToken)}`, { replace: true })
      }
    />
  );
}

/**
 * 계정이 없는 MVP에서 buyerToken 자체가 구매자 요청 조회 권한이다.
 * URL로 복구해 React 메모리가 사라지는 새로고침·재방문에서도 같은 카드를 연다.
 */
function BuyerStatusRoute() {
  const navigate = useNavigate();
  const { buyerToken } = useParams<{ buyerToken: string }>();

  if (!buyerToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <SellerWaitingScreen
      key={buyerToken}
      buyerToken={buyerToken}
      onGoHome={() => navigate('/', { replace: true })}
    />
  );
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
    path: '/dispatch/:buyerToken',
    element: <BuyerStatusRoute />,
  },
  {
    path: '/final-amount/:token',
    element: <DispatchRoute />,
  },
];
