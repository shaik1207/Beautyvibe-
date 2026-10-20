import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";

// ==========================================
// 1. Responsive Ambient Particles (Soft Golden/Pink Dust)
// ==========================================
function ParticleField() {
  const pointsRef = useRef(null);
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const values = new Float32Array(80 * 3);
    const xRange = viewport.width * 1.5;
    const yRange = viewport.height * 1.5;

    for (let index = 0; index < 80; index += 1) {
      const i = index * 3;
      values[i] = (Math.random() - 0.5) * xRange;
      values[i + 1] = (Math.random() - 0.5) * yRange;
      values[i + 2] = (Math.random() - 0.5) * 8 - 2; 
    }
    return values;
  }, [viewport]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.01;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FBE9DB" 
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ==========================================
// 2. Animated 3D Glass Text Word
// ==========================================
function AnimatedWord({ word, index, currentIndex, totalWords }) {
  const textRef = useRef(null);
  const materialRef = useRef(null);
  const { viewport } = useThree(); 
  
  const isActive = index === currentIndex;
  const isPrev = index === (currentIndex - 1 + totalWords) % totalWords;

  const isMobile = viewport.width < 5;
  const responsiveFontSize = isMobile ? 1.4 : Math.min(2.4, viewport.width * 0.22);
  const travelDistance = isMobile ? 1.5 : 2.5;

  useFrame((state, delta) => {
    if (!textRef.current || !materialRef.current) return;
    
    const targetOpacity = isActive ? 0.95 : 0;
    const targetScale = isActive ? 1 : 0.85;
    
    let targetY = 0;
    let targetZ = -1.5;
    
    if (!isActive) {
      targetY = isPrev ? travelDistance : -travelDistance; 
      targetZ = -4; 
    }

    materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * delta * 3;
    textRef.current.position.y += (targetY - textRef.current.position.y) * delta * 3;
    textRef.current.position.z += (targetZ - textRef.current.position.z) * delta * 3;
    
    const currentScale = textRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * delta * 3;
    textRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <Text
      ref={textRef}
      position={[0, -2.5, -4]}
      fontSize={responsiveFontSize} 
      letterSpacing={isMobile ? 0.05 : 0.15}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
    >
      {word}
      <meshPhysicalMaterial
        ref={materialRef}
        color="#FFFFFF" 
        transmission={0.9} 
        opacity={0}
        transparent={true}
        metalness={0.05}
        roughness={0.1} 
        ior={1.45} 
        thickness={1.2}
        specularIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </Text>
  );
}

// ==========================================
// 3. Central Changing Text Sequence
// ==========================================
function ChangingTextSequence() {
  const words = ["SALON", "SPA", "WELLNESS", "BEAUTY", "GROOMING"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 4000); 
    
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.3}>
      {words.map((word, idx) => (
        <AnimatedWord 
          key={word} 
          word={word} 
          index={idx} 
          currentIndex={currentIndex} 
          totalWords={words.length} 
        />
      ))}
    </Float>
  );
}

// ==========================================
// 4. Premium Gradient Petal Element
// ==========================================
function DriftingPetal({ initialX, initialY, initialZ, scale, fallSpeed, driftSpeed, rotationSpeed, xRange }) {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const randomFactor = useMemo(() => Math.random() * Math.PI * 2, []);
  
  // Custom curving geometry to create an elegant, slightly cupped petal shape
  const petalGeometry = useMemo(() => {
    const petalShape = new THREE.Shape();
    // Start at the pinched base of the petal
    petalShape.moveTo(0, -0.4);
    // Curve up to a wide, rounded top (left side)
    petalShape.bezierCurveTo(-0.35, -0.1, -0.4, 0.35, 0, 0.5);
    // Curve back down to the base (right side)
    petalShape.bezierCurveTo(0.4, 0.35, 0.35, -0.1, 0, -0.4);
    
    return new THREE.ExtrudeGeometry(petalShape, {
      depth: 0.005,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.015
    });
  }, []);

  // Shared Shader Material for the Petal Gradient (Deep Rose to Soft Frost Pink)
  const gradientMaterial = useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      transmission: 0.5, 
      opacity: 0.9,
      transparent: true,
      metalness: 0.1,
      roughness: 0.4, 
      ior: 1.3,
      thickness: 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2
    });

    // Inject custom gradient logic mapping the local Y position
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        `#include <common>`,
        `#include <common>\nvarying vec3 vLocalPos;`
      ).replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>\nvLocalPos = position;`
      );

      // We curve the geometry slightly in the vertex shader to make it look cupped
      shader.vertexShader = shader.vertexShader.replace(
        `#include <project_vertex>`,
        `
        vec3 transformedPos = transformed;
        // Bend the petal along the Z axis based on its Y position to cup it
        transformedPos.z += sin(transformedPos.y * 3.14) * 0.15;
        vec4 mvPosition = modelViewMatrix * vec4( transformedPos, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`,
        `#include <common>\nvarying vec3 vLocalPos;`
      ).replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
        // Gradient Colors: Rich Rose Base -> Soft Frost Pink Edge
        vec3 colorBottom = vec3(0.95, 0.5, 0.65); 
        vec3 colorTop = vec3(1.0, 0.85, 0.9);

        // Map the petal's Y coordinates (-0.4 to 0.5)
        float gradientMix = smoothstep(-0.4, 0.5, vLocalPos.y);
        
        vec3 customGradientColor = mix(colorBottom, colorTop, gradientMix);
        vec4 diffuseColor = vec4(customGradientColor, opacity);
        `
      );
    };
    return material;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime() * driftSpeed + randomFactor;
    
    // Sweeping, elegant drift physics
    meshRef.current.position.y -= fallSpeed * delta;
    meshRef.current.position.x += Math.sin(time) * 0.02;
    meshRef.current.position.z += Math.cos(time * 0.7) * 0.01;

    // Erratic, graceful tumbling 
    meshRef.current.rotation.z = Math.sin(time * 1.2) * 0.4 + (fallSpeed * 1.2);
    meshRef.current.rotation.y += rotationSpeed * delta;
    meshRef.current.rotation.x = Math.cos(time * 0.9) * 0.5;

    // Reset dynamically based on screen size
    if (meshRef.current.position.y < -(viewport.height / 2) - 2) {
      meshRef.current.position.y = (viewport.height / 2) + 2;
      meshRef.current.position.x = (Math.random() - 0.5) * xRange;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[initialX, initialY, initialZ]} 
      scale={[scale, scale, scale]}
      geometry={petalGeometry}
      material={gradientMaterial}
    />
  );
}

// ==========================================
// 5. Responsive Petal System 
// ==========================================
function PetalSystem() {
  const { viewport } = useThree();
  const count = viewport.width < 5 ? 25 : 50; 
  const xRange = viewport.width * 1.2;
  const yRange = viewport.height * 1.5;
  
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      return {
        id: index,
        initialX: (Math.random() - 0.5) * xRange, 
        initialY: Math.random() * yRange - (yRange / 2), 
        initialZ: (Math.random() - 0.5) * 5 - 2, 
        scale: 0.15 + Math.random() * 0.2, 
        fallSpeed: 0.3 + Math.random() * 0.4, 
        driftSpeed: 0.6 + Math.random() * 1.0, 
        rotationSpeed: (Math.random() - 0.5) * 1.2,
        xRange: xRange
      };
    });
  }, [count, xRange, yRange]);

  return (
    <group>
      {petals.map((petal) => (
        <DriftingPetal key={petal.id} {...petal} />
      ))}
    </group>
  );
}

// ==========================================
// 6. Main Scene Composition
// ==========================================
function HeroScene({ cursorRef }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const pointerX = cursorRef?.current?.x || 0;
    const pointerY = cursorRef?.current?.y || 0;

    const targetY = pointerX * 0.08;
    const targetX = pointerY * -0.025;

    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * Math.min(1, delta * 1.5);
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * Math.min(1, delta * 1.5);
  });

  return (
    <>
      <ambientLight intensity={1.5} color="#FFFFFF" />
      <directionalLight position={[3, 6, 2]} intensity={1.3} color="#FFFFFF" />
      <pointLight position={[-4, 3, -1]} intensity={2.5} color="#FFE6F0" /> 
      <pointLight position={[5, -3, 3]} intensity={1.5} color="#F2E6FF" /> 
      <pointLight position={[0, -2, -5]} intensity={1.8} color="#FFFFFF" />

      <group ref={groupRef}>
        <ParticleField />
        <PetalSystem />
        
        <group position={[0, 0.2, 0]}>
          <ChangingTextSequence />
        </group>
      </group>
    </>
  );
}

// ==========================================
// 7. Wrapper Component
// ==========================================
export default function HeroThreeBackdrop({ cursorRef }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#F9F5F6] via-[#FDFBF9] to-[#F2ECE7]"
    >
      <Canvas
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true, 
          powerPreference: "high-performance",
        }}
      >
        <HeroScene cursorRef={cursorRef} />
      </Canvas>
    </div>
  );
}