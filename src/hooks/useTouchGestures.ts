import { useState, useCallback, useRef } from "react";
import { triggerHaptic } from "./useHapticFeedback";

interface TouchGestureState {
  zoom: number;
  position: { x: number; y: number };
}

interface UseTouchGesturesOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
  enableHaptics?: boolean;
}

export const useTouchGestures = ({
  minZoom = 50,
  maxZoom = 200,
  initialZoom = 100,
  onZoomChange,
  enableHaptics = true,
}: UseTouchGesturesOptions = {}) => {
  const [zoom, setZoomState] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Touch gesture tracking
  const touchStartRef = useRef<{ 
    touches: { x: number; y: number }[];
    initialDistance: number;
    initialZoom: number;
    initialPosition: { x: number; y: number };
    center: { x: number; y: number };
  } | null>(null);
  
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const setZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));
    setZoomState(clampedZoom);
    onZoomChange?.(clampedZoom);
  }, [minZoom, maxZoom, onZoomChange]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture start - trigger haptic
      e.preventDefault();
      if (enableHaptics) triggerHaptic("selection");
      
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      touchStartRef.current = {
        touches: Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY })),
        initialDistance: distance,
        initialZoom: zoom,
        initialPosition: { ...position },
        center,
      };
    } else if (e.touches.length === 1) {
      // Single touch - pan
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  }, [zoom, position, enableHaptics]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      // Pinch to zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / touchStartRef.current.initialDistance;
      const newZoom = touchStartRef.current.initialZoom * scale;
      
      setZoom(newZoom);
      
      // Also handle pan during pinch
      const currentCenter = getTouchCenter(e.touches);
      const deltaX = currentCenter.x - touchStartRef.current.center.x;
      const deltaY = currentCenter.y - touchStartRef.current.center.y;
      
      setPosition({
        x: touchStartRef.current.initialPosition.x + deltaX,
        y: touchStartRef.current.initialPosition.y + deltaY,
      });
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch pan
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      
      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    }
  }, [isDragging, setZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2 && touchStartRef.current) {
      // End of pinch gesture - trigger haptic
      if (enableHaptics) triggerHaptic("light");
      touchStartRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  }, [enableHaptics]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  }, [initialZoom, setZoom]);

  return {
    zoom,
    setZoom,
    position,
    setPosition,
    isDragging,
    resetView,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
    },
  };
};
