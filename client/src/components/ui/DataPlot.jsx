import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const getUserTecPreference = (prefs) => {
  let {
    toughnessWeight,
    edgeRetentionWeight,
    corrosionWeight,
    primaryUse,
    sharpeningFrequency,
    corrosionConcern,
    sharpeningEase,
    knifeUsage,
  } = prefs;

  let E = edgeRetentionWeight * 0.5;
  let T = toughnessWeight * 0.5;
  let C = corrosionWeight * 0.5;

  if (primaryUse === 1 || primaryUse === 5) {
    T += 1.0;
    E -= 0.5;
  } else if (primaryUse === 3 || primaryUse === 4) {
    E += 1.0;
    T -= 0.5;
  }

  if (sharpeningFrequency <= 2) E += 1;
  else if (sharpeningFrequency >= 4) T += 1.2;

  if (corrosionConcern >= 4) C += 1.2;

  E += sharpeningEase * 0.2;

  if (knifeUsage === 1) E += 1.2;
  else if (knifeUsage === 5) T += 1.0;
  else {
    E += 0.8;
    T += 0.8;
  }

  const clamp13 = val => Math.min(13, Math.max(0, val));
  return {
    edgeRetention: clamp13(E),
    toughness: clamp13(T),
    corrosion: clamp13(C),
  };
};

const DataPlot = ({ data, prefs }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 700;
    const height = 540;
    const radius = 200;
    const spread = 1.9;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.style('background-color', 'transparent');

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Outer triangle
    g.append('circle')
      .attr('r', radius)
      .attr('stroke', 'white')
      .attr('fill', 'none');

    // Triangle corners: [Corrosion, Toughness, Edge Retention]
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

    const steelsToShow = data.filter(d =>
      prefs.category === 'Both' || d.category === prefs.category
    );

    const tooltip = d3.select(svgRef.current.parentNode)
      .append('div')
      .attr('class', 'dataplot-tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('color', 'black')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    steelsToShow.forEach((steel, index) => {
      const T = steel.toughness ?? steel.T;
      const E = steel.edgeRetention ?? steel.E;
      const C = steel.corrosion ?? steel.C;
      const total = T + E + C;

      const tx = spread * ((T / total) * corners[1][0] + (E / total) * corners[2][0] + (C / total) * corners[0][0]);
      const ty = spread * ((T / total) * corners[1][1] + (E / total) * corners[2][1] + (C / total) * corners[0][1]);

      const color = colorScale(index);

      g.append('circle')
        .attr('cx', tx)
        .attr('cy', ty)
        .attr('r', 4)
        .attr('fill', color)
        .on('mouseover', function () {
          tooltip.style('display', 'block')
            .html(`${steel.name}<br/>T: ${T}, E: ${E}, C: ${C}`);
        })
        .on('mousemove', function (event) {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function () {
          tooltip.style('display', 'none');
        });

      g.append('text')
        .attr('x', tx + (index % 2 === 0 ? 8 : -8))
        .attr('y', ty + (index % 2 === 0 ? -12 : 12))
        .attr('font-size', '11px')
        .attr('alignment-baseline', 'middle')
        .attr('fill', color)
        .text(steel.name);
    });

    // Draw user preference
    const { edgeRetention, toughness, corrosion } = getUserTecPreference(prefs);
    const totalPref = toughness + edgeRetention + corrosion;

    if (totalPref > 0) {
      let tx = spread * ((toughness / totalPref) * corners[1][0] + (edgeRetention / totalPref) * corners[2][0] + (corrosion / totalPref) * corners[0][0]);
      let ty = spread * ((toughness / totalPref) * corners[1][1] + (edgeRetention / totalPref) * corners[2][1] + (corrosion / totalPref) * corners[0][1]);

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
        // .on('mouseover', function () {
        //   tooltip.style('display', 'block')
        //     .html(`Your Preference<br/>T: ${toughness.toFixed(1)}, E: ${edgeRetention.toFixed(1)}, C: ${corrosion.toFixed(1)}`);
        // })
        .on('mousemove', function (event) {
          tooltip.style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function () {
          tooltip.style('display', 'none');
        });

      g.append('text')
        .attr('x', tx + 12)
        .attr('y', ty - 12)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'white')
        .text('Your Preference');
    }
  }, [data, prefs]);

  return (
    <div className="w-full flex justify-center items-center px-4 overflow-x-auto">
      <svg
        ref={svgRef}
        className="w-full h-auto max-w-[700px]"
        viewBox="0 0 700 540"
        preserveAspectRatio="xMidYMid meet"
      ></svg>
    </div>
  );
};

export default DataPlot;
