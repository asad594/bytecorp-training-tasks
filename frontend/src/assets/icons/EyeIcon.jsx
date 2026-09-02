export default function EyeIcon({
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
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}
