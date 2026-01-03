import { create } from "zustand";

export const useDetectionStore = create((set) => ({
  detections: [],
  detectionCount: 0,
  lastUpdate: null,

  setDetections: (detections) => 
    set({ 
      detections, 
      detectionCount: detections?.length || 0,
      lastUpdate: new Date()
    }),

  clearDetections: () => 
    set({ 
      detections: [], 
      detectionCount: 0,
      lastUpdate: null 
    }),
}));

export default useDetectionStore;
