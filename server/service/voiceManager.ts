let audioBlob: Blob | null = null;

export function save(blob: Blob) {
  audioBlob = blob;
}

export function getAudioBlob() {
  return audioBlob;
}
