import { useState } from 'react';
import DispatchIntroScreen from './screens/DispatchIntroScreen';
import BuyerRequestFormScreen from './screens/BuyerRequestFormScreen';
import LinkCreatedScreen from './screens/LinkCreatedScreen';
import SellerWaitingScreen from './screens/SellerWaitingScreen';
import SellerInputFormScreen from './screens/SellerInputFormScreen';
import SellerSubmittedScreen from './screens/SellerSubmittedScreen';
import FinalAmountConfirmScreen from './screens/FinalAmountConfirmScreen';
import {
  readFinalAmountTokenFromLocation,
  readSellerTokenFromLocation,
} from './model/dispatchStep';
import type { DispatchStep } from './model/dispatchStep';
import type { BuyerDispatchRequestCreateResponse } from './model/dispatchTypes';

interface DispatchFlowProps {
  /**
   * 예상 견적 화면으로의 이동은 estimate flow 소유다.
   * dispatch flow는 직접 import하지 않고 app 영역이 넘겨주는 callback에 위임한다.
   */
  onCheckEstimate?: () => void;
}

interface BuyerSession {
  buyerToken: string;
  sellerInputUrl: string;
}

/** 진입 경로에 따라 판매자·최종 금액 화면으로 바로 시작한다. */
const readInitialLocation = () => {
  if (typeof window === 'undefined') {
    return { sellerToken: null, finalAmountToken: null };
  }

  const { pathname } = window.location;

  return {
    sellerToken: readSellerTokenFromLocation(pathname),
    finalAmountToken: readFinalAmountTokenFromLocation(pathname),
  };
};

export default function DispatchFlow({ onCheckEstimate }: DispatchFlowProps) {
  const [{ sellerToken, finalAmountToken }] = useState(readInitialLocation);
  const [step, setStep] = useState<DispatchStep>(() => {
    if (sellerToken) {
      return 'SELLER_FORM';
    }
    if (finalAmountToken) {
      return 'FINAL_AMOUNT_CONFIRM';
    }

    return 'INTRO';
  });
  const [buyerSession, setBuyerSession] = useState<BuyerSession | null>(null);

  const goHome = () => setStep('INTRO');

  const handleCreated = (result: BuyerDispatchRequestCreateResponse) => {
    setBuyerSession({ buyerToken: result.buyerToken, sellerInputUrl: result.sellerInputUrl });
    setStep('LINK_CREATED');
  };

  if (step === 'SELLER_FORM' && sellerToken) {
    return (
      <SellerInputFormScreen
        sellerToken={sellerToken}
        onSubmitted={() => setStep('SELLER_SUBMITTED')}
      />
    );
  }

  if (step === 'SELLER_SUBMITTED') {
    return <SellerSubmittedScreen onGoHome={goHome} />;
  }

  if (step === 'FINAL_AMOUNT_CONFIRM' && finalAmountToken) {
    return <FinalAmountConfirmScreen buyerToken={finalAmountToken} onGoHome={goHome} />;
  }

  if (step === 'BUYER_FORM') {
    return <BuyerRequestFormScreen onBack={goHome} onCreated={handleCreated} />;
  }

  if (step === 'LINK_CREATED' && buyerSession) {
    return (
      <LinkCreatedScreen
        sellerInputUrl={buyerSession.sellerInputUrl}
        onNext={() => setStep('SELLER_WAITING')}
      />
    );
  }

  if (step === 'SELLER_WAITING' && buyerSession) {
    return <SellerWaitingScreen buyerToken={buyerSession.buyerToken} onGoHome={goHome} />;
  }

  return (
    <DispatchIntroScreen
      onCreateLink={() => setStep('BUYER_FORM')}
      onCheckEstimate={() => onCheckEstimate?.()}
    />
  );
}
