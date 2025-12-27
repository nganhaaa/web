import React, { useEffect } from 'react';
import './ChristmasHomepage.css';
import gsap from 'gsap';

const ChristmasHomepage = () => {
  useEffect(() => {
    // GSAP Animations
    gsap.from('.home__img-11', 1, {opacity: 0, y: 200, delay: .1});
    gsap.from('.home__img-14', 1, {opacity: 0, y: 200, delay: .5});
    gsap.from('.home__img-15', 1, {opacity: 0, y: 200, delay: .8});
    gsap.from('.home__img-16', 1, {opacity: 0, y: 200, delay: 1.1});
    gsap.from('.home__img-10', 1, {opacity: 0, y: 200, delay: 1.5, ease: "back.out(1.2)"});
    gsap.from('.home__img-5', 1, {opacity: 0, y: 200, delay: 2, ease: "bounce.out"});
    gsap.from('.home__img-8', 1, {opacity: 0, y: 200, delay: 2.5, ease: "bounce.out"});
    gsap.from('.home__img-3', 1, {opacity: 0, x: -100, rotation: -20, delay: 3, ease: "back.out(1.2)"});
    gsap.from('.home__img-2', 1, {opacity: 0, x: -100, rotation: -20, delay: 3.5, ease: "back.out(1.2)"});
    gsap.from('.home__img-1', 1, {opacity: 0, x: -100, rotation: -20, delay: 4, ease: "back.out(1.2)"});
    gsap.from('.home__img-6', 1, {opacity: 0, x: 100, rotation: 20, delay: 3.5, ease: "back.out(1.2)"});
    gsap.from('.home__img-9', 1, {opacity: 0, x: 100, rotation: 20, delay: 4, ease: "back.out(1.2)"});
    gsap.from('.home__img-7', 1, {opacity: 0, y: 200, delay: 4.5, ease: "bounce.out"});
    gsap.from('.home__img-4', 1, {opacity: 0, y: 200, delay: 5, ease: "bounce.out"});
    gsap.from('.home__img-13', 1, {opacity: 0, y: 200, delay: 5.5, ease: "back.out(1.2)"});
    gsap.from('.home__img-12', 1, {opacity: 0, y: 200, delay: 5.5, ease: "back.out(1.2)"});
    gsap.from('.home__title', 1, {opacity: 0, y: 200, delay: 6, ease: "back.out(1.2)"});

    // Snow effect
    const script = document.createElement('script');
    script.src = 'https://app.embed.im/snow.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="christmas-main">
      <section className="home">
        <div className="home__container">
          <img src="/christmas-assets/img/img-bg.svg" alt="background" className="home__bg" />
          <img src="/christmas-assets/img/cloud-1.svg" alt="cloud" className="home__cloud-1" />
          <img src="/christmas-assets/img/cloud-2.svg" alt="cloud" className="home__cloud-2" />
          <img src="/christmas-assets/img/sled.svg" alt="sled" className="home__sled" />
          
          <div className="home__images">
            <img src="/christmas-assets/img/img-1.svg" alt="image" className="home__img-1" />
            <img src="/christmas-assets/img/img-2.svg" alt="image" className="home__img-2" />
            <img src="/christmas-assets/img/img-3.svg" alt="image" className="home__img-3" />
            <img src="/christmas-assets/img/img-4.svg" alt="image" className="home__img-4" />
            <img src="/christmas-assets/img/img-5.svg" alt="image" className="home__img-5" />
            <img src="/christmas-assets/img/img-6.svg" alt="image" className="home__img-6" />
            <img src="/christmas-assets/img/img-7.svg" alt="image" className="home__img-7" />
            <img src="/christmas-assets/img/img-8.svg" alt="image" className="home__img-8" />
            <img src="/christmas-assets/img/img-9.svg" alt="image" className="home__img-9" />
            <img src="/christmas-assets/img/img-10.svg" alt="image" className="home__img-10" />
            <img src="/christmas-assets/img/img-11.svg" alt="image" className="home__img-11" />
            <img src="/christmas-assets/img/img-12.svg" alt="image" className="home__img-12" />
            <img src="/christmas-assets/img/img-13.svg" alt="image" className="home__img-13" />
            <img src="/christmas-assets/img/img-14.svg" alt="image" className="home__img-14" />
            <img src="/christmas-assets/img/img-15.svg" alt="image" className="home__img-15" />
            <img src="/christmas-assets/img/img-16.svg" alt="image" className="home__img-16" />
          </div>
          
          <h1 className="home__title">
            Merry <br /> Christmas
          </h1>
        </div>
      </section>
    </main>
  );
};

export default ChristmasHomepage;
