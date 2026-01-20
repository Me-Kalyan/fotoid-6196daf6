import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ShieldCheck,
  Eye,
  Move,
  Sun,
  Paintbrush,
  Smile
} from "lucide-react";

type CheckStatus = "pass" | "warning" | "fail";

interface ComplianceCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  icon: React.ElementType;
}

// Mock compliance data - will be computed by AI in Phase 4
const complianceChecks: ComplianceCheck[] = [
  {
    id: "background",
    label: "Background Removed",
    status: "pass",
    message: "Clean extraction detected",
    icon: Paintbrush,
  },
  {
    id: "head-straight",
    label: "Head Position",
    status: "pass",
    message: "Roll angle: 1.2° (< 5° required)",
    icon: Move,
  },
  {
    id: "eyes-open",
    label: "Eyes Open",
    status: "pass",
    message: "Both eyes clearly visible",
    icon: Eye,
  },
  {
    id: "expression",
    label: "Neutral Expression",
    status: "warning",
    message: "Slight smile detected",
    icon: Smile,
  },
  {
    id: "lighting",
    label: "Lighting Quality",
    status: "warning",
    message: "Minor shadows on left side",
    icon: Sun,
  },
];

const statusConfig: Record<CheckStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  pass: { 
    icon: CheckCircle2, 
    color: "text-green-600", 
    bgColor: "bg-green-50 border-green-600" 
  },
  warning: { 
    icon: AlertCircle, 
    color: "text-amber-600", 
    bgColor: "bg-amber-50 border-amber-600" 
  },
  fail: { 
    icon: XCircle, 
    color: "text-red-600", 
    bgColor: "bg-red-50 border-red-600" 
  },
};

export const CompliancePanel = () => {
  const passCount = complianceChecks.filter((c) => c.status === "pass").length;
  const totalCount = complianceChecks.length;
  const allPassed = passCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand" />
          AI Compliance
        </h2>
        <span className={`text-sm font-bold ${allPassed ? "text-green-600" : "text-amber-600"}`}>
          {passCount}/{totalCount}
        </span>
      </div>

      {/* Overall Status */}
      <motion.div
        className={`p-3 border-2 ${
          allPassed 
            ? "border-green-600 bg-green-50" 
            : "border-amber-600 bg-amber-50"
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <p className={`text-sm font-bold ${allPassed ? "text-green-700" : "text-amber-700"}`}>
          {allPassed 
            ? "✓ Photo meets all requirements!" 
            : "⚠ Minor issues detected (may still be accepted)"}
        </p>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-2">
        {complianceChecks.map((check, index) => {
          const StatusIcon = statusConfig[check.status].icon;
          const CheckIcon = check.icon;

          return (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 border-2 ${statusConfig[check.status].bgColor}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <StatusIcon className={`w-5 h-5 ${statusConfig[check.status].color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-sm">{check.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {check.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Privacy Note */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-secondary">
        🔒 All analysis runs locally on your device
      </div>
    </div>
  );
};
