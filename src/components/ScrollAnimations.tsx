'use client';

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-trigger class
    const scrollTriggerElements = document.querySelectorAll('.scroll-trigger');
    scrollTriggerElements.forEach((el) => observer.observe(el));

    // Advanced parallax effect for hero background
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');

      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });

      // Add glow effect to navigation on scroll
      const nav = document.querySelector('nav');
      if (nav) {
        if (scrolled > 100) {
          nav.classList.add('scrolled');
          nav.style.background = 'rgba(255, 255, 255, 0.15)';
          nav.style.backdropFilter = 'blur(20px)';
          nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
          nav.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        } else {
          nav.classList.remove('scrolled');
          nav.style.background = 'rgba(255, 255, 255, 0.1)';
          nav.style.backdropFilter = 'blur(12px)';
          nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
          nav.style.boxShadow = 'none';
        }
      }

      // Floating particles animation based on scroll
      const particles = document.querySelectorAll('.floating-particle');
      particles.forEach((particle, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = scrolled * speed;
        (particle as HTMLElement).style.transform = `translateY(${-yPos}px) rotate(${scrolled * 0.1}deg)`;
      });
    };

    // Smooth scroll behavior for navigation links
    const setupSmoothScroll = () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (href) {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
        });
      });
    };

    // Mouse move parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPercent = (clientX / innerWidth) * 100;
      const yPercent = (clientY / innerHeight) * 100;

      // Apply parallax to floating elements
      const floatingElements = document.querySelectorAll('.mouse-parallax');
      floatingElements.forEach((element, index) => {
        const speed = 0.02 + (index * 0.01);
        const xMove = (xPercent - 50) * speed;
        const yMove = (yPercent - 50) * speed;
        (element as HTMLElement).style.transform = `translate(${xMove}px, ${yMove}px)`;
      });
    };

    // Magnetic effect for buttons
    const setupMagneticButtons = () => {
      document.querySelectorAll('.magnetic-button').forEach(button => {
        button.addEventListener('mousemove', (e: any) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          (button as HTMLElement).style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        button.addEventListener('mouseleave', () => {
          (button as HTMLElement).style.transform = 'translate(0px, 0px)';
        });
      });
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    setupSmoothScroll();
    setupMagneticButtons();

    // Trigger initial scroll to set up navigation
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return null; // This component only adds behavior
}