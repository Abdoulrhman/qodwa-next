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
    className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 
               p-2 sm:p-3 rounded-lg hover:bg-primary/10 transition-colors'
  >
    <div className='flex items-center gap-2'>
      {icon}
      <p className='text-xs sm:text-sm text-muted-foreground'>{label}</p>
    </div>
    <p className='text-sm sm:text-base font-medium ml-6 sm:ml-auto'>{value}</p>
  </div>
);

export default FeatureItem;
