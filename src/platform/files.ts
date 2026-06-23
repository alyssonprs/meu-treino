export function downloadTextFile({
  contents,
  fileName,
  mimeType,
}: {
  contents: string;
  fileName: string;
  mimeType: string;
}) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}
