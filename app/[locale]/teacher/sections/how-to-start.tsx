import React from 'react';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';

const HowToStart: React.FC = () => {
  return (
    <div className='how-to-start-wrapper'>
      <h2 className='how-to-start-title'>How to get Started</h2>
      <p className='how-to-start-subtitle'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <div className='how-to-start-main'>
        <div className='how-to-start-main-points'>
          <p className='points-number'>1</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>register account</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Officiis, quae. Quod animi ex officiis fugit nisi explicabo
                suscipit.
              </div>
            </div>
            <div className='arrow'>
              <FaRegArrowAltCircleRight size='30px' />
            </div>
          </div>
        </div>
        <div className='how-to-start-main-points'>
          <p className='points-number'>2</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>register account</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Officiis, quae. Quod animi ex officiis fugit nisi explicabo
                suscipit.
              </div>
            </div>
            <div className='arrow'>
              <FaRegArrowAltCircleRight size='30px' />
            </div>
          </div>
        </div>
        <div className='how-to-start-main-points'>
          <p className='points-number'>3</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>register account</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Officiis, quae. Quod animi ex officiis fugit nisi explicabo
                suscipit.
              </div>
            </div>
            <div className='arrow'>
              <FaRegArrowAltCircleRight size='30px' />
            </div>
          </div>
        </div>
        <div className='how-to-start-main-points'>
          <p className='points-number'>4</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>register account</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Officiis, quae. Quod animi ex officiis fugit nisi explicabo
                suscipit.
              </div>
            </div>
            <div className='arrow'>
              <FaRegArrowAltCircleRight size='30px' />
            </div>
          </div>
        </div>
      </div>
      <button>Apply as a talent</button>
    </div>
  );
};

export default HowToStart;
