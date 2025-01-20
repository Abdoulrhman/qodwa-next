const FeatureItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    className='flex items-center space-x-3 p-3 rounded-lg
                    hover:bg-primary/10 transition-colors'
  >
    {icon}
    <div></div>
    <p className='text-sm text-muted-foreground'>{label}</p>
    <p className='font-medium'>{value}</p>
  </div>
);

export default FeatureItem;
