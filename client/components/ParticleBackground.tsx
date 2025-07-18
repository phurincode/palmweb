import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  isDragging: boolean;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const draggedParticleRef = useRef<Particle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.floor(
        (window.innerWidth * window.innerHeight) / 15000,
      );

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          isDragging: false,
        });
      }

      particlesRef.current = particles;
    };

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    const findNearestParticle = (mouseX: number, mouseY: number) => {
      let nearest: Particle | null = null;
      let minDistance = Infinity;

      particlesRef.current.forEach((particle) => {
        const distance = getDistance(mouseX, mouseY, particle.x, particle.y);
        if (distance < 30 && distance < minDistance) {
          minDistance = distance;
          nearest = particle;
        }
      });

      return nearest;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const mouse = getMousePos(e);
      mouseRef.current = { ...mouse, isDown: true };

      const nearestParticle = findNearestParticle(mouse.x, mouse.y);
      if (nearestParticle) {
        draggedParticleRef.current = nearestParticle;
        nearestParticle.isDragging = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = getMousePos(e);
      mouseRef.current.x = mouse.x;
      mouseRef.current.y = mouse.y;

      if (mouseRef.current.isDown && draggedParticleRef.current) {
        const particle = draggedParticleRef.current;
        const maxDistance = 100; // Maximum drag distance

        const dx = mouse.x - particle.originalX;
        const dy = mouse.y - particle.originalY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= maxDistance) {
          particle.x = mouse.x;
          particle.y = mouse.y;
        } else {
          // Limit to maximum distance
          const angle = Math.atan2(dy, dx);
          particle.x = particle.originalX + Math.cos(angle) * maxDistance;
          particle.y = particle.originalY + Math.sin(angle) * maxDistance;
        }
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      if (draggedParticleRef.current) {
        draggedParticleRef.current.isDragging = false;
        draggedParticleRef.current = null;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        if (!particle.isDragging) {
          // Return to original position if dragged
          const dx = particle.originalX - particle.x;
          const dy = particle.originalY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 1) {
            particle.x += dx * 0.05;
            particle.y += dy * 0.05;
          } else {
            // Normal movement when near original position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.originalX += particle.vx;
            particle.originalY += particle.vy;

            // Wrap around edges
            if (particle.originalX < 0) {
              particle.originalX = canvas.width;
              particle.x = canvas.width;
            }
            if (particle.originalX > canvas.width) {
              particle.originalX = 0;
              particle.x = 0;
            }
            if (particle.originalY < 0) {
              particle.originalY = canvas.height;
              particle.y = canvas.height;
            }
            if (particle.originalY > canvas.height) {
              particle.originalY = 0;
              particle.y = 0;
            }
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    // Remove pointer-events-none and add event listeners
    canvas.style.pointerEvents = "auto";
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{
        background: "#000000",
        cursor: "crosshair",
      }}
    />
  );
}
