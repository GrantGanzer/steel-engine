import React from 'react';
import * as d3 from 'd3';

const SteelKey = ({ steels = [], prefs = {} }) => {
  const colorScale = (i) => d3.schemeCategory10[i % 10];

  const showTool = prefs.category === 'Tool' || prefs.category === 'Both';
  const showStainless = prefs.category === 'Stainless' || prefs.category === 'Both';

  const toolSteels = showTool ? steels.filter(s => s.category === 'Tool') : [];
  const stainlessSteels = showStainless ? steels.filter(s => s.category === 'Stainless') : [];

  const renderSteelList = (title, list) => (
    <div className="min-w-[200px]">
      <h4 className="text-white font-bold text-sm uppercase mb-2">{title}</h4>
      <ul className="space-y-1">
        {list.map((steel, i) => (
          <li
            key={steel.name}
            className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <span
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: colorScale(i) }}
            />
            <span className="truncate">
              <strong>{steel.name}</strong>{' '}
              <span className="text-white/60">
                • T: {steel.toughness} | E: {steel.edgeRetention} | C: {steel.corrosion}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div id="key" className="gap-8 text-sm text-white/90">
      {toolSteels.length > 0 && renderSteelList("Tool Steels", toolSteels)}
      {stainlessSteels.length > 0 && renderSteelList("Stainless Steels", stainlessSteels)}
    </div>
  );
};

export default SteelKey;
