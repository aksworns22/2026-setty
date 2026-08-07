import { dispatchClient } from './dispatchClient';
import type {
  BuyerDispatchRequestCreateRequest,
  BuyerDispatchRequestCreateResponse,
  BuyerDispatchRequestResponse,
  SellerInputSessionResponse,
  SellerInputSubmitRequest,
} from '../model/dispatchTypes';

const BUYER_PATH = '/api/dispatch-requests';
const SELLER_SESSION_PATH = '/api/dispatch-requests/seller-sessions';

export const createBuyerDispatchRequest = (request: BuyerDispatchRequestCreateRequest) =>
  dispatchClient.post<BuyerDispatchRequestCreateResponse>(BUYER_PATH, request);

export const findBuyerDispatchRequest = (buyerToken: string) =>
  dispatchClient.get<BuyerDispatchRequestResponse>(
    `${BUYER_PATH}/${encodeURIComponent(buyerToken)}`,
  );

export const findSellerInputSession = (token: string) =>
  dispatchClient.get<SellerInputSessionResponse>(
    `${SELLER_SESSION_PATH}/${encodeURIComponent(token)}`,
  );

export const submitSellerInput = (token: string, request: SellerInputSubmitRequest) =>
  dispatchClient.post<void>(`${SELLER_SESSION_PATH}/${encodeURIComponent(token)}`, request);
