import IntroContent from "./intro-content";
import IntroHeader from "./intro-header";

const HomeIntro: React.FC = () => {
  return (
    <div className="intro">
      <IntroHeader />
      <IntroContent />
    </div>
  );
};

export default HomeIntro;
