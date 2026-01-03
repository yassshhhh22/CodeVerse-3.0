const isPointInZone = (cellX, cellY, zone) => {
  const { start, end } = zone.grid_cells;
  return cellX >= start.x && cellX <= end.x && cellY >= start.y && cellY <= end.y;
};

const mapDetectionsToZones = (detections, zones, frameWidth, frameHeight, gridRows, gridCols) => {
  const zoneDensities = {};
  
  zones.forEach(zone => {
    zoneDensities[zone._id.toString()] = {
      zone_id: zone._id,
      zone_name: zone.name,
      count: 0,
    };
  });
  
  const cellWidth = frameWidth / gridCols;
  const cellHeight = frameHeight / gridRows;
  
  detections.forEach(detection => {
    const centerX = detection.x + detection.w / 2;
    const centerY = detection.y + detection.h / 2;
    
    const cellX = Math.floor(centerX / cellWidth);
    const cellY = Math.floor(centerY / cellHeight);
    
    if (cellX >= 0 && cellX < gridCols && cellY >= 0 && cellY < gridRows) {
      zones.forEach(zone => {
        if (isPointInZone(cellX, cellY, zone)) {
          zoneDensities[zone._id.toString()].count++;
        }
      });
    }
  });
  
  return zoneDensities;
};

const getZoneDensityFromMatrix = (matrix, zone) => {
  const { start, end } = zone.grid_cells;
  let density = 0;
  
  for (let y = start.y; y <= end.y && y < matrix.length; y++) {
    for (let x = start.x; x <= end.x && x < matrix[0].length; x++) {
      density += matrix[y][x];
    }
  }
  
  return density;
};

export { mapDetectionsToZones, isPointInZone, getZoneDensityFromMatrix };
