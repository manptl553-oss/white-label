import { useCallback, useRef, useState } from "react";
import type { IDataForSubmit } from "@idscan/idvc2/dist/types/util";
import type { IStepCallback } from "@idscan/idvc2/dist/types/modules/Step";
import IDVC from "@idscan/idvc2";

import { useHostedAuthIdScanVerify } from "@/features/onboarding/api/auth.api";
import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { logger } from "@/core/logger";
import { Header } from "@/features/onboarding/ui";
import { useScreenTexts } from "@/app/providers/ThemeProvider";
import { Loader } from "@/components";
import { IdScan } from "../components/IdScan";
import { DOCUMENT_TYPE_MAP, type DocumentType } from "../models";
import { OnboardingScreen } from "../onboarding.enums";

export function IdScanScreen() {
  const { goTo } = useOnboardingNavigation();
  const verify = useHostedAuthIdScanVerify();
  const idvcRef = useRef<IDVC | null>(null);
  const documentType = useRef<DocumentType | null>(null);
  const texts = useScreenTexts(OnboardingScreen.IdScan);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleIdScanSubmit = useCallback(
    async (scannedData: IDataForSubmit) => {
      idvcRef.current?.showSpinner(true);
      setIsVerifying(true);

      let frontStep: IStepCallback | undefined;
      let pdfStep: IStepCallback | undefined;
      let backStep: IStepCallback | undefined;
      let frontImage: string | undefined;
      let backImage: string | undefined;

      switch (scannedData.documentType) {
        case 1:
          frontStep = scannedData.steps.find((item) => item.type === "front");
          pdfStep = scannedData.steps.find((item) => item.type === "pdf");
          frontImage = frontStep?.img?.split(/:image\/(jpeg|png);base64,/)[2];
          backImage = pdfStep?.img?.split(/:image\/(jpeg|png);base64,/)[2];
          break;
        case 2:
          frontStep = scannedData.steps.find((item) => item.type === "mrz");
          frontImage = frontStep?.img?.split(/:image\/(jpeg|png);base64,/)[2];
          break;
        case 7:
          frontStep = scannedData.steps.find((item) => item.type === "front");
          backStep = scannedData.steps.find((item) => item.type === "back");
          frontImage = frontStep?.img?.split(/:image\/(jpeg|png);base64,/)[2];
          backImage = backStep?.img?.split(/:image\/(jpeg|png);base64,/)[2];
          break;
        default:
          break;
      }

      if (!frontImage) {
        logger.error("Front image not found in scanned data");
        setIsVerifying(false);
        return;
      }

      const payload = {
        frontImage,
        ...(backImage ? { backImage } : {}),
        documentType: scannedData.documentType,
      };

      try {
        const verifyRes = await verify.mutateAsync(payload);
        setIsVerifying(false);
        documentType.current = {
          typeId: scannedData.documentType,
          documentType: DOCUMENT_TYPE_MAP[scannedData.documentType],
        };
        if (verifyRes.step) goTo({ step: verifyRes.step });
      } catch (error) {
        logger.error("ID scan verification failed:", error);
        setIsVerifying(false);
      }
    },
    [verify, goTo],
  );

  return (
    <div className="hosted-auth-screen hosted-auth-no-scrollbar">
      <Header title={texts.idScanTitle} />
      <div className="hosted-auth-id-scan__body">
        {isVerifying && (
          <div className="hosted-auth-id-scan__verifying">
            <Loader size="lg" />
            <p className="hosted-auth-id-scan__verifying-text">
              Verifying your document...
            </p>
          </div>
        )}
        <IdScan handleIdScanSubmit={handleIdScanSubmit} idvcRef={idvcRef} />
      </div>
    </div>
  );
}
