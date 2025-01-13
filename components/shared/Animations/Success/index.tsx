'use client';
import Player from 'lottie-react';
import SuccessLottie from './Success.json';

export default function SuccessAnimation() {
  return (
    <Player
      autoplay
      loop
      animationData={SuccessLottie}
      style={{ height: '300px', width: '300px' }}
    />
  );
}
