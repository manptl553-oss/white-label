import { useEffect, useMemo, useRef, useState } from "react";
import {
  ThemeProvider as AmplifyThemeProvider,
  createTheme,
} from "@aws-amplify/ui-react";
import type { ErrorState } from "@aws-amplify/ui-react-liveness";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react/styles.css";

import {
  clearStorageByPrefix,
  getNavigator,
  stopAllCameraStreams,
  useWhiteLabeledAuthClient,
} from "@/core";
import { logger } from "@/core/logger";
import {
  useHostedAuthFaceSession,
  useHostedAuthFaceVerify,
} from "@/features/onboarding/api/auth.api";
import { useOnboardingNavigation } from "@/features/onboarding/hooks/useOnboardingNavigation";
import { Button } from "@/features/onboarding/ui/Button";
import { Header } from "@/features/onboarding/ui/Header";
import { useScreenTexts, useThemeConfig } from "@/app/providers/ThemeProvider";
import { Loader, toast } from "@/components";
import { LS_FACE_VERIFY_SESSION_ID } from "@/features/onboarding/utils";
import { OnboardingScreen } from "../onboarding.enums";
import type { AxiosErrorType } from "../api";
import { FaceVerificationError } from "../components/FaceVerificationError";

type Stage =
  | "INIT"
  | "CHECKING_CAMERA"
  | "READY"
  | "SCANNING"
  | "UPLOADING"
  | "VERIFYING"
  | "ERROR";

export type CameraError = AxiosErrorType & {
  name?: string;
};

interface LivenessError {
  state: ErrorState;
  error: Error;
}

export function FaceLoginScreen() {
  const client = useWhiteLabeledAuthClient();
  const { colors, name } = useThemeConfig();
  const { goTo } = useOnboardingNavigation();
  const session = useHostedAuthFaceSession();
  const verify = useHostedAuthFaceVerify();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cameraCheckKey, setCameraCheckKey] = useState(0);
  const [stage, setStage] = useState<Stage>("CHECKING_CAMERA");
  const [error, setError] = useState<CameraError | null>(null);

  const signature = session.data?.session.signature ?? "";
  const sessionId = session.data?.session.sessionId ?? "";
  const primaryColor = colors.primary;

  const amplifyTheme = useMemo(
    () =>
      createTheme({
        name: "face-liveness",
        tokens: {
          colors: {
            primary: {
              10: { value: primaryColor },
              20: { value: primaryColor },
              40: { value: primaryColor },
              60: { value: primaryColor },
              80: { value: primaryColor },
              90: { value: primaryColor },
              100: { value: primaryColor },
            },
          },
        },
      }),
    [primaryColor],
  );

  useEffect(() => {
    const checkCamera = async () => {
      setStage("CHECKING_CAMERA");
      try {
        const navigator = getNavigator();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setStage("READY");
      } catch {
        setError({ message: "Camera permission is required.", statusCode: 403, name: "NotAllowedError" });
        setStage("ERROR");
      }
    };
    checkCamera();
  }, [cameraCheckKey]);

  useEffect(() => {
    const clipCanvasToContainer = () => {
      const container = document.querySelector(".face-login-container") as HTMLElement | null;
      const canvas = document.querySelector(".amplify-liveness-freshness-canvas") as HTMLCanvasElement | null;
      if (!container || !canvas) return;

      const cr = container.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.style.clipPath = `inset(${cr.top}px ${vw - cr.right}px ${vh - cr.bottom}px ${cr.left}px)`;
      if (canvas.hidden) canvas.hidden = false;
    };

    const observer = new MutationObserver(clipCanvasToContainer);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });

    window.addEventListener("resize", clipCanvasToContainer);
    window.addEventListener("scroll", clipCanvasToContainer, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", clipCanvasToContainer);
      window.removeEventListener("scroll", clipCanvasToContainer, true);
      stopAllCameraStreams();
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    timeoutRef.current = setTimeout(() => {
      setError({ message: "Verification timed out.", statusCode: 408 });
      setStage("ERROR");
    }, 5 * 60 * 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sessionId]);

  const handleAnalysisComplete = async () => {
    setStage("UPLOADING");
    try {
      setStage("VERIFYING");
      const res = await verify.mutateAsync({ sessionId, signature });
      client.storage.setItem(client.getKey(LS_FACE_VERIFY_SESSION_ID), sessionId);
      toast.success("Face verification successful!");
      if (res.step) goTo({ step: res.step });
    } catch (e) {
      const err = e as AxiosErrorType;
      logger.error("Verification Failed:", err);
      stopAllCameraStreams();
      setError(err);
      setStage("ERROR");
      client.config.onError?.(error);
    }
  };

  const handleRetry = async () => {
    const code = error?.statusCode;
    setError(null);
    stopAllCameraStreams();
    if (code === 401 || code === 409) {
      clearStorageByPrefix(client.storage, client.config.storageKeyPrefix);
      client.config.onError?.(error);
      window.location.reload();
      return;
    }
    setCameraCheckKey((prev) => prev + 1);
    await session.refetch();
  };

  const handleSdkError = (err: LivenessError) => {
    logger.error("Rekognition SDK Error:", err);
    stopAllCameraStreams();
    const cameraError: CameraError = {
      message: err.error.message,
      name: err.state,
      statusCode: null,
    };
    setError(cameraError);
    setStage("ERROR");
    client.config.onError?.(error);
  };

  const handleCancel = () => { stopAllCameraStreams(); };
  const texts = useScreenTexts(OnboardingScreen.FaceLogin);

  if (session.isLoading || stage === "CHECKING_CAMERA") {
    return (
      <div className="hosted-auth-face-login--loading">
        <Header title={texts.faceScanTitle} />
        <div className="hosted-auth-face-login__loader-body">
          <Loader />
        </div>
      </div>
    );
  }

  if (stage === "ERROR") {
    return (
      <div className="hosted-auth-face-login--error">
        <div className="hosted-auth-face-login__error-inner">
          <FaceVerificationError error={error} brandName={name} />
          <div className="hosted-auth-face-login__sticky-btn">
            <Button
              onClick={handleRetry}
              title={error?.statusCode === 409 ? "Go to Sign In" : "Try Again"}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hosted-auth-face-login--active face-login-container">
      <AmplifyThemeProvider key={sessionId} theme={amplifyTheme}>
        <FaceLivenessDetector
          sessionId={sessionId}
          region={client.config.faceLiveness.region}
          disableStartScreen
          onAnalysisComplete={handleAnalysisComplete}
          onUserCancel={handleCancel}
          onError={handleSdkError}
        />
      </AmplifyThemeProvider>
    </div>
  );
}
