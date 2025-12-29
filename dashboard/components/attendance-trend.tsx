 "use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

type TrendPoint = {
  label: string;
  percentage: number;
};

export function AttendanceTrend({ data }: { data: TrendPoint[] }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 220;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([32, width - 16])
      .padding(0.3);
    const y = d3.scaleLinear().domain([0, 100]).range([height - 32, 16]);

    const area = d3
      .area<TrendPoint>()
      .x((d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .y0(() => y(0))
      .y1((d) => y(d.percentage))
      .curve(d3.curveCatmullRom.alpha(0.8));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "rgba(37, 99, 235, 0.25)")
      .attr("stroke", "rgba(37, 99, 235, 0.9)")
      .attr("stroke-width", 3)
      .attr("d", area);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 32})`)
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("x", (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.6)")
      .text((d) => d.label);

    svg
      .append("g")
      .attr("transform", `translate(32,0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => `${v}%`))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "rgba(255,255,255,0.6)")
          .attr("font-size", 10)
      )
      .call((g) => g.selectAll("line").attr("stroke", "rgba(255,255,255,0.1)"))
      .call((g) => g.select(".domain").attr("stroke", "transparent"));
  }, [data]);

  return <svg ref={ref} className="h-56 w-full" role="img" aria-label="Attendance trend" />;
}
