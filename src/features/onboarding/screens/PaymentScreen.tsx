import { useEffect, useRef } from "react";
import { useHostedAuthPromoCode } from "@/features/onboarding/api/auth.api";
import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { Loader } from "@/components";
import { logger } from "@/core/logger";

export function PaymentScreen() {
  const { goTo } = useOnboardingNavigation();
  const promoCode = useHostedAuthPromoCode();
  const hasFetched = useRef(false);

  useEffect(() => {
    const add = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const promoRes = await promoCode.mutateAsync({});
        if (promoRes.step) goTo({ step: promoRes.step });
      } catch (e) {
        logger.error("Payment flow initialization error", e);
      }
    };
    add();
  }, [goTo, promoCode]);

  return (
    <div className="hosted-auth-payment">
      <div className="hosted-auth-payment__loader-wrap">
        <Loader />
      </div>
    </div>
  );
}
