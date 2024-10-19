const AuthLayout = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  return (
    <div className="h-screen flex">
      {/* Left side with background image and overlay text */}
      <div 
        className="w-1/2 hidden md:flex bg-cover bg-center text-black flex-col justify-end p-8"
        style={{ backgroundImage: "url('/images/header-bg.jpg')" }}
      >
        <div className="flex-grow"></div>
        <div className="text-lg">
          {/* Logo and platform name at the top */}
          <div className="text-2xl font-bold mb-6">Qodwa Platform</div>
          {/* Testimonial quote */}
          <p className="italic">
            “This platform has transformed my Quran memorization journey, making it easier to stay consistent and track my progress effortlessly.”
          </p>
          <span className="block mt-4 font-semibold">Sofia Davis</span>
        </div>
      </div>

      {/* Right side with children */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
