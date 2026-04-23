import type { CameraError } from "../screens";
import { Icons } from "@/assets";

const getFaceVerificationErrorUI = (
  error: CameraError | null,
  brandName: string,
): {
  message: string;
  icon: string;
} => {
  if (!error) {
    return {
      message: "Something went wrong. Please try again.",
      icon: Icons.warningSvg,
    };
  }

  switch (error.name || error.statusCode) {
    case "CAMERA_ACCESS_ERROR":
    case "NotAllowedError":
      return {
        message: "Camera access denied. Please allow camera permission.",
        icon: Icons.cameraNotAccessErrorSvg,
      };

    case "NotFoundError":
      return {
        message: "No camera detected on this device.",
        icon: Icons.cameraNotAccessErrorSvg,
      };

    case "TIMEOUT":
    case "CONNECTION_TIMEOUT":
    case 408:
      return {
        message: "Verification timed out. Please try again.",
        icon: Icons.warningSvg,
      };

    case 429:
      return {
        message: "Too many attempts. Please wait and retry.",
        icon: Icons.warningSvg,
      };

    case 401:
      return {
        message: "Your session has expired. Please try again.",
        icon: Icons.warningSvg,
      };

    case 409:
      return {
        message: `It appears this face is already linked to an existing ${brandName}.\nPlease go back and sign in to continue.\nIf you need assistance, contact to support team.`,
        icon: Icons.warningSvg,
      };

    case "SERVER_ERROR":
    case 500:
      return {
        message: "Face verification is temporarily unavailable.",
        icon: Icons.awsRekognitionErrorSvg,
      };

    case 400:
      return {
        message: error.message
          ? error.message
          : "Person liveness confidence does not meet the minimum threshold",
        icon: Icons.awsRekognitionErrorSvg,
      };

    default:
      return {
        message: error.message || "Face verification failed.",
        icon: Icons.awsRekognitionErrorSvg,
      };
  }
};

export const FaceVerificationError = ({
  error,
  brandName,
}: {
  error: CameraError | null;
  brandName: string;
}) => {
  const { message, icon } = getFaceVerificationErrorUI(error, brandName);

  return (
    <div className="hosted-auth-face-error">
      <div className="hosted-auth-face-error__inner">
        <img src={icon} alt="error-icon" className="hosted-auth-face-error__icon" />
        <p className="hosted-auth-face-error__message">{message}</p>
      </div>
    </div>
  );
};
