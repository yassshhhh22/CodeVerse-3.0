import GridDensity from "../models/GridDensity.js";

const aggregateGridDensity = (currentMatrix, newMatrix, smoothingFactor = 0.7) => {
  if (!currentMatrix || currentMatrix.length === 0) {
    return newMatrix;
  }
  
  const rows = newMatrix.length;
  const cols = newMatrix[0].length;
  const aggregatedMatrix = [];
  
  for (let i = 0; i < rows; i++) {
    aggregatedMatrix[i] = [];
    for (let j = 0; j < cols; j++) {
      aggregatedMatrix[i][j] = Math.round(
        currentMatrix[i][j] * smoothingFactor + newMatrix[i][j] * (1 - smoothingFactor)
      );
    }
  }
  
  return aggregatedMatrix;
};

const accumulateGridDensity = (matrices) => {
  if (!matrices || matrices.length === 0) {
    return null;
  }
  
  const rows = matrices[0].length;
  const cols = matrices[0][0].length;
  const accumulated = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  matrices.forEach(matrix => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        accumulated[i][j] += matrix[i][j];
      }
    }
  });
  
  return accumulated;
};

const saveGridDensity = async (venueId, matrix, aggregationWindow) => {
  const gridDensity = new GridDensity({
    venue_id: venueId,
    matrix,
    timestamp: new Date(),
    aggregation_window: aggregationWindow,
  });
  
  await gridDensity.save();
  return gridDensity;
};

const getLatestGridDensity = async (venueId) => {
  return await GridDensity.findOne({ venue_id: venueId })
    .sort({ timestamp: -1 })
    .lean();
};

export { aggregateGridDensity, accumulateGridDensity, saveGridDensity, getLatestGridDensity };
