import React, { useState, useEffect } from "react";
import { select, drag } from "d3"; // Correct d3 import

const PrefPlot = ({ onWeightChange }) => {
  const [toughnessWeight, setToughnessWeight] = useState(1);
  const [edgeRetentionWeight, setEdgeRetentionWeight] = useState(1);
  const [corrosionWeight, setCorrosionWeight] = useState(1);

  // Function to update weights based on the data point position
  const handleWeightChange = (toughness, edgeRetention, corrosion) => {
    setToughnessWeight(toughness);
    setEdgeRetentionWeight(edgeRetention);
    setCorrosionWeight(corrosion);

    // Call the onWeightChange passed from the parent component
    onWeightChange(toughness, edgeRetention, corrosion);
  };

  // Render the chart and manage the interaction
  useEffect(() => {
    const width = 450; // Increased width to give space for labels
    const height = 240; // Half-circle height
    const radius = 150;
    const svg = select("#prefplot")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "transparent");

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height})`); // Shift the g element to the bottom

    // Create the half-circle
    g.append("path")
      .attr("d", `M -${radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`) // Arc path to create half-circle
      .attr("stroke", "white")
      .attr("fill", "none");

    // Labels for Toughness, Edge Retention, and Corrosion
    const corners = [
      [0, -radius], // Corrosion at the top (90 degrees)
      [radius, 0], // Edge Retention at the right (0 degrees)
      [-radius, 0], // Toughness at the left (180 degrees)
    ];

    const labels = ["Corrosion Resistance", "Edge Retention", "Toughness"];
    corners.forEach(([x, y], i) => {
      // Adjust positions to prevent cutting off
      let labelX = x * 1.4;
      let labelY = y * 1.15;
      if (i === 1) { // Edge Retention (Right)
        labelX += 20; // Move farther right
      } else if (i === 2) { // Toughness (Left)
        labelX -= 20; // Move farther left
      }

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

    // Add lines for each axis
    const axisAngles = [0, Math.PI]; // Edge Retention (0 degrees), Toughness (180 degrees)
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

    // Add the initial center dot with a class name
    let centerDot = g.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("class", "center-dot"); // Assign class to center dot

    // Add a movable point for the user's preferred weights
    let currentX = 0;
    let currentY = 0;

    const point = g.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("cx", currentX)
      .attr("cy", currentY)
      .call(
        drag()
          .on("start", function () {
            // Remove the initial center dot when dragging starts
            svg.selectAll(".center-dot").remove(); // Remove center dot with the assigned class
          })
          .on("drag", function (event) {
            // Calculate the mouse position relative to the center of the half-circle
            const offsetX = event.x - width / 100; // Adjusted for proper centering
            const offsetY = event.y - height / 100;

            // Constrain the point within the half-circle radius
            const totalDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            if (totalDistance <= radius) {
              // Use `let` for these variables since we want to update them
              currentX = offsetX;
              currentY = offsetY;

              // Update the point's position
              select(this)
                .attr("cx", currentX)
                .attr("cy", currentY);
            }
          })
          .on("end", function () {
            // Positions of the labels (outermost points of the half-circle)
            const labelPositions = [
              { x: 0, y: -radius }, // Corrosion at the top (90 degrees)
              { x: radius, y: 0 }, // Edge Retention at the right (0 degrees)
              { x: -radius, y: 0 }  // Toughness at the left (180 degrees)
            ];

            // Calculate the distance from the point to each label
            let corrosionWeight = 0;
            let edgeRetentionWeight = 0;
            let toughnessWeight = 0;

            const distances = labelPositions.map((label, index) => {
              const distance = Math.sqrt(
                (currentX - label.x) ** 2 + (currentY - label.y) ** 2
              );

              // Assign weights based on the distance from each axis label
              if (index === 0) corrosionWeight = Math.min(4, Math.max(1 + (1 - distance / radius) * 3, 1)); // Clamp min value to 1
              if (index === 1) edgeRetentionWeight = Math.min(4, Math.max(1 + (1 - distance / radius) * 3, 1)); // Clamp min value to 1
              if (index === 2) toughnessWeight = Math.min(4, Math.max(1 + (1 - distance / radius) * 3, 1)); // Clamp min value to 1

              return distance;
            });

            // Update state for weights when drag ends
            handleWeightChange(toughnessWeight, edgeRetentionWeight, corrosionWeight);
          })
      );
  }, []);

  return (
    <div>
      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-white text-sm">
        <p><strong>Set your TEC preferences:</strong></p>
        <p>Favoring toughness will highlight steels that resist chipping and excel under impact.</p>
        <p>Choosing edge retention prioritizes steels that stay sharper for longer.</p>
        <p>Emphasizing corrosion resistance brings forward options better suited to wet or humid conditions.</p>
        <p className="mt-2">These choices will shape the recommendations we make for you.</p>
      </div>
      <svg id="prefplot" style={{ overflow: 'visible' }}></svg>
      <div className="mt-4">
        <p>Toughness Weight: {toughnessWeight.toFixed(2)}</p>
        <p>Edge Retention Weight: {edgeRetentionWeight.toFixed(2)}</p>
        <p>Corrosion Weight: {corrosionWeight.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PrefPlot;
