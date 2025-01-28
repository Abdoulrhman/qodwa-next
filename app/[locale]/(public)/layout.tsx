import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const navLinks = [
    { label: 'Apply as a Student', href: '/student/register' },
    { label: 'Packages', href: '/packages' },
  ];

  return (
    <>
      <Header logo='' navLinks={navLinks} isArabic={false} />
      <div>{children}</div>
      <Footer navLinks={navLinks} />
    </>
  );
};

export default PublicLayout;
