import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  margin?: string;
  [key: string]: any; // to accept any other props if needed
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '100%',
  borderRadius = '4px',
  margin = '0',
  ...restProps
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    margin,
  };

  return <div className='skeleton' style={skeletonStyle} {...restProps} />;
};

export default Skeleton;
