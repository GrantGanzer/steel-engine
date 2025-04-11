import React from 'react';
import * as d3 from 'd3';

const SteelKey = ({ steels = [], prefs = {} }) => {
    const colorScale = (i) => d3.schemeCategory10[i % 10];

    const showTool = prefs.category === 'Tool' || prefs.category === 'Both';
    const showStainless = prefs.category === 'Stainless' || prefs.category === 'Both';

    const toolSteels = showTool ? steels.filter(s => s.category === 'Tool') : [];
    const stainlessSteels = showStainless ? steels.filter(s => s.category === 'Stainless') : [];

    return (
        <div id='key' className="mt-6 gap-8 text-sm text-white/90">
            {toolSteels.length > 0 && (
                <div className="min-w-[200px]">
                    <h4 className="text-white font-bold text-sm uppercase mb-2">Tool Steels</h4>
                    <ul className="space-y-1">
                        {toolSteels.map((steel, i) => (
                            <li key={i} className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
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
            )}

            {stainlessSteels.length > 0 && (
                <div className="min-w-[200px]">
                    <h4 className="text-white font-bold text-sm uppercase mb-2">Stainless Steels</h4>
                    <ul className="space-y-1">
                        {stainlessSteels.map((steel, i) => (
                            <li key={i} className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
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
            )}
        </div>
    );
}

export default SteelKey;
