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

interface Connection {
  particle1: Particle;
  particle2: Particle;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const draggedParticleRef = useRef<Particle | null>(null);
  const draggedConnectionRef = useRef<Connection | null>(null);
  const connectionsRef = useRef<Connection[]>([]);

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

    const getDistanceFromPointToLine = (
      px: number,
      py: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) {
        param = dot / lenSq;
      }

      let xx, yy;
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      const dx = px - xx;
      const dy = py - yy;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const findNearestConnection = (mouseX: number, mouseY: number) => {
      let nearest: Connection | null = null;
      let minDistance = Infinity;

      connectionsRef.current.forEach((connection) => {
        const distance = getDistanceFromPointToLine(
          mouseX,
          mouseY,
          connection.particle1.x,
          connection.particle1.y,
          connection.particle2.x,
          connection.particle2.y,
        );
        if (distance < 10 && distance < minDistance) {
          minDistance = distance;
          nearest = connection;
        }
      });

      return nearest;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const mouse = getMousePos(e);
      mouseRef.current = { ...mouse, isDown: true };

      // First try to find a particle
      const nearestParticle = findNearestParticle(mouse.x, mouse.y);
      if (nearestParticle) {
        draggedParticleRef.current = nearestParticle;
        nearestParticle.isDragging = true;
        return;
      }

      // If no particle found, try to find a connection
      const nearestConnection = findNearestConnection(mouse.x, mouse.y);
      if (nearestConnection) {
        draggedConnectionRef.current = nearestConnection;
        nearestConnection.isDragging = true;
        nearestConnection.dragOffset = {
          x:
            mouse.x -
            (nearestConnection.particle1.x + nearestConnection.particle2.x) / 2,
          y:
            mouse.y -
            (nearestConnection.particle1.y + nearestConnection.particle2.y) / 2,
        };
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
      } else if (mouseRef.current.isDown && draggedConnectionRef.current) {
        const connection = draggedConnectionRef.current;
        const centerX = mouse.x - connection.dragOffset.x;
        const centerY = mouse.y - connection.dragOffset.y;

        // Calculate the midpoint between the two particles
        const originalCenterX =
          (connection.particle1.originalX + connection.particle2.originalX) / 2;
        const originalCenterY =
          (connection.particle1.originalY + connection.particle2.originalY) / 2;

        // Calculate offset from original center
        const offsetX = centerX - originalCenterX;
        const offsetY = centerY - originalCenterY;

        // Limit drag distance for connections
        const maxOffset = 80;
        const offsetDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        if (offsetDistance <= maxOffset) {
          // Move both particles by the offset
          connection.particle1.x = connection.particle1.originalX + offsetX;
          connection.particle1.y = connection.particle1.originalY + offsetY;
          connection.particle2.x = connection.particle2.originalX + offsetX;
          connection.particle2.y = connection.particle2.originalY + offsetY;
        }
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      if (draggedParticleRef.current) {
        draggedParticleRef.current.isDragging = false;
        draggedParticleRef.current = null;
      }
      if (draggedConnectionRef.current) {
        draggedConnectionRef.current.isDragging = false;
        draggedConnectionRef.current = null;
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

      // Update connections array and draw connections
      connectionsRef.current = [];
      particlesRef.current.forEach((particle, i) => {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Add to connections array for interaction
            connectionsRef.current.push({
              particle1: particle,
              particle2: other,
              isDragging: false,
              dragOffset: { x: 0, y: 0 },
            });

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - distance / 100)})`;
            ctx.lineWidth = 1.0;
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
