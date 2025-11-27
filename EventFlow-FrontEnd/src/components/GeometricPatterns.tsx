import { motion } from 'framer-motion';

export default function GeometricPatterns() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      {/* Shape 1 - Large circle */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
      />

      {/* Shape 2 - Medium square */}
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 40, 0],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm"
      />

      {/* Shape 3 - Small circle */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -20, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-32 left-40 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"
      />

      {/* Shape 4 - Large rounded square */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          rotate: [0, -45, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-3xl backdrop-blur-sm"
      />

      {/* Shape 5 - Medium circle */}
      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -35, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"
      />

      {/* Shape 6 - Small square */}
      <motion.div
        animate={{
          x: [0, -15, 0],
          y: [0, 25, 0],
          rotate: [0, 180, 0],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 right-1/4 w-14 h-14 bg-white/10 rounded-xl backdrop-blur-sm"
      />

      {/* Large glow orbs for depth */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
    </div>
  );
}
