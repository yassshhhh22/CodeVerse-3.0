export const isPointInGridCell = (x, y, cellX, cellY, cellWidth, cellHeight) => {
  const cellLeft = cellX * cellWidth;
  const cellRight = (cellX + 1) * cellWidth;
  const cellTop = cellY * cellHeight;
  const cellBottom = (cellY + 1) * cellHeight;
  
  return x >= cellLeft && x < cellRight && y >= cellTop && y < cellBottom;
};

export const getGridCell = (x, y, frameWidth, frameHeight, gridRows, gridCols) => {
  const cellWidth = frameWidth / gridCols;
  const cellHeight = frameHeight / gridRows;
  
  const cellX = Math.floor(x / cellWidth);
  const cellY = Math.floor(y / cellHeight);
  
  return {
    cellX: Math.min(Math.max(cellX, 0), gridCols - 1),
    cellY: Math.min(Math.max(cellY, 0), gridRows - 1),
  };
};

export const isPointInZone = (cellX, cellY, zone) => {
  const { start, end } = zone.grid_cells;
  return cellX >= start.x && cellX <= end.x && cellY >= start.y && cellY <= end.y;
};

export const getZoneCellCount = (zone) => {
  const { start, end } = zone.grid_cells;
  const width = end.x - start.x + 1;
  const height = end.y - start.y + 1;
  return width * height;
};
