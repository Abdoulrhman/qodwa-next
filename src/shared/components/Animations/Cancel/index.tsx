'use client';
import Player from 'lottie-react';
import CancelLottie from './Cancel.json';

export default function CancelAnimation() {
  return (
    <Player
      autoplay
      loop
      animationData={CancelLottie}
      style={{ height: '300px', width: '300px' }}
    />
  );
}
