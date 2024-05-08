/*
  TODO
    - Make size optional and default to 100
    - More accesible colors
*/
export const PieChart = (props: {size: number, carbs: number, fat: number, protien: number}) => {
  const size = props.size;
  // if (!size || size < 10) 
  //   size = 100;

  if (props.carbs == 0 && props.fat == 0 && props.protien == 0) return (<div></div>)

  const total = props.carbs + props.fat + props.protien;
  const protienAndCarbsRatio = (props.protien+props.carbs)/total;
  const protienRatio = props.protien/total;
  const radius = size/2;
  const circumference = radius*6.284;

  return (
    <div className={`h-[${size}px] w-[${size}px] rounded-full p-4`}>
      <svg height={props.size} width={props.size} viewBox={`0 0 ${size} ${size}`}>
        <circle r={radius} cx={radius} cy={radius} fill="#FFA600"/>
        <circle r={radius/2} cx={radius} cy={radius} fill="transparent"
          stroke="#4D6910"
          strokeWidth={radius}
          strokeDasharray={`${protienAndCarbsRatio*circumference/2}, ${circumference/2}`} // Circumference of smaller circle where the strokes are made
          transform={`rotate(-90) translate(${-(2*radius)})`}
        />
        <circle r={radius/2} cx={radius} cy={radius} fill="transparent"
          stroke="#FF1700"
          strokeWidth={radius}
          strokeDasharray={`${protienRatio*circumference/2}, ${circumference/2}`} // Circumference of smaller circle where the strokes are made
          transform={`rotate(-90) translate(${-(2*radius)})`}
        />
      </svg>
    </div>
  );
}
