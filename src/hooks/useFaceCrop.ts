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

// Common passport photo specifications
export const PASSPORT_SPECS: Record<string, PassportSpec> = {
    US: {
        widthInches: 2,
        heightInches: 2,
        faceHeightPercent: { min: 50, max: 69 },
        eyeLinePercent: { min: 56, max: 69 },
    },
    UK: {
        widthInches: 35 / 25.4, // 35mm
        heightInches: 45 / 25.4, // 45mm
        faceHeightPercent: { min: 70, max: 80 },
        eyeLinePercent: { min: 53, max: 66 },
    },
    EU: {
        widthInches: 35 / 25.4,
        heightInches: 45 / 25.4,
        faceHeightPercent: { min: 70, max: 80 },
        eyeLinePercent: { min: 50, max: 70 },
    },
    DEFAULT: {
        widthInches: 2,
        heightInches: 2,
        faceHeightPercent: { min: 50, max: 69 },
        eyeLinePercent: { min: 50, max: 70 },
    },
};

/**
 * Calculate the optimal crop region for a passport photo based on face landmarks
 */
export function calculatePassportCrop(
    faceLandmarks: FaceLandmarks,
    imageWidth: number,
    imageHeight: number,
    spec: PassportSpec = PASSPORT_SPECS.DEFAULT,
    targetAspectRatioOverride?: number
): CropRegion {
    // Calculate face dimensions from landmarks
    const eyeCenter = {
        x: (faceLandmarks.leftEye.x + faceLandmarks.rightEye.x) / 2,
        y: (faceLandmarks.leftEye.y + faceLandmarks.rightEye.y) / 2,
    };

    const eyeDistance = Math.abs(faceLandmarks.rightEye.x - faceLandmarks.leftEye.x);
    // Face height estimation: distance from chin to eyes is roughly half the total head height
    const faceHeight = Math.abs(faceLandmarks.chin.y - eyeCenter.y) * 2;

    // Target: eyes at target percentage from bottom, face at target percentage of height
    const targetAspectRatio = targetAspectRatioOverride ?? (spec.widthInches / spec.heightInches);
    const targetFacePercent = (spec.faceHeightPercent.min + spec.faceHeightPercent.max) / 2 / 100;
    const targetEyePercent = (spec.eyeLinePercent.min + spec.eyeLinePercent.max) / 2 / 100;

    // Calculate crop dimensions
    // The height of the crop is determined by how much of the frame the face should fill
    const cropHeight = faceHeight / targetFacePercent;
    const cropWidth = cropHeight * targetAspectRatio;

    // Position crop so eyes are at the correct height percentage
    // targetEyePercent is from bottom
    const eyeOffsetFromBottom = cropHeight * targetEyePercent;
    const cropTop = eyeCenter.y - (cropHeight - eyeOffsetFromBottom);

    // Center horizontally on face
    const centerX = (faceLandmarks.leftEye.x + faceLandmarks.rightEye.x) / 2;
    const cropLeft = centerX - cropWidth / 2;

    // Boundary check and aspect-ratio preserving adjustment
    let x = cropLeft;
    let y = cropTop;
    let w = cropWidth;
    let h = cropHeight;

    // Handle overflow or underflow while maintaining aspect ratio
    if (w > imageWidth || h > imageHeight) {
        const scale = Math.min(imageWidth / w, imageHeight / h);
        w *= scale;
        h *= scale;
        x = centerX - w / 2;
        y = eyeCenter.y - (h - (h * targetEyePercent));
    }

    // Ensure within bounds
    x = Math.max(0, Math.min(imageWidth - w, x));
    y = Math.max(0, Math.min(imageHeight - h, y));

    return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(w),
        height: Math.round(h),
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
 * Get the passport spec for a country code
 */
export function getPassportSpec(countryCode: string): PassportSpec {
    const upperCode = countryCode.toUpperCase();
    return PASSPORT_SPECS[upperCode] || PASSPORT_SPECS.DEFAULT;
}
