import React, { useEffect, useRef } from "react";

export default function NeuralNetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip on touch devices and prefers-reduced-motion for performance
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    // Track mouse position relative to viewport
    const mouse = { x: null, y: null, active: false };

    // Calculate node count based on screen area to keep it responsive and performant
    const area = W * H;
    const baseCount = Math.min(80, Math.floor(area / 20000));
    const NODE_COUNT = Math.max(30, baseCount);

    const nodes = [];

    // Colors aligned with the portfolio theme (Cyan, Violet, and Indigo transition colors)
    const colors = {
      cyan: { r: 34, g: 211, b: 238 },     // #22d3ee
      purple: { r: 168, g: 85, b: 247 },   // #a855f7
      indigo: { r: 99, g: 102, b: 241 }    // #6366f1
    };

    for (let i = 0; i < NODE_COUNT; i++) {
      const type = Math.random() > 0.55 ? "cyan" : "purple";
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, // Extremely slow drift speed
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.6,
        color: colors[type],
        type: type,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseVal: Math.random() * Math.PI
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Move and update nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulseVal += n.pulseSpeed;

        // Bounce off edges smoothly
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // Keep inside bounds on resize
        if (n.x < -10) n.x = W + 10;
        if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10;
        if (n.y > H + 10) n.y = -10;

        // Mouse attraction/magnetic effect
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const distSq = dx * dx + dy * dy;
          const attractDist = 180;
          if (distSq < attractDist * attractDist) {
            const dist = Math.sqrt(distSq);
            // Gentle pull force
            const force = (attractDist - dist) / attractDist;
            n.x += (dx / dist) * force * 0.35;
            n.y += (dy / dist) * force * 0.35;
          }
        }
      }

      // 2. Draw connections (lines)
      const maxDist = 140;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < NODE_COUNT; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            // Faint, ambient connection line
            const alpha = (1 - dist / maxDist) * 0.12;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            
            // Color blend of the two nodes
            const r = Math.round((n1.color.r + n2.color.r) / 2);
            const g = Math.round((n1.color.g + n2.color.g) / 2);
            const b = Math.round((n1.color.b + n2.color.b) / 2);
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = (1 - dist / maxDist) * 0.75 + 0.15;
            ctx.stroke();
          }
        }

        // Connections to active mouse position
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - n1.x;
          const dy = mouse.y - n1.y;
          const distSq = dx * dx + dy * dy;
          const mouseMaxDist = 190;
          const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;

          if (distSq < mouseMaxDistSq) {
            const dist = Math.sqrt(distSq);
            // Slightly brighter lines connecting to mouse cursor
            const alpha = (1 - dist / mouseMaxDist) * 0.2;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(mouse.x, mouse.y);
            
            ctx.strokeStyle = `rgba(${n1.color.r}, ${n1.color.g}, ${n1.color.b}, ${alpha})`;
            ctx.lineWidth = (1 - dist / mouseMaxDist) * 1.1 + 0.25;
            ctx.stroke();
          }
        }
      }

      // 3. Draw nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        const pulse = Math.sin(n.pulseVal) * 0.25 + 0.75;
        const rad = n.radius * (0.85 + pulse * 0.15);

        ctx.beginPath();
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${0.4 + pulse * 0.25})`;
        ctx.fill();

        // High brightness core for a premium glow aesthetic
        ctx.beginPath();
        ctx.arc(n.x, n.y, rad * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    // Attach mouse move events to window because the canvas is pointer-events-none
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // Handle Resize
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen", opacity: 0.75 }}
      aria-hidden="true"
    />
  );
}
