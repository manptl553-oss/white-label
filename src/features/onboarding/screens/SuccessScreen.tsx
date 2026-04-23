import { useEffect, useState } from "react";
import { Header } from "@/features/onboarding/ui/Header";
import { Icons } from "@/assets";
import { Loader } from "@/components";
import { useScreenTexts } from "@/app/providers/ThemeProvider";
import { OnboardingScreen } from "../onboarding.enums";
import {
  useHostedAuthFaceSession,
  useHostedAuthInitVdt,
} from "../api/auth.api";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { getRequestTokenPayload } from "../utils";
import { logger, useWhiteLabeledAuthClient } from "@/core";

export function SuccessScreen() {
  const texts = useScreenTexts(OnboardingScreen.Success);
  const client = useWhiteLabeledAuthClient();
  const initVdt = useHostedAuthInitVdt();
  const { goTo } = useOnboardingNavigation();
  const faceSession = useHostedAuthFaceSession();

  const [isValidating, setIsValidating] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  useEffect(() => {
    const handleVdtInit = async () => {
      try {
        setLoadingMessage("Validating session...");
        const payload = getRequestTokenPayload(client);

        if (!payload) {
          setLoadingMessage("Refreshing session...");
          await faceSession.refetch();
          goTo({ screen: OnboardingScreen.FaceLogin });
          return;
        }

        const { faceSessionId, faceSessionExp } = payload;

        if (!faceSessionId || !faceSessionExp) {
          setLoadingMessage("Session invalid. Restarting...");
          await faceSession.refetch();
          goTo({ screen: OnboardingScreen.FaceLogin });
          return;
        }

        const isExpired = Date.now() > faceSessionExp * 1000;
        if (isExpired) {
          setLoadingMessage("Session expired. Refreshing...");
          await faceSession.refetch();
          goTo({ screen: OnboardingScreen.FaceLogin });
          return;
        }

        setLoadingMessage("Verifying identity...");
        await initVdt.mutateAsync();
        setLoadingMessage("Finalizing...");
        setIsValidating(false);
      } catch (err) {
        setLoadingMessage("Something went wrong. Retrying...");
        logger.error(err);
      }
    };

    handleVdtInit();
  }, [faceSession, goTo, initVdt]);

  if (isValidating) {
    return (
      <div className="hosted-auth-success__centering">
        <Loader />
      </div>
    );
  }

  const title = texts.successTitle || "Success!";
  const subtitle = texts.successSubtitle
    ? texts.successSubtitle.replace("{appName}", texts?.appName || "ChainIT")
    : `Welcome to ${texts?.appName || "ChainIT"}!`;

  return (
    <div className="hosted-auth-success">
      <Header title="" />
      {initVdt.isPending ? (
        <div className="hosted-auth-success__loading">
          <Loader />
          <p className="hosted-auth-success__loading-text">{loadingMessage}</p>
        </div>
      ) : (
        <div className="hosted-auth-success__content">
          <img
            src={Icons.successBackground}
            alt="success"
            className="hosted-auth-success__icon"
          />
          <div className="hosted-auth-success__text-group">
            <h2 className="hosted-auth-success__title">{title}</h2>
            <p className="hosted-auth-success__subtitle">{subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
