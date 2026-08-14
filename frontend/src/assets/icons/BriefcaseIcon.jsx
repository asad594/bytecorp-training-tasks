export default function BriefcaseIcon({
  width = "24",
  height = "24",
  viewBox = "0 0 24 24",
  fill = "none",
  stroke,
  strokeWidth,
  className = "",
  ...props
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      className={className}
      {...props}
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
