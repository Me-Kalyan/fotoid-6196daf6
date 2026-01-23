import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Camera, ImageIcon, Sun, Lightbulb } from "lucide-react";
import { NeoCard } from "@/components/ui/neo-card";
import { NeoBadge } from "@/components/ui/neo-badge";

export type ProcessingErrorType =
  | "no_face"
  | "multiple_faces"
  | "low_resolution"
  | "bad_lighting"
  | "face_too_close"
  | "face_too_far"
  | "face_obstructed"
  | "background_removal_failed"
  | "generic";

interface ProcessingErrorFeedbackProps {
  errorType: ProcessingErrorType;
  errorMessage?: string;
}

interface ErrorConfig {
  title: string;
  description: string;
  tips: string[];
  icon: typeof Camera;
}

const errorConfigs: Record<ProcessingErrorType, ErrorConfig> = {
  no_face: {
    title: "No Face Detected",
    description: "We couldn't find a face in your photo. This might happen if the face is too small, turned away, or covered.",
    tips: [
      "Make sure your face is clearly visible",
      "Face the camera directly",
      "Remove hats, sunglasses, or anything covering your face",
      "Ensure good lighting on your face",
    ],
    icon: Camera,
  },
  multiple_faces: {
    title: "Multiple Faces Detected",
    description: "Passport photos must contain only one person. We detected multiple faces in your image.",
    tips: [
      "Crop the photo to include only your face",
      "Take a new photo with only yourself in frame",
      "Ensure no one is in the background",
    ],
    icon: Camera,
  },
  low_resolution: {
    title: "Image Quality Too Low",
    description: "The photo resolution is too low for a quality passport photo.",
    tips: [
      "Use a photo at least 600×600 pixels",
      "Avoid heavily compressed images",
      "Take a new photo with your phone's main camera",
      "Don't use screenshots or cropped thumbnails",
    ],
    icon: ImageIcon,
  },
  bad_lighting: {
    title: "Poor Lighting Detected",
    description: "The lighting in your photo may cause issues. Passport photos need even, neutral lighting.",
    tips: [
      "Use natural daylight or bright indoor lighting",
      "Face a window or light source",
      "Avoid harsh shadows on your face",
      "Don't use flash directly at your face",
    ],
    icon: Sun,
  },
  face_too_close: {
    title: "Face Too Close",
    description: "Your face takes up too much of the photo. Passport photos need space around your head.",
    tips: [
      "Move further from the camera",
      "Include your shoulders in the frame",
      "Leave space above your head",
    ],
    icon: Camera,
  },
  face_too_far: {
    title: "Face Too Far Away",
    description: "Your face is too small in the photo. We need a closer view for good quality.",
    tips: [
      "Move closer to the camera",
      "Your head should fill about 70-80% of the frame height",
      "Use portrait mode if available",
    ],
    icon: Camera,
  },
  face_obstructed: {
    title: "Face Partially Covered",
    description: "Part of your face appears to be covered or obstructed.",
    tips: [
      "Remove glasses, hats, or headphones",
      "Make sure your entire face is visible",
      "Pull hair away from your face",
      "Remove any face masks",
    ],
    icon: Camera,
  },
  background_removal_failed: {
    title: "Background Removal Failed",
    description: "We had trouble removing the background from your photo.",
    tips: [
      "Use a photo with a plain, contrasting background",
      "Avoid busy patterns or similar-colored backgrounds",
      "Ensure good contrast between you and the background",
      "Try a photo with a solid white or light grey background",
    ],
    icon: ImageIcon,
  },
  generic: {
    title: "Processing Error",
    description: "Something went wrong while processing your photo.",
    tips: [
      "Try uploading the photo again",
      "Use a different photo",
      "Check your internet connection",
      "If the problem persists, contact support",
    ],
    icon: AlertTriangle,
  },
};

export const parseErrorType = (errorMessage: string): ProcessingErrorType => {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes("no face") || lowerMessage.includes("face detected")) {
    return "no_face";
  }
  if (lowerMessage.includes("multiple face")) {
    return "multiple_faces";
  }
  if (lowerMessage.includes("resolution") || lowerMessage.includes("too small") || lowerMessage.includes("quality")) {
    return "low_resolution";
  }
  if (lowerMessage.includes("lighting") || lowerMessage.includes("dark") || lowerMessage.includes("bright")) {
    return "bad_lighting";
  }
  if (lowerMessage.includes("too close")) {
    return "face_too_close";
  }
  if (lowerMessage.includes("too far") || lowerMessage.includes("too small")) {
    return "face_too_far";
  }
  if (lowerMessage.includes("obstructed") || lowerMessage.includes("covered")) {
    return "face_obstructed";
  }
  if (lowerMessage.includes("background")) {
    return "background_removal_failed";
  }
  
  return "generic";
};

export const ProcessingErrorFeedback = ({
  errorType,
  errorMessage,
}: ProcessingErrorFeedbackProps) => {
  const config = errorConfigs[errorType];
  const IconComponent = config.icon;

  return (
    <NeoCard className="p-6 border-destructive">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-destructive/10 border-2 border-destructive flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-destructive">
            {config.title}
          </h3>
          <p className="text-muted-foreground mt-1">
            {config.description}
          </p>
          {errorMessage && errorType !== "generic" && (
            <p className="text-sm text-muted-foreground/70 mt-2 font-mono">
              Details: {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-muted border-2 border-primary">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-highlight" />
          <span className="font-heading font-bold text-sm">How to fix this</span>
        </div>
        <ul className="space-y-2">
          {config.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="w-5 h-5 bg-background border border-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Example badge */}
      <div className="mt-4 flex flex-wrap gap-2">
        <NeoBadge variant="outline" size="sm">
          Need help? Check our FAQ
        </NeoBadge>
      </div>
    </NeoCard>
  );
};
