import { useState, useEffect } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { NeoButton } from "@/components/ui/neo-button";
import { processImage } from "@/lib/process-image";
import { photoPresets, paperSizes, type PaperSize } from "@/lib/sizes";
import { getCroppedImg, generateSheet } from "@/lib/canvasUtils";
import { Loader2, ArrowLeft, Upload, Settings2, Printer, Download, RotateCcw, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/editor/AuthGate";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/use-toast";

const Editor = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    canDownloadFree, 
    freeDownloadsRemaining, 
    isProActive,
    recordDownload,
    isRecording 
  } = useDownloadHistory();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  // --- STATE ---
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Photo Config
  const [width, setWidth] = useState(51); // Default 2x2 inch in mm
  const [height, setHeight] = useState(51);

  // Cropper Config
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Download State
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [sheetResult, setSheetResult] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(paperSizes[0]);

  // Clean up memory on unmount
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  // --- ACTIONS ---

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Memory Cleanup
    if (image) URL.revokeObjectURL(image);
    
    const url = URL.createObjectURL(file);
    setImage(url);
    setIsProcessing(true);
    try {
      const removedBg = await processImage(url);
      setProcessedImage(removedBg);
    } catch {
      alert("Error removing background");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!processedImage || !croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const single = await getCroppedImg(
        processedImage,
        croppedAreaPixels,
        rotation,
        width,
        height
      );
      setSingleResult(single);

      const sheet = await generateSheet(
        single,
        width,
        height,
        selectedPaper.width,
        selectedPaper.height
      );
      setSheetResult(sheet);

      setView("preview");
    } catch (e) {
      console.error(e);
      alert("Generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaperChange = async (paper: PaperSize) => {
    setSelectedPaper(paper);
    if (singleResult) {
      const sheet = await generateSheet(
        singleResult,
        width,
        height,
        paper.width,
        paper.height
      );
      setSheetResult(sheet);
    }
  };

  const onCropComplete = (_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  // Reset all crop parameters together
  const handleResetAll = () => {
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  // --- DOWNLOAD WITH PAYMENT GATE ---
  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (fileUrl: string, fileName: string, photoType: 'single' | 'sheet') => {
    // Case 1: Pro user - unlimited downloads
    if (isProActive) {
      triggerDownload(fileUrl, fileName);
      recordDownload({ photoType, isPaid: false });
      toast({
        title: "Download Started!",
        description: "Enjoy your Pro benefits 🎉",
      });
      return;
    }

    // Case 2: Free downloads remaining
    if (canDownloadFree) {
      triggerDownload(fileUrl, fileName);
      recordDownload({ photoType, isPaid: false });
      const remaining = freeDownloadsRemaining - 1;
      toast({
        title: "Download Started!",
        description: remaining > 0 
          ? `${remaining} free download${remaining !== 1 ? 's' : ''} remaining`
          : "This was your last free download. Upgrade to Pro for unlimited!",
      });
      return;
    }

    // Case 3: Limit reached - trigger payment
    toast({
      title: "Free limit reached",
      description: "Complete payment to download your photo",
    });
    
    const success = await initiatePayment("single");
    if (success) {
      triggerDownload(fileUrl, fileName);
      recordDownload({ photoType, isPaid: true });
      toast({
        title: "Payment successful!",
        description: "Your download has started",
      });
    }
  };

  const isDownloading = isPaymentLoading || isRecording;

  // --- AUTH LOADING STATE ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // --- AUTH GATE ---
  if (!user) {
    return <AuthGate message="Sign in to create your passport photo" />;
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b-3 border-primary bg-card">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-heading font-bold text-sm">HOME</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-lg text-brand">FOTOID</span>
          <span className="font-heading font-bold text-sm text-muted-foreground">STUDIO</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL: CANVAS */}
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 overflow-auto">
          {/* VIEW 1: EDITOR */}
          <div className={cn("w-full h-full", view !== "edit" && "hidden")}>
            {!image && (
              <label className="flex flex-col items-center justify-center h-[50vh] min-h-[300px] max-h-[500px] border-3 border-dashed border-primary bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                <Upload className="w-16 h-16 text-brand mb-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <p className="font-heading font-bold text-xl">UPLOAD SELFIE</p>
              </label>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-[50vh] min-h-[300px] max-h-[500px]">
                <Loader2 className="w-12 h-12 animate-spin text-brand mb-4" />
                <p className="font-heading font-bold">AI PROCESSING...</p>
              </div>
            )}

            {processedImage && !isProcessing && (
              <div className="relative w-full h-[50vh] min-h-[300px] max-h-[500px] bg-muted">
                <Cropper
                  image={processedImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={width / height}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  objectFit="contain"
                  showGrid={true}
                  classes={{
                    containerClassName: "!bg-muted",
                    cropAreaClassName: "!border-brand !border-2",
                  }}
                />
              </div>
            )}
          </div>

          {/* VIEW 2: PREVIEW */}
          <div className={cn("w-full h-full flex items-center justify-center", view !== "preview" && "hidden")}>
            {sheetResult && (
              <div className="relative max-w-full max-h-[60vh]">
                <img
                  src={sheetResult}
                  alt="Generated sheet"
                  className="max-w-full max-h-[60vh] object-contain border-3 border-primary shadow-neo"
                />
                <div className="absolute top-2 left-2 bg-brand text-brand-foreground px-2 py-1 font-heading font-bold text-xs">
                  PREVIEW
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CONTROLS */}
        <div className="w-full lg:w-80 border-t-3 lg:border-t-0 lg:border-l-3 border-primary bg-card p-4 overflow-y-auto">
          {/* CONTROLS: EDIT MODE */}
          <div className={cn(view !== "edit" && "hidden")}>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-brand" />
              <span className="font-heading font-bold">PHOTO SIZE</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {photoPresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setWidth(p.width);
                    setHeight(p.height);
                  }}
                  className={cn(
                    "text-xs border-2 px-2 py-2 font-bold transition-all text-left",
                    width === p.width && height === p.height
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-muted-foreground/30 hover:border-muted-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground">WIDTH (mm)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full border-2 border-primary p-2 font-heading font-bold bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">HEIGHT (mm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full border-2 border-primary p-2 font-heading font-bold bg-background"
                />
              </div>
            </div>

            {processedImage && (
              <>
                <hr className="border-primary my-4" />

                {/* Rotation Controls */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      ROTATION ({rotation}°)
                    </span>
                    <button
                      onClick={handleResetAll}
                      className="text-brand text-xs font-bold hover:underline"
                    >
                      RESET ALL
                    </button>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-brand h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setRotation((r) => r - 90)}
                      className="flex-1 p-2 border-2 border-primary hover:bg-secondary flex justify-center"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setRotation((r) => r + 90)}
                      className="flex-1 p-2 border-2 border-primary hover:bg-secondary flex justify-center"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Zoom Control */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-muted-foreground">ZOOM</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-brand h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <NeoButton onClick={handleGenerate} className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    "NEXT: PREVIEW →"
                  )}
                </NeoButton>
              </>
            )}
          </div>

          {/* CONTROLS: PREVIEW MODE */}
          <div className={cn(view !== "preview" && "hidden")}>
            <div className="flex items-center gap-2 mb-4">
              <Printer className="w-5 h-5 text-brand" />
              <span className="font-heading font-bold">PRINT LAYOUT</span>
            </div>

            {/* Paper Selector */}
            <div className="flex flex-col gap-2 mb-4">
              {paperSizes.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePaperChange(p)}
                  className={cn(
                    "flex items-center justify-between p-3 border-2 font-bold text-left transition-colors",
                    selectedPaper.label === p.label
                      ? "border-brand bg-brand/10"
                      : "border-muted-foreground/30 hover:border-muted-foreground"
                  )}
                >
                  <span>{p.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.width}x{p.height}mm
                  </span>
                </button>
              ))}
            </div>

            <hr className="border-primary my-4" />

            {/* Download Actions - WITH PAYMENT GATE */}
            <div className="space-y-2">
              <NeoButton 
                onClick={() => handleDownload(
                  sheetResult!, 
                  `fotoid-sheet-${selectedPaper.label.replace(/\s+/g, "-")}.jpg`,
                  'sheet'
                )}
                className="w-full flex items-center justify-center gap-2"
                disabled={isDownloading || !sheetResult}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                DOWNLOAD SHEET
              </NeoButton>

              <NeoButton 
                variant="secondary" 
                onClick={() => handleDownload(
                  singleResult!, 
                  `fotoid-single-${width}x${height}mm.png`,
                  'single'
                )}
                className="w-full flex items-center justify-center gap-2"
                disabled={isDownloading || !singleResult}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                DOWNLOAD SINGLE PHOTO
              </NeoButton>

              <button
                onClick={() => setView("edit")}
                className="w-full text-muted-foreground text-sm font-bold underline mt-2 hover:text-foreground"
              >
                ← Go Back to Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
