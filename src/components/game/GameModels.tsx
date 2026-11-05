"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { laneToX, type RunnerEngine } from "@/lib/game/engine";

const ACCENT = "#ef6b1b";
const INK = "#080807";

interface DinoModelProps {
  engine: RunnerEngine;
  dark: boolean;
  mobile: boolean;
}

export function DinoModel({ engine, dark, mobile }: DinoModelProps) {
  const actor = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const phase = useRef(0);

  useFrame((state, delta) => {
    if (!actor.current) return;

    const running = engine.status === "running";
    if (running) {
      phase.current += delta * (7 + engine.speed * 0.18);
    }

    const stride = running ? Math.sin(phase.current) : 0;
    const airborne = engine.jumpY > 0.02;
    const targetScale = engine.ducking ? 0.58 : 1;
    const sizeScale = mobile ? 0.84 : 1;
    const targetTilt = engine.status === "over" ? -0.36 : 0;

    actor.current.position.x = THREE.MathUtils.damp(
      actor.current.position.x,
      laneToX(engine.lane),
      14,
      delta,
    );
    actor.current.position.y = engine.jumpY;
    actor.current.scale.x = sizeScale;
    actor.current.scale.y = THREE.MathUtils.damp(
      actor.current.scale.y,
      targetScale * sizeScale,
      13,
      delta,
    );
    actor.current.scale.z = sizeScale;
    actor.current.rotation.z = THREE.MathUtils.damp(
      actor.current.rotation.z,
      targetTilt,
      8,
      delta,
    );

    if (leftLeg.current && rightLeg.current) {
      const jumpTuck = airborne ? -0.55 : 0;
      leftLeg.current.rotation.x = airborne
        ? jumpTuck
        : stride * 0.62;
      rightLeg.current.rotation.x = airborne
        ? jumpTuck * 0.5
        : -stride * 0.62;
    }

    if (leftArm.current && rightArm.current) {
      leftArm.current.rotation.x = -stride * 0.32 - 0.45;
      rightArm.current.rotation.x = stride * 0.32 - 0.45;
    }

    if (body.current) {
      const bob = running
        ? Math.abs(Math.sin(phase.current * 2)) * 0.045
        : Math.sin(state.clock.elapsedTime * 1.5) * 0.014;
      body.current.position.y = bob;
      body.current.rotation.z = running ? stride * 0.025 : 0;
    }

    if (tail.current) {
      tail.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2.5) * 0.1 +
        (running ? stride * 0.035 : 0);
      tail.current.rotation.x = running ? -0.08 : 0;
    }
  });

  return (
    <group ref={actor} name="dino">
      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, 1.54, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.08, 0.98, 1.55]} />
          <meshStandardMaterial
            color={ACCENT}
            roughness={0.62}
            metalness={0.04}
            flatShading
            emissive={dark ? "#5a2206" : "#000000"}
            emissiveIntensity={dark ? 0.22 : 0}
          />
        </mesh>

        {/* Chest highlight */}
        <mesh position={[0.38, 1.54, -0.66]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.36, 0.72, 0.36]} />
          <meshStandardMaterial color="#ff8341" roughness={0.7} flatShading />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.99, -0.62]} rotation={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.62, 0.78, 0.64]} />
          <meshStandardMaterial color={ACCENT} roughness={0.6} flatShading />
        </mesh>

        {/* Head */}
        <mesh position={[0, 2.48, -1.04]} castShadow>
          <boxGeometry args={[0.86, 0.65, 0.94]} />
          <meshStandardMaterial color={ACCENT} roughness={0.58} flatShading />
        </mesh>

        {/* Brow */}
        <mesh position={[0, 2.71, -1.2]}>
          <boxGeometry args={[0.78, 0.13, 0.55]} />
          <meshStandardMaterial color="#c9520f" roughness={0.72} flatShading />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 2.36, -1.58]} castShadow>
          <boxGeometry args={[0.68, 0.4, 0.52]} />
          <meshStandardMaterial color={ACCENT} roughness={0.62} flatShading />
        </mesh>

        {/* Jaw */}
        <mesh position={[0, 2.16, -1.5]}>
          <boxGeometry args={[0.72, 0.18, 0.58]} />
          <meshStandardMaterial color={INK} roughness={0.8} />
        </mesh>

        {/* Teeth */}
        {[-0.18, 0.14].map((x) => (
          <mesh key={x} position={[x, 2.24, -1.76]}>
            <coneGeometry args={[0.045, 0.12, 4]} />
            <meshStandardMaterial color="#fff1dc" roughness={0.4} />
          </mesh>
        ))}

        {/* Eyes */}
        <mesh position={[0.437, 2.55, -1.17]}>
          <sphereGeometry args={[0.087, 10, 10]} />
          <meshStandardMaterial
            color="#fff5e6"
            emissive={dark ? "#ffb47a" : "#000000"}
            emissiveIntensity={dark ? 0.5 : 0}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0.493, 2.56, -1.2]}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color={INK} roughness={0.35} />
        </mesh>
        <mesh position={[-0.437, 2.55, -1.17]}>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshStandardMaterial color="#fff5e6" roughness={0.25} />
        </mesh>

        {/* Nostril */}
        <mesh position={[0.3, 2.42, -1.82]}>
          <sphereGeometry args={[0.026, 6, 6]} />
          <meshStandardMaterial color={INK} />
        </mesh>

        {/* Tiny arms */}
        <group ref={leftArm} position={[-0.56, 1.7, -0.55]}>
          <mesh position={[0, -0.16, -0.06]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.16, 0.44, 0.16]} />
            <meshStandardMaterial color="#d95a0c" roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, -0.36, -0.19]}>
            <boxGeometry args={[0.13, 0.2, 0.24]} />
            <meshStandardMaterial color="#b54a0a" roughness={0.6} flatShading />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.56, 1.7, -0.55]}>
          <mesh position={[0, -0.16, -0.06]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.16, 0.44, 0.16]} />
            <meshStandardMaterial color="#d95a0c" roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, -0.36, -0.19]}>
            <boxGeometry args={[0.13, 0.2, 0.24]} />
            <meshStandardMaterial color="#b54a0a" roughness={0.6} flatShading />
          </mesh>
        </group>

        {/* Tail */}
        <group ref={tail} position={[0, 1.63, 0.72]}>
          <mesh position={[0, -0.06, 0.36]} castShadow>
            <boxGeometry args={[0.62, 0.62, 0.86]} />
            <meshStandardMaterial color={ACCENT} roughness={0.64} flatShading />
          </mesh>
          <mesh position={[0, -0.14, 1.03]} castShadow>
            <boxGeometry args={[0.44, 0.43, 0.68]} />
            <meshStandardMaterial color="#dd5a10" roughness={0.68} flatShading />
          </mesh>
          <mesh position={[0, -0.21, 1.56]} castShadow>
            <boxGeometry args={[0.25, 0.25, 0.48]} />
            <meshStandardMaterial color="#c64f0b" roughness={0.72} flatShading />
          </mesh>
        </group>
      </group>

      {/* Legs are anchored at the feet so the model can squash when ducking. */}
      <group ref={leftLeg} position={[-0.37, 1.12, 0.18]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.35, 0.64, 0.4]} />
          <meshStandardMaterial color="#c9520f" roughness={0.65} flatShading />
        </mesh>
        <mesh position={[0, -0.72, 0.03]} castShadow>
          <boxGeometry args={[0.27, 0.46, 0.3]} />
          <meshStandardMaterial color="#b3480a" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, -0.97, -0.16]} castShadow>
          <boxGeometry args={[0.38, 0.18, 0.64]} />
          <meshStandardMaterial color={ACCENT} roughness={0.6} flatShading />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.37, 1.12, 0.18]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.35, 0.64, 0.4]} />
          <meshStandardMaterial color="#d95a0c" roughness={0.65} flatShading />
        </mesh>
        <mesh position={[0, -0.72, 0.03]} castShadow>
          <boxGeometry args={[0.27, 0.46, 0.3]} />
          <meshStandardMaterial color="#c54d0a" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, -0.97, -0.16]} castShadow>
          <boxGeometry args={[0.38, 0.18, 0.64]} />
          <meshStandardMaterial color={ACCENT} roughness={0.6} flatShading />
        </mesh>
      </group>
    </group>
  );
}

interface CactusModelProps {
  bodyColor: string;
  accent: string;
}

export function CactusModel({ bodyColor, accent }: CactusModelProps) {
  return (
    <group>
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.24, 1.64, 6]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.92}
          flatShading
        />
      </mesh>

      <mesh position={[-0.22, 1.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.11, 0.48, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[-0.44, 1.16, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.36, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.92} flatShading />
      </mesh>

      <mesh position={[0.23, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.095, 0.42, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0.42, 0.98, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.32, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.92} flatShading />
      </mesh>

      <mesh position={[0, 1.67, 0]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          roughness={0.5}
          flatShading
        />
      </mesh>
    </group>
  );
}

interface BirdModelProps {
  bodyColor: string;
  accent: string;
}

export function BirdModel({ bodyColor, accent }: BirdModelProps) {
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);

  useFrame((state) => {
    const flap = Math.sin(state.clock.elapsedTime * 11) * 0.55;
    if (leftWing.current) leftWing.current.rotation.z = flap;
    if (rightWing.current) rightWing.current.rotation.z = -flap;
  });

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.44, 0.38, 0.95]} />
        <meshStandardMaterial color={bodyColor} roughness={0.62} flatShading />
      </mesh>

      <mesh position={[0, 0.11, -0.58]} castShadow>
        <boxGeometry args={[0.4, 0.38, 0.42]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} flatShading />
      </mesh>

      <mesh position={[0, 0.06, -0.87]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.13, 0.32, 4]} />
        <meshStandardMaterial color={accent} roughness={0.55} flatShading />
      </mesh>

      <mesh position={[0.2, 0.21, -0.63]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#fff2dd" emissive={accent} emissiveIntensity={0.3} />
      </mesh>

      <group ref={leftWing} position={[-0.2, 0.05, 0]}>
        <mesh position={[-0.44, 0, 0]} castShadow>
          <boxGeometry args={[0.88, 0.07, 0.48]} />
          <meshStandardMaterial color={accent} roughness={0.65} flatShading />
        </mesh>
      </group>
      <group ref={rightWing} position={[0.2, 0.05, 0]}>
        <mesh position={[0.44, 0, 0]} castShadow>
          <boxGeometry args={[0.88, 0.07, 0.48]} />
          <meshStandardMaterial color={accent} roughness={0.65} flatShading />
        </mesh>
      </group>

      <mesh position={[0, -0.01, 0.67]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.55]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

interface ShardModelProps {
  accent: string;
}

export function ShardModel({ accent }: ShardModelProps) {
  return (
    <group>
      <mesh scale={[1, 1.45, 1]} castShadow>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.15}
          flatShading
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.012, 6, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.48} />
      </mesh>
    </group>
  );
}
