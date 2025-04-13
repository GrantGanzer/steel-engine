import React, { useState, useEffect } from "react";
import { select, drag } from "d3";

const PrefPlot = ({ onWeightChange }) => {
  const [weights, setWeights] = useState({
    toughness: 1,
    edgeRetention: 1,
    corrosion: 1,
  });

  const updateWeights = (t, e, c) => {
    setWeights({ toughness: t, edgeRetention: e, corrosion: c });
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
      [0, -radius],        // Corrosion
      [radius, 0],         // Edge Retention
      [-radius, 0],        // Toughness
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

    g.selectAll(".radial-line")
      .data([0, Math.PI])
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d) => radius * Math.cos(d))
      .attr("y2", (d) => radius * Math.sin(d))
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    g.append("circle").attr("r", 8).attr("fill", "white").attr("class", "center-dot");

    let currentX = 0;
    let currentY = 0;

    const handleDragEnd = () => {
      const positions = [
        { x: 0, y: -radius },    // Corrosion
        { x: radius, y: 0 },     // Edge Retention
        { x: -radius, y: 0 },    // Toughness
      ];

      let newWeights = { corrosion: 0, edgeRetention: 0, toughness: 0 };

      positions.forEach((pos, idx) => {
        const distance = Math.sqrt((currentX - pos.x) ** 2 + (currentY - pos.y) ** 2);
        const weight = Math.min(4, Math.max(1 + (1 - distance / radius) * 3, 1));
        if (idx === 0) newWeights.corrosion = weight;
        if (idx === 1) newWeights.edgeRetention = weight;
        if (idx === 2) newWeights.toughness = weight;
      });

      updateWeights(newWeights.toughness, newWeights.edgeRetention, newWeights.corrosion);
    };

    g.append("circle")
      .attr("r", 13)
      .attr("fill", "white")
      .attr("cx", currentX)
      .attr("cy", currentY)
      .attr("class", "hoverable-dot")
      .call(
        drag()
          .on("start", () => svg.selectAll(".center-dot").remove())
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
          .on("end", handleDragEnd)
      );
  }, []);

  const bars = [
    {
      name: "Toughness",
      value: weights.toughness,
      tooltip: "Resists chipping under stress,\nbut may dull faster.",
    },
    {
      name: "Edge Retention",
      value: weights.edgeRetention,
      tooltip: "Holds a sharp edge longer,\nwith less impact durability.",
    },
    {
      name: "Corrosion Resistance",
      value: weights.corrosion,
      tooltip: "Excels in wet conditions,\nbut may sacrifice strength or edge life.",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-3xl px-4 mx-auto">
      <div className="mb-4 p-3 rounded-lg text-white text-m">
        <p><strong>Set your preferred balance:</strong></p>
        <p className="mt-2">Your selection shapes the ideal steel match.</p>
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
        {bars.map(({ name, value, tooltip }, i) => (
          <div key={name} className="flex items-center gap-2 relative group">
            <div className="relative flex items-center">
              <span className="text-black cursor-pointer text-sm rounded-full bg-gray-300 w-3 h-3 flex items-center justify-center">i</span>
              <div className="absolute right-6 mb-1 hidden group-hover:flex w-48 p-2 rounded-md bg-gray-800 text-white text-sm z-10 whitespace-pre-wrap">
                <p className="text-xs leading-tight">{tooltip}</p>
              </div>
            </div>
            <p className="text-white text-lg w-32 font-semibold">{name}:</p>
            <div className="h-4 bg-red-700" style={{ width: `${value * 35 - 30}px` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrefPlot;
