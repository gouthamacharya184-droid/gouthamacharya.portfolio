/**
 * NeuralNetworkBackground.jsx — Dynamic canvas particles
 *
 * Performance notes:
 *  - Canvas size handles viewport changes (debounced resize listener).
 *  - Draw loop runs in requestAnimationFrame only when section is visible
 *    (uses IntersectionObserver to stop loop when scrolled out of view).
 *  - Reduced particle density on mobile to maintain 60fps on slow devices.
 *
 * Changes:
 *  - Enable rendering on mobile (removed coarse-pointer/hovers checks) while
 *    fixing high-DPI / CSS pixel scaling to avoid stretched/blank canvases.
 *  - Honor prefers-reduced-motion to disable animation when requested.
 */

import React, { useEffect, useRef } from "react";

export default function NeuralNetworkBackground() {
  const canvasRef = useRef(null);

  // Respect reduced motion but allow rendering on mobile/finger devices.
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let isVisible = true;

    // Track CSS (unscaled) width/height and devicePixelRatio for correct scaling
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // Detect device performance profiles based on screen width
    const isMobile = cssWidth < 768;
    const particleCount = isMobile ? 35 : 75;
    const connectionDistance = isMobile ? 80 : 120;
    const particleSpeed = isMobile ? 0.35 : 0.55;

    // Setup viewport-relative scale for high-DPI displays
    const resizeCanvas = () => {
      cssWidth = Math.round(window.innerWidth);
      cssHeight = Math.round(window.innerHeight);
      dpr = Math.max(1, window.devicePixelRatio || 1);

      // Set CSS size (so the element occupies correct layout space)
      canvas.style.width = cssWidth + "px";
      canvas.style.height = cssHeight + "px";

      // Set actual bitmap size scaled by DPR to avoid blurring/stretching
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);

      // Reset transform and scale drawing operations so coordinates are in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    class Particle {
      constructor() {
        // Use CSS pixel dimensions for particle coordinates
        this.x = Math.random() * cssWidth;
        this.y = Math.random() * cssHeight;
        this.vx = (Math.random() - 0.5) * particleSpeed;
        this.vy = (Math.random() - 0.5) * particleSpeed;
        this.radius = Math.random() * 1.5 + 1.0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce at boundaries (CSS pixels)
        if (this.x < 0 || this.x > cssWidth) this.vx = -this.vx;
        if (this.y < 0 || this.y > cssHeight) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Hardcoded Cyan 400 node color
        ctx.fillStyle = "rgba(34, 211, 238, 0.4)";
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Hardcoded connection line matching Cyan/Violet theme boundaries
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!isVisible) return;

      // Clear using CSS pixel coordinates (ctx is scaled so this clears bitmap correctly)
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    // IntersectionObserver stops animation frame calculation loop when background is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            animate();
          } else {
            cancelAnimationFrame(animationFrameId);
          }
        });
      },
      { threshold: 0.01 }
    );

    // Debounced resize — prevents particle re-init on every pixel of resize
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 250);
    };

    // Initial setup
    resizeCanvas();
    window.addEventListener("resize", debouncedResize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
