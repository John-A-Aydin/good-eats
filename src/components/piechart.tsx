
export const PieChart = (props: {size?: number, carbs: number, fat: number, protien: number}) => {
  // Size defaults to 100 if the given size is very small or not given
  let size = props.size;
  if (!props.size || props.size < 10) 
    size = 100;
  if (!size) return <div>Something went wrong</div>

  const total = props.carbs + props.fat + props.protien;
  const protienAndCarbsRatio = (props.protien+props.carbs)/total;
  const protienRatio = props.protien/total;
  const radius = size/2;
  const circumference = radius*6.284;

  return (
    <div className={`h-[${size}px] w-[${size}px] rounded-full`}>
      <svg height={props.size} width={props.size} viewBox={`0 0 ${props.size} ${props.size}`}>
        <circle r={radius} cx={radius} cy={radius} fill="#FFA600"/>
        <circle r={radius/2} cx={radius} cy={radius} fill="transparent"
          stroke="#4D6910"
          stroke-width={radius}
          strokeDasharray={`${protienAndCarbsRatio*circumference/2}, ${circumference/2}`} // Circumference of smaller circle where the strokes are made
          transform={`rotate(-90) translate(${-(2*radius)})`}
        />
        <circle r={radius/2} cx={radius} cy={radius} fill="transparent"
          stroke="#FF1700"
          stroke-width={radius}
          strokeDasharray={`${protienRatio*circumference/2}, ${circumference/2}`} // Circumference of smaller circle where the strokes are made
          transform={`rotate(-90) translate(${-(2*radius)})`}
        />
      </svg>
    </div>
  );
}
