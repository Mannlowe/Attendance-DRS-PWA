// Utility to forcibly stop all active camera streams in the browser
export function stopAllCameras() {
  // Stop all video tracks from all video elements
  document.querySelectorAll('video').forEach(video => {
    const mediaStream = (video as HTMLVideoElement).srcObject as MediaStream | null;
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach(track => {
        if (track.kind === 'video') {
          track.stop();
          // Debug log
          console.debug('Stopped camera track from video element:', track);
        }
      });
      (video as HTMLVideoElement).srcObject = null;
    }
  });
  // Optionally, stop any active streams from window.navigator
  if (navigator.mediaDevices && (navigator.mediaDevices as any).getUserMedia) {
    // No direct way to get all active streams, so rely on video elements
  }
}
