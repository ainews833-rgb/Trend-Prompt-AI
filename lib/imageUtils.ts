/**
 * Image compression and thumbnail utilities for browser memory and localStorage quota safety.
 */

/**
 * Creates a lightweight JPEG thumbnail (typically 5-15 KB) from a data URL or image source.
 * This prevents localStorage quota exhaustion (DOMException: QuotaExceededError).
 */
export async function createStorageThumbnail(
  sourceUrl: string,
  maxDimension = 260,
  quality = 0.55
): Promise<string> {
  if (typeof window === "undefined" || !sourceUrl) {
    return sourceUrl || "";
  }

  // If it's already an external HTTP(S) URL or small string, no need to downscale
  if (sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://")) {
    return sourceUrl;
  }

  // If already very compact (< 15KB base64), return as is
  if (sourceUrl.length < 18000) {
    return sourceUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          if (!origW || !origH) {
            resolve(sourceUrl);
            return;
          }

          let targetW = origW;
          let targetH = origH;

          if (origW > origH) {
            if (origW > maxDimension) {
              targetH = Math.round((origH * maxDimension) / origW);
              targetW = maxDimension;
            }
          } else {
            if (origH > maxDimension) {
              targetW = Math.round((origW * maxDimension) / origH);
              targetH = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(sourceUrl);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "medium";
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch {
          resolve(sourceUrl);
        }
      };

      img.onerror = () => {
        resolve(sourceUrl);
      };

      img.src = sourceUrl;
    } catch {
      resolve(sourceUrl);
    }
  });
}

/**
 * Compresses an uploaded File before sending to state or API.
 * Keeps resolution high enough for detailed AI computer-vision analysis (max 1600px),
 * but reduces 10-15MB phone camera shots to ~300-600KB base64 strings.
 */
export async function compressImageForUpload(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ dataUrl: string; width: number; height: number; fileSizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = (e) => {
      const originalDataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to parse image"));

      img.onload = () => {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        let targetW = origW;
        let targetH = origH;

        if (origW > origH) {
          if (origW > maxDimension) {
            targetH = Math.round((origH * maxDimension) / origW);
            targetW = maxDimension;
          }
        } else {
          if (origH > maxDimension) {
            targetW = Math.round((origW * maxDimension) / origH);
            targetH = maxDimension;
          }
        }

        // If the original image is already within maxDimension and < 1.5MB, keep it
        if (origW <= maxDimension && origH <= maxDimension && file.size < 1.5 * 1024 * 1024) {
          resolve({
            dataUrl: originalDataUrl,
            width: origW,
            height: origH,
            fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            dataUrl: originalDataUrl,
            width: origW,
            height: origH,
            fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        const estimatedBytes = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          width: targetW,
          height: targetH,
          fileSizeFormatted: estimatedBytes > 1024 * 1024
            ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(estimatedBytes / 1024)} KB`,
        });
      };

      img.src = originalDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
