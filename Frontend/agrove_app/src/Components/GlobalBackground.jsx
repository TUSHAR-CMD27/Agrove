import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GlobalBackground = () => {
  const bgRef = useRef();

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Initial Entry Animation
      gsap.fromTo(".global-blob", 
        { opacity: 0, scale: 0.5 },
        { opacity: 0.4, scale: 1, duration: 2, ease: "power3.out", stagger: 0.2 }
      );

      // 2. Continuous Floating Movement
      gsap.to(".global-blob", {
        y: "60px",
        x: "30px",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 3, from: "random" }
      });
    }, bgRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="global-bg-container" ref={bgRef}>
      <div className="global-blob g-blob-1"></div>
      <div className="global-blob g-blob-2"></div>
      <div className="global-blob g-blob-3"></div>
    </div>
  );
};

export default GlobalBackground;