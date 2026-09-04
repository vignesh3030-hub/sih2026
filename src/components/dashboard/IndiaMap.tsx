import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoCentroid } from 'd3-geo';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { InfrastructureProject } from '../../types';

interface IndiaMapProps {
  projects: InfrastructureProject[];
  selectedState: string | null;
  onStateSelect: (stateName: string | null) => void;
}

const geoUrl = '/india-states.geojson';

export const IndiaMap: React.FC<IndiaMapProps> = ({ projects, selectedState, onStateSelect }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [position, setPosition] = useState({ coordinates: [80, 22], zoom: 1 });

  // Pre-calculate project counts per state for the choropleth
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      // Normalize state names slightly to match GeoJSON NAME_1 if needed
      // Our mock data states usually match standard names (e.g., Gujarat, Maharashtra)
      const st = p.state;
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const maxProjects = Math.max(...Object.values(stateCounts), 10);

  // Gradient color scale from light to dark based on project count
  const colorScale = scaleLinear<string>()
    .domain([0, maxProjects])
    .range(["#f8fafc", "#1e3a8a"]); // slate-50 to blue-900

  // Standardize state names between GeoJSON and our data if needed
  const normalizeStateName = (name: string) => {
    if (name === 'Andaman and Nicobar') return 'Andaman and Nicobar Islands';
    if (name === 'Delhi') return 'Delhi';
    return name;
  };

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) {
      // If zooming all the way out, reset center
      setPosition({ coordinates: [80, 22], zoom: 1 });
      return;
    }
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [80, 22], zoom: 1 });
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden relative border border-slate-200 z-10 bg-slate-50 flex items-center justify-center">
      
      {/* Legend */}
      <div className="absolute right-4 bottom-4 z-20 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-[10px] font-bold text-slate-700 mb-1">Project Count</div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-32 rounded bg-linear-to-b from-[#1e3a8a] to-[#f8fafc] border border-slate-200"></div>
          <div className="flex flex-col justify-between h-32 absolute left-8 text-[9px] font-mono text-slate-500 py-1">
            <span>{maxProjects}</span>
            <span>{Math.round(maxProjects * 0.75)}</span>
            <span>{Math.round(maxProjects * 0.5)}</span>
            <span>{Math.round(maxProjects * 0.25)}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 850,
          center: [82.0, 22.5]
        }}
        width={600}
        height={600}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={(pos) => setPosition(pos)}
          filterZoomEvent={(evt: any) => {
             return evt.type === 'wheel' ? false : true;
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const stateName = normalizeStateName(geo.properties.NAME_1);
                  const count = stateCounts[stateName] || 0;
                  const isSelected = selectedState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setTooltipContent(`${stateName} (${count} Projects)`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent('');
                      }}
                      onClick={() => {
                        onStateSelect(isSelected ? null : stateName);
                      }}
                      style={{
                        default: {
                          fill: isSelected ? "#3b82f6" : colorScale(count),
                          stroke: "#000000",
                          strokeWidth: isSelected ? 2 : 1,
                          outline: "none",
                          transition: "all 0.3s ease"
                        },
                        hover: {
                          fill: "#60a5fa",
                          stroke: "#000000",
                          strokeWidth: 1.5,
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        },
                        pressed: {
                          fill: "#2563eb",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })}
                {geographies.map((geo) => {
                  const stateName = normalizeStateName(geo.properties.NAME_1);
                  const centroid = geoCentroid(geo);
                  return (
                    <Marker key={`${geo.rsmKey}-label`} coordinates={centroid}>
                      <text
                        textAnchor="middle"
                        y={2}
                        className="text-[6px] font-bold fill-black pointer-events-none drop-shadow-sm"
                        style={{ textShadow: "1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white" }}
                      >
                        {stateName}
                      </text>
                    </Marker>
                  );
                })}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Dynamic Hover Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-4 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded shadow pointer-events-none z-50 transition-opacity">
          {tooltipContent}
        </div>
      )}

      {/* Current Selection Label */}
      {selectedState && (
        <div className="absolute top-12 left-4 flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded shadow-sm z-50">
          <span>{selectedState}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onStateSelect(null); }}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-900 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Map Zoom Controls */}
      <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-100" />
        <button
          onClick={handleResetZoom}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 transition-colors"
          title="Reset Zoom"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-100" />
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
