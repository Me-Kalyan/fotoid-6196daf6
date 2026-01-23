import type { FaceLandmarks } from "./useImageProcessing";

export interface CropRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PassportSpec {
    // Photo dimensions in inches
    widthInches: number;
    heightInches: number;
    // Face should occupy this percentage of photo height
    faceHeightPercent: { min: number; max: number };
    // Eyes should be this percentage from bottom
    eyeLinePercent: { min: number; max: number };
}

// Photo format specifications based on common passport/ID sizes
// Lower faceHeightPercent values = smaller face in frame = more head clearance
export const PASSPORT_SPECS: Record<string, PassportSpec> = {
    // Standard passport sizes - reduced face percentage to prevent head cutting
    "35x45": {
        widthInches: 35 / 25.4, // 35mm
        heightInches: 45 / 25.4, // 45mm
        faceHeightPercent: { min: 50, max: 60 },
        eyeLinePercent: { min: 55, max: 65 },
    },
    "2x2in": {
        widthInches: 2,
        heightInches: 2,
        faceHeightPercent: { min: 40, max: 55 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    "33x48": {
        widthInches: 33 / 25.4,
        heightInches: 48 / 25.4,
        faceHeightPercent: { min: 50, max: 60 },
        eyeLinePercent: { min: 55, max: 65 },
    },
    "35x35": {
        widthInches: 35 / 25.4,
        heightInches: 35 / 25.4,
        faceHeightPercent: { min: 45, max: 55 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    "40x50": {
        widthInches: 40 / 25.4,
        heightInches: 50 / 25.4,
        faceHeightPercent: { min: 45, max: 55 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    "50x70": {
        widthInches: 50 / 25.4,
        heightInches: 70 / 25.4,
        faceHeightPercent: { min: 40, max: 50 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    // Custom sizes
    "wallet": {
        widthInches: 2.5,
        heightInches: 3.5,
        faceHeightPercent: { min: 35, max: 45 },
        eyeLinePercent: { min: 45, max: 55 },
    },
    "stamp": {
        widthInches: 25 / 25.4,
        heightInches: 30 / 25.4,
        faceHeightPercent: { min: 55, max: 65 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    "mini": {
        widthInches: 1,
        heightInches: 1,
        faceHeightPercent: { min: 50, max: 60 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    "visa": {
        widthInches: 2,
        heightInches: 2,
        faceHeightPercent: { min: 40, max: 55 },
        eyeLinePercent: { min: 50, max: 60 },
    },
    DEFAULT: {
        widthInches: 2,
        heightInches: 2,
        faceHeightPercent: { min: 40, max: 55 },
        eyeLinePercent: { min: 50, max: 60 },
    },
};

/**
 * Calculate the optimal crop region for a passport photo based on face landmarks
 * Improved algorithm that better centers the face and ensures proper head clearance
 */
export function calculatePassportCrop(
    faceLandmarks: FaceLandmarks,
    imageWidth: number,
    imageHeight: number,
    spec: PassportSpec = PASSPORT_SPECS.DEFAULT,
    targetAspectRatioOverride?: number
): CropRegion {
    // Calculate face center and dimensions from landmarks
    const eyeCenter = {
        x: (faceLandmarks.leftEye.x + faceLandmarks.rightEye.x) / 2,
        y: (faceLandmarks.leftEye.y + faceLandmarks.rightEye.y) / 2,
    };

    // Use the faceBox for more accurate sizing if available
    const faceHeight = faceLandmarks.faceBox.height;
    const faceWidth = faceLandmarks.faceBox.width;
    const faceCenter = {
        x: faceLandmarks.faceBox.x + faceWidth / 2,
        y: faceLandmarks.faceBox.y + faceHeight / 2,
    };

    // Calculate target aspect ratio
    const targetAspectRatio = targetAspectRatioOverride ?? (spec.widthInches / spec.heightInches);
    
    // Target face percentage of photo height (use middle of the recommended range)
    const targetFacePercent = (spec.faceHeightPercent.min + spec.faceHeightPercent.max) / 2 / 100;
    
    // Target eye line percentage from bottom
    const targetEyePercent = (spec.eyeLinePercent.min + spec.eyeLinePercent.max) / 2 / 100;

    // Calculate crop dimensions based on face size and target percentage
    // The face should fill targetFacePercent of the total height
    let cropHeight = faceHeight / targetFacePercent;
    let cropWidth = cropHeight * targetAspectRatio;

    // Add some padding to ensure we have room for head/chin clearance
    const headClearance = faceHeight * 0.35; // Extra space above head
    const chinClearance = faceHeight * 0.2; // Extra space below chin
    
    // Position crop:
    // - Eyes should be at targetEyePercent from bottom
    // - Center horizontally on face
    const eyeDistanceFromBottom = cropHeight * targetEyePercent;
    let cropTop = eyeCenter.y - (cropHeight - eyeDistanceFromBottom);
    let cropLeft = faceCenter.x - cropWidth / 2;

    // Adjust if top of head would be cut off - use generous clearance
    const topOfHead = faceLandmarks.topOfHead?.y ?? (eyeCenter.y - faceHeight * 0.5);
    const minHeadClearance = cropHeight * 0.12; // At least 12% clearance at top for hair
    if (cropTop > topOfHead - minHeadClearance) {
        cropTop = topOfHead - minHeadClearance;
    }

    // Adjust if chin would be cut off
    const chinY = faceLandmarks.chin?.y ?? (eyeCenter.y + faceHeight * 0.35);
    const minChinClearance = cropHeight * 0.05; // At least 5% clearance at bottom
    if (cropTop + cropHeight < chinY + minChinClearance) {
        cropHeight = chinY + minChinClearance - cropTop;
        cropWidth = cropHeight * targetAspectRatio;
        cropLeft = faceCenter.x - cropWidth / 2;
    }

    // Boundary checking - ensure crop stays within image bounds
    // Scale down if necessary while maintaining aspect ratio
    if (cropWidth > imageWidth || cropHeight > imageHeight) {
        const scale = Math.min(imageWidth / cropWidth, imageHeight / cropHeight);
        cropWidth *= scale;
        cropHeight *= scale;
        cropLeft = faceCenter.x - cropWidth / 2;
        cropTop = eyeCenter.y - (cropHeight - cropHeight * targetEyePercent);
    }

    // Clamp to image bounds
    cropLeft = Math.max(0, Math.min(imageWidth - cropWidth, cropLeft));
    cropTop = Math.max(0, Math.min(imageHeight - cropHeight, cropTop));

    return {
        x: Math.round(cropLeft),
        y: Math.round(cropTop),
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
    };
}

/**
 * Apply passport-compliant crop to an image
 */
export async function applyPassportCrop(
    imageUrl: string,
    faceLandmarks: FaceLandmarks,
    targetWidth: number,
    targetHeight: number,
    backgroundColor: string = "#FFFFFF",
    spec?: PassportSpec
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                // Calculate crop region
                const cropRegion = calculatePassportCrop(
                    faceLandmarks,
                    img.width,
                    img.height,
                    spec
                );

                // Create canvas with target dimensions
                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Fill with background color
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                // Calculate scaling to fit cropped region into target dimensions
                const scale = Math.min(
                    targetWidth / cropRegion.width,
                    targetHeight / cropRegion.height
                );

                const scaledWidth = cropRegion.width * scale;
                const scaledHeight = cropRegion.height * scale;
                const offsetX = (targetWidth - scaledWidth) / 2;
                const offsetY = (targetHeight - scaledHeight) / 2;

                // Draw cropped and scaled image
                ctx.drawImage(
                    img,
                    cropRegion.x,
                    cropRegion.y,
                    cropRegion.width,
                    cropRegion.height,
                    offsetX,
                    offsetY,
                    scaledWidth,
                    scaledHeight
                );

                resolve(canvas.toDataURL("image/png"));
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
    });
}

/**
 * Draw an image onto a canvas with smart face centering
 */
export function drawImageWithFaceCrop(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    faceLandmarks: FaceLandmarks | null | undefined,
    targetWidth: number,
    targetHeight: number,
    spec: PassportSpec = PASSPORT_SPECS.DEFAULT,
    x: number = 0,
    y: number = 0
): void {
    if (!faceLandmarks) {
        // Fallback to standard cover fit if no landmarks
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;

        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
        if (imgRatio > targetRatio) {
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
        } else {
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
        }
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, targetWidth, targetHeight);
        return;
    }

    // Calculate crop region based on landmarks and spec, matching the target aspect ratio
    const targetAspectRatio = targetWidth / targetHeight;
    const crop = calculatePassportCrop(faceLandmarks, img.width, img.height, spec, targetAspectRatio);

    // Draw the crop region onto the target dimensions at (x, y)
    ctx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        x,
        y,
        targetWidth,
        targetHeight
    );
}

/**
 * Get the passport spec for a photo format ID
 */
export function getPassportSpec(formatId: string): PassportSpec {
    const normalizedId = formatId.toLowerCase();
    return PASSPORT_SPECS[normalizedId] || PASSPORT_SPECS.DEFAULT;
}
