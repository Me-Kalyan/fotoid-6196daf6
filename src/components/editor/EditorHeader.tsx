import { motion } from "framer-motion";
import { ArrowLeft, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import type { EditorState } from "@/pages/Editor";

interface EditorHeaderProps {
  editorState: EditorState;
  onStartOver: () => void;
}

export const EditorHeader = ({ editorState, onStartOver }: EditorHeaderProps) => {
  const stateLabels: Record<EditorState, string> = {
    upload: "Upload Photo",
    processing: "Processing...",
    review: "Review & Edit",
    download: "Download",
  };

  return (
    <header className="border-b-3 border-primary bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-heading font-bold text-lg hidden sm:inline">Back</span>
            </motion.div>
          </Link>
          
          <div className="h-6 w-px bg-primary hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-brand" />
            <span className="font-heading font-bold text-xl">PassportPop</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="px-4 py-2 border-2 border-primary bg-highlight text-highlight-foreground font-heading font-bold text-sm"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            key={editorState}
          >
            {stateLabels[editorState]}
          </motion.div>

          {editorState !== "upload" && (
            <NeoButton
              variant="outline"
              size="sm"
              onClick={onStartOver}
            >
              Start Over
            </NeoButton>
          )}
        </div>
      </div>
    </header>
  );
};
