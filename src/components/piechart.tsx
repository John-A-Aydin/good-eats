
export const PieChart = (props: {size?: number, carbs: number, fat: number, protien: number}) => {
  // Size defaults to 50 if the given size is very small or not given
  if (!props.size || props.size < 10) props.size = 50;
  const carbsFatBorderInDegrees = (props.carbs/(props.carbs + props.fat + props.protien))*2*Math.PI
  const fatProtienBorderInDegrees = (props.carbs/(props.carbs + props.fat + props.protien))*2*Math.PI + carbsFatBorderInDegrees

  const carbsFatBorderXCoord = Math.cos(carbsFatBorderInDegrees).toFixed(2);
  const carbsFatBorderYCoord = Math.sin(carbsFatBorderInDegrees).toFixed(2);

  const fatProtienBorderXCoord = Math.cos(fatProtienBorderInDegrees).toFixed(2);
  const fatProtienBorderYCoord = Math.sin(fatProtienBorderInDegrees).toFixed(2);

  return (
    <div className="rounded-full">
      <svg height={props.size} width={props.size} viewBox={`0 0 ${props.size} ${props.size}`}>
        <path d={`M${props.size/2} ${props.size/2} d`} fill="#fff" />
      </svg>
    </div>
  );
}