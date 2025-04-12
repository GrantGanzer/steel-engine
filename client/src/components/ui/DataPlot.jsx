import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Updated function to use weights directly from prefs
const getUserTecPreference = (prefs) => {
  let { toughnessWeight, edgeRetentionWeight, corrosionWeight, primaryUse, sharpeningFrequency, corrosionConcern, sharpeningEase, knifeUsage } = prefs;

  // Adjust base TEC influence values based on the user's weights
  let E = edgeRetentionWeight * 0.5;
  let T = toughnessWeight * 0.5;
  let C = corrosionWeight * 0.5;

  // Adjust for primary use case (same logic)
  if (primaryUse === 1 || primaryUse === 5) {
    T += 1.0;
    E -= 0.5;
  } else if (primaryUse === 3 || primaryUse === 4) {
    E += 1.0;
    T -= 0.5;
  }

  // Frequency-based adjustment
  if (sharpeningFrequency <= 2) E += 1;
  else if (sharpeningFrequency >= 4) T += 1.2;

  // Corrosion concern adjustment
  if (corrosionConcern >= 4) C += 1.2;

  // Sharpening ease adjustment
  E += sharpeningEase * 0.2;

  // Knife usage adjustment
  if (knifeUsage === 1) E += 1.2;
  else if (knifeUsage === 5) T += 1.0;
  else {
    E += 0.8;
    T += 0.8;
  }

  // Clamp scores to a max of 13
  const clamp13 = val => Math.min(13, Math.max(0, val));

  return {
    edgeRetention: clamp13(E),
    toughness: clamp13(T),
    corrosion: clamp13(C)
  };
};

const DataPlot = ({ data, prefs }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = Math.min(window.innerWidth - 40, 700); // responsive max
    const height = width * 0.77; // keep a proportional height (adjust as needed)
    const radius = 200;
    const pointSpreadFactor = 1.9;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .style('background-color', 'transparent');

    const g = svg.append('g').attr('transform', `translate(${width / 2 - 100}, ${height / 2})`);

    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('stroke', 'white')
      .attr('fill', 'none');

    const corners = [
      [0, -radius],
      [-radius * Math.sin(Math.PI / 3), radius * Math.cos(Math.PI / 3)],
      [radius * Math.sin(Math.PI / 3), radius * Math.cos(Math.PI / 3)],
    ];

    const labels = ['Corrosion Resistance', 'Toughness', 'Edge Retention'];
    corners.forEach(([x, y], i) => {
      g.append('text')
        .attr('x', x * 1.15)
        .attr('y', y * 1.15)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(labels[i]);
    });

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const showTool = prefs.category === 'Tool' || prefs.category === 'Both';
    const showStainless = prefs.category === 'Stainless' || prefs.category === 'Both';

    const toolSteels = showTool ? data.filter(d => d.category === 'Tool') : [];
    const stainlessSteels = showStainless ? data.filter(d => d.category === 'Stainless') : [];


    const tooltip = d3.select(svgRef.current.parentNode)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('color', 'black')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    const filteredData = data.filter(d =>
      (prefs.category === 'Tool' && d.category === 'Tool') ||
      (prefs.category === 'Stainless' && d.category === 'Stainless') ||
      (prefs.category === 'Both')
    );

    filteredData.forEach((item, index) => {
      const T = item.toughness ?? item.T;
      const E = item.edgeRetention ?? item.E;
      const C = item.corrosion ?? item.C;
      const total = T + E + C;

      const tx = pointSpreadFactor * ((T / total) * corners[1][0] + (E / total) * corners[2][0] + (C / total) * corners[0][0]);
      const ty = pointSpreadFactor * ((T / total) * corners[1][1] + (E / total) * corners[2][1] + (C / total) * corners[0][1]);

      const color = colorScale(index);

      g.append('circle')
        .attr('cx', tx)
        .attr('cy', ty)
        .attr('r', 4)
        .attr('fill', color)
        .on('mouseover', function (event) {
          tooltip.style('display', 'block')
            .html(`${item.name}<br/>T: ${T}, E: ${E}, C: ${C}`);
        })
        .on('mousemove', function (event) {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function () {
          tooltip.style('display', 'none');
        });

      const direction = index % 2 === 0 ? 1 : -1;
      const offsetX = 8 * direction;
      const offsetY = -12 * direction;

      g.append('text')
        .attr('x', tx + offsetX)
        .attr('y', ty + offsetY)
        .attr('font-size', '11px')
        .attr('alignment-baseline', 'middle')
        .attr('fill', color)
        .text(item.name);
    });

    // Use getUserTecPreference to calculate adjusted TEC
    if (prefs) {
      const adjusted = getUserTecPreference(prefs);
      const { edgeRetention, toughness, corrosion } = adjusted;
      const total = toughness + edgeRetention + corrosion;
      console.log('User TEC Preference (adjusted):', adjusted);

      if (total > 0) {
        let tx = pointSpreadFactor * ((toughness / total) * corners[1][0] + (edgeRetention / total) * corners[2][0] + (corrosion / total) * corners[0][0]);
        let ty = pointSpreadFactor * ((toughness / total) * corners[1][1] + (edgeRetention / total) * corners[2][1] + (corrosion / total) * corners[0][1]);

        const distance = Math.sqrt(tx * tx + ty * ty);
        if (distance > radius) {
          const scale = radius / distance;
          tx *= scale;
          ty *= scale;
        }

        g.append('circle')
          .attr('cx', tx)
          .attr('cy', ty)
          .attr('r', 8)
          .attr('fill', 'white')

        // mousover feature for user prefrence score

        // .on('mouseover', function (event) {
        //   tooltip.style('display', 'block')
        //     .html(`Your Preference<br/>T: ${toughness.toFixed(1)}, E: ${edgeRetention.toFixed(1)}, C: ${corrosion.toFixed(1)}`);
        // })
        // .on('mousemove', function (event) {
        //   tooltip.style('left', `${event.pageX + 10}px`)
        //     .style('top', `${event.pageY - 28}px`);
        // })
        // .on('mouseout', function () {
        //   tooltip.style('display', 'none');
        // });

        g.append('text')
          .attr('x', tx + 12)
          .attr('y', ty - 12)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('alignment-baseline', 'middle')
          .attr('fill', 'white')
          .text('Your Preference');
      }
    }
  }, [data, prefs]);

  return <div className="w-full max-w-[700px] mx-auto px-4">
    <svg ref={svgRef} className="w-full h-auto block" />
  </div>;
};

export default DataPlot;
