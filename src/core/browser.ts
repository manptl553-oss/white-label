export const canUseDOM =
  typeof window !== "undefined" && typeof document !== "undefined";

export function getWindow() {
  return canUseDOM ? window : undefined;
}

export function getDocument() {
  return canUseDOM ? document : undefined;
}

export function getNavigator() {
  return navigator;
}

export function stopAllCameraStreams() {
  if (!canUseDOM) return;
  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  });
}
