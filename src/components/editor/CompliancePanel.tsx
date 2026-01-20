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
  Smile,
  Loader2
} from "lucide-react";
import type { ComplianceResult, CheckStatus } from "@/hooks/useFaceCompliance";

interface CompliancePanelProps {
  compliance: ComplianceResult;
}

const iconMap: Record<string, React.ElementType> = {
  background: Paintbrush,
  head: Move,
  eyes: Eye,
  expression: Smile,
  lighting: Sun,
};

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
  pending: {
    icon: Loader2,
    color: "text-muted-foreground",
    bgColor: "bg-secondary/50 border-muted",
  },
};

export const CompliancePanel = ({ compliance }: CompliancePanelProps) => {
  const { checks, passCount, totalCount, allPassed, isAnalyzing } = compliance;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand" />
          AI Compliance
        </h2>
        {!isAnalyzing && (
          <span className={`text-sm font-bold ${allPassed ? "text-green-600" : "text-amber-600"}`}>
            {passCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Overall Status */}
      <motion.div
        className={`p-3 border-2 ${
          isAnalyzing 
            ? "border-muted bg-secondary/30"
            : allPassed 
              ? "border-green-600 bg-green-50" 
              : "border-amber-600 bg-amber-50"
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        key={isAnalyzing ? "analyzing" : allPassed ? "passed" : "warning"}
      >
        <p className={`text-sm font-bold ${
          isAnalyzing 
            ? "text-muted-foreground"
            : allPassed 
              ? "text-green-700" 
              : "text-amber-700"
        }`}>
          {isAnalyzing 
            ? "⏳ Analyzing your photo..."
            : allPassed 
              ? "✓ Photo meets all requirements!" 
              : "⚠ Minor issues detected (may still be accepted)"}
        </p>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map((check, index) => {
          const StatusIcon = check.status === "pending" && isAnalyzing 
            ? Loader2 
            : statusConfig[check.status].icon;
          const CheckIcon = iconMap[check.iconType] || Paintbrush;

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
                  <StatusIcon 
                    className={`w-5 h-5 ${statusConfig[check.status].color} ${
                      check.status === "pending" && isAnalyzing ? "animate-spin" : ""
                    }`} 
                  />
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
