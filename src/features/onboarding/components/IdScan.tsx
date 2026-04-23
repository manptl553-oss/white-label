import { Fragment, useCallback, useEffect, useState, type FC } from "react";
import IDVC from "@idscan/idvc2";
import { Loader } from "@/components";
import type { IDataForSubmit } from "@idscan/idvc2/dist/types/util";
import { useWhiteLabeledAuthClient } from "@/core";
import { logger } from "@/core/logger";

type Props = {
  handleIdScanSubmit: (scannedData: IDataForSubmit) => void;
  idvcRef: React.RefObject<IDVC | null>;
};

export const IdScan: FC<Props> = ({ handleIdScanSubmit, idvcRef }) => {
  const client = useWhiteLabeledAuthClient();
  const licenseKey = client.config.idScan.licenseKey;

  const [idscanMounted, setIdscanMounted] = useState(true);

  const handleIdScanService = useCallback(() => {
    idvcRef.current = new IDVC({
      el: "videoCapturingEl",
      licenseKey,
      networkUrl: "",
      fixFrontOrientAfterUpload: false,
      autoContinue: true,
      isShowDocumentTypeSelect: false,
      useCDN: true,
      showSubmitBtn: true,
      language: "en",
      realFaceMode: "all",
      processingImageFormat: "jpeg",
      autocaptureConfidence: 0.5,
      allowSubmitWithWarnings: true,
      documentTypes: [
        {
          type: "DL",
          steps: [
            { type: "front", name: "Document Front", mode: { video: true, uploader: false } },
            { type: "pdf",   name: "Document Back",  mode: { video: true, uploader: true  } },
          ],
        },
        {
          type: "Passport",
          steps: [
            { type: "mrz", name: "Document Front", mode: { video: true, uploader: false } },
          ],
        },
        {
          type: "InternationalId",
          steps: [
            { type: "front", name: "Document Front", mode: { video: true, uploader: false } },
            { type: "back",  name: "Document Back",  mode: { video: true, uploader: false } },
          ],
        },
      ],
      onMounted() { setIdscanMounted(false); },
      onChange(data)      { logger.log("on change", data); },
      onCameraError(data) { logger.log("camera error", data); },
      onReset(data)       { logger.log("on reset", data); },
      onRetakeHook(data)  { logger.log("retake hook", data); },
      submit(data: IDataForSubmit) { handleIdScanSubmit(data); },
    });
  }, [handleIdScanSubmit, idvcRef, licenseKey]);

  useEffect(() => {
    handleIdScanService();
  }, [handleIdScanService]);

  return (
    <Fragment>
      <div className="hosted-auth-id-scan-widget">
        {idscanMounted && (
          <div className="hosted-auth-id-scan-widget__loader">
            <Loader size="lg" />
          </div>
        )}
        <div id="videoCapturingEl" className="hosted-auth-id-scan-widget__el" />
      </div>
    </Fragment>
  );
};
