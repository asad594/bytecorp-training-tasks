export default function EyeOffIcon({
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
        d="M2 12s3.5-7 10-7c1.77 0 3.3.44 4.58 1.08M22 12s-3.5 7-10 7c-1.77 0-3.3-.44-4.58-1.08M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3l18 18"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
