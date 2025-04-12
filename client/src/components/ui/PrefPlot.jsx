import React, { useState, useEffect } from "react";
import { select, drag } from "d3";

const PrefPlot = ({ onWeightChange }) => {
  const [toughnessWeight, setToughnessWeight] = useState(1);
  const [edgeRetentionWeight, setEdgeRetentionWeight] = useState(1);
  const [corrosionWeight, setCorrosionWeight] = useState(1);

  const handleWeightChange = (t, e, c) => {
    setToughnessWeight(t);
    setEdgeRetentionWeight(e);
    setCorrosionWeight(c);
    onWeightChange(t, e, c);
  };

  useEffect(() => {
    const svg = select("#prefplot");
    svg.selectAll("*").remove();

    const width = 600;
    const height = 240;
    const radius = 150;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height})`);

    g.append("path")
      .attr("d", `M -${radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`)
      .attr("stroke", "white")
      .attr("fill", "none");

    const corners = [
      [0, -radius],
      [radius, 0],
      [-radius, 0],
    ];
    const labels = ["Corrosion Resistance", "Edge Retention", "Toughness"];

    corners.forEach(([x, y], i) => {
      let labelX = x * 1.4;
      let labelY = y * 1.15;
      if (i === 1) labelX += 20;
      if (i === 2) labelX -= 20;

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(labels[i]);
    });

    const axisAngles = [0, Math.PI];
    axisAngles.forEach((angle) => {
      const x1 = radius * Math.cos(angle);
      const y1 = radius * Math.sin(angle);
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x1)
        .attr("y2", y1)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });

    g.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("class", "center-dot");

    let currentX = 0;
    let currentY = 0;

    g.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("cx", currentX)
      .attr("cy", currentY)
      .call(
        drag()
          .on("start", function () {
            svg.selectAll(".center-dot").remove();
          })
          .on("drag", function (event) {
            const offsetX = event.x - width / 100;
            const offsetY = event.y - height / 100;
            const totalDistance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
            if (offsetY <= 0 && totalDistance <= radius) {
              currentX = offsetX;
              currentY = offsetY;
              select(this).attr("cx", currentX).attr("cy", currentY);
            }
          })
          .on("end", function () {
            const labelPositions = [
              { x: 0, y: -radius },
              { x: radius, y: 0 },
              { x: -radius, y: 0 },
            ];

            let corrosionWeight = 0;
            let edgeRetentionWeight = 0;
            let toughnessWeight = 0;

            labelPositions.forEach((label, index) => {
              const distance = Math.sqrt(
                (currentX - label.x) ** 2 + (currentY - label.y) ** 2
              );
              const weight = Math.min(4, Math.max(1 + (1 - distance / radius) * 3, 1));
              if (index === 0) corrosionWeight = weight;
              if (index === 1) edgeRetentionWeight = weight;
              if (index === 2) toughnessWeight = weight;
            });

            handleWeightChange(toughnessWeight, edgeRetentionWeight, corrosionWeight);
          })
      );
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl px-4 mx-auto">
      <div className="mb-4 p-3 rounded-lg text-white text-m">
        <p><strong>Set your TEC preferences:</strong></p>
        <p>Favoring toughness will highlight steels that resist chipping and excel under impact.</p>
        <p>Choosing edge retention prioritizes steels that stay sharper for longer.</p>
        <p>Emphasizing corrosion resistance brings forward options better suited to wet or humid conditions.</p>
        <p className="mt-2">These choices will shape the recommendations we make for you.</p>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          id="prefplot"
          className="prefplot-chart"
          viewBox="0 0 600 300"
          preserveAspectRatio="xMidYMid meet"
        ></svg>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm w-32">Toughness</p>
          <div className="h-4 bg-white" style={{ width: `${toughnessWeight * 35 - 30}px` }}></div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-white text-sm w-32">Edge Retention</p>
          <div className="h-4 bg-white" style={{ width: `${edgeRetentionWeight * 35 - 30}px` }}></div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-white text-sm w-32">Corrosion Resistance</p>
          <div className="h-4 bg-white" style={{ width: `${corrosionWeight * 35 - 30}px` }}></div>
        </div>
      </div>
    </div>
  );
};

export default PrefPlot;
