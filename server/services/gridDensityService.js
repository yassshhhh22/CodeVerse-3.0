const calculateGridDensity = (detections, frameWidth, frameHeight, gridRows, gridCols) => {
  const matrix = Array(gridRows).fill(0).map(() => Array(gridCols).fill(0));
  
  const cellWidth = frameWidth / gridCols;
  const cellHeight = frameHeight / gridRows;
  
  detections.forEach(detection => {
    const centerX = detection.x + detection.w / 2;
    const centerY = detection.y + detection.h / 2;
    
    const cellX = Math.floor(centerX / cellWidth);
    const cellY = Math.floor(centerY / cellHeight);
    
    if (cellX >= 0 && cellX < gridCols && cellY >= 0 && cellY < gridRows) {
      matrix[cellY][cellX]++;
    }
  });
  
  return matrix;
};

const getTotalDensity = (matrix) => {
  return matrix.reduce((total, row) => {
    return total + row.reduce((rowSum, cell) => rowSum + cell, 0);
  }, 0);
};

const getMaxDensity = (matrix) => {
  return Math.max(...matrix.map(row => Math.max(...row)));
};

export { calculateGridDensity, getTotalDensity, getMaxDensity };
