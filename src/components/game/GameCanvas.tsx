"use client";

import { Grid, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { laneToX, type RunnerEngine } from "@/lib/game/engine";
import {
  BirdModel,
  CactusModel,
  DinoModel,
  ShardModel,
} from "@/components/game/GameModels";

interface GameCanvasProps {
  engine: RunnerEngine;
  theme: "dark" | "light";
  onInvalidateReady: (invalidate: () => void) => void;
}

interface ScenePalette {
  background: string;
  ground: string;
  grid: string;
  section: string;
  mountain: string;
  mountainFar: string;
  obstacle: string;
  fogNear: number;
  fogFar: number;
  sun: string;
}

const DARK_PALETTE: ScenePalette = {
  background: "#080807",
  ground: "#0c0c0a",
  grid: "#3b2719",
  section: "#ef6b1b",
  mountain: "#15130f",
  mountainFar: "#0e0d0b",
  obstacle: "#b9b09f",
  fogNear: 36,
  fogFar: 94,
  sun: "#ef6b1b",
};

const LIGHT_PALETTE: ScenePalette = {
  background: "#f3eee5",
  ground: "#e7dfd1",
  grid: "#c2b5a3",
  section: "#ef6b1b",
  mountain: "#d6cbb9",
  mountainFar: "#e1d7c8",
  obstacle: "#26231d",
  fogNear: 36,
  fogFar: 94,
  sun: "#ef6b1b",
};

export default function GameCanvas({
  engine,
  theme,
  onInvalidateReady,
}: GameCanvasProps) {
  const dark = theme === "dark";
  const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.4]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = dark ? 1.02 : 1.14;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      fallback={
        <div className="grid h-full place-items-center p-8 text-center">
          <p className="max-w-xs text-sm text-muted">
            WebGL could not start on this device. Try a modern browser with
            hardware acceleration enabled.
          </p>
        </div>
      }
    >
      <InvalidateBridge onInvalidateReady={onInvalidateReady} />
      <Scene engine={engine} palette={palette} dark={dark} />
    </Canvas>
  );
}

function InvalidateBridge({
  onInvalidateReady,
}: Pick<GameCanvasProps, "onInvalidateReady">) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    onInvalidateReady(invalidate);
    return () => onInvalidateReady(() => {});
  }, [invalidate, onInvalidateReady]);

  return null;
}

function Scene({
  engine,
  palette,
  dark,
}: {
  engine: RunnerEngine;
  palette: ScenePalette;
  dark: boolean;
}) {
  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog
        attach="fog"
        args={[palette.background, palette.fogNear, palette.fogFar]}
      />

      <ambientLight intensity={dark ? 0.75 : 1.35} />
      <hemisphereLight
        args={[palette.background, palette.ground, dark ? 0.65 : 0.9]}
      />
      <directionalLight
        position={[7, 16, 9]}
        intensity={dark ? 2.3 : 2.8}
        color={dark ? "#ffd3b5" : "#fff8ec"}
      />
      <pointLight
        position={[-7, 5, -6]}
        color={palette.sun}
        intensity={dark ? 24 : 12}
        distance={28}
        decay={2}
      />
      <directionalLight
        position={[-8, 5, -12]}
        color={palette.sun}
        intensity={dark ? 0.7 : 0.35}
      />

      <GameLoop engine={engine} />
      <Sun palette={palette} dark={dark} />
      <MountainRange palette={palette} />
      <Ground palette={palette} />
      <SpeedMarkers engine={engine} palette={palette} />
      <ObstacleField engine={engine} palette={palette} />
      <ShardField engine={engine} />
      <group name="player">
        <DinoModel engine={engine} dark={dark} />
      </group>
      <CameraRig engine={engine} />
    </>
  );
}

function GameLoop({ engine }: { engine: RunnerEngine }) {
  useFrame(({ invalidate }, delta) => {
    engine.update(delta);
    if (engine.status === "running") invalidate();
  });
  return null;
}

function Ground({ palette }: { palette: ScenePalette }) {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, -28]}
      >
        <planeGeometry args={[140, 190]} />
        <meshStandardMaterial
          color={palette.ground}
          roughness={0.98}
          metalness={0}
        />
      </mesh>
      <Grid
        position={[0, 0.005, -24]}
        args={[130, 180]}
        cellSize={2.1}
        cellThickness={0.55}
        cellColor={palette.grid}
        sectionSize={10.5}
        sectionThickness={0.9}
        sectionColor={palette.section}
        fadeDistance={82}
        fadeStrength={2.2}
        fadeFrom={0.4}
        infiniteGrid
      />
    </>
  );
}

function Sun({ palette, dark }: { palette: ScenePalette; dark: boolean }) {
  return (
    <group position={[-24, 15.5, -48]}>
      <mesh>
        <sphereGeometry args={[5.3, 32, 32]} />
        <meshBasicMaterial color={palette.sun} toneMapped={false} />
      </mesh>
      <mesh scale={1.6}>
        <sphereGeometry args={[5.3, 24, 24]} />
        <meshBasicMaterial
          color={palette.sun}
          transparent
          opacity={dark ? 0.065 : 0.09}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={2.45}>
        <sphereGeometry args={[5.3, 16, 16]} />
        <meshBasicMaterial
          color={palette.sun}
          transparent
          opacity={dark ? 0.022 : 0.035}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <torusGeometry args={[7.6, 0.035, 6, 80]} />
        <meshBasicMaterial
          color={palette.sun}
          transparent
          opacity={dark ? 0.55 : 0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function MountainRange({ palette }: { palette: ScenePalette }) {
  const mountains = useMemo(
    () =>
      Array.from({ length: 13 }, (_, index) => ({
        x: -46 + index * 7.8,
        z: -49 - ((index * 13) % 16),
        height: 4 + ((index * 17) % 10),
        width: 4.5 + ((index * 11) % 8),
        rotation: (index * 0.47) % Math.PI,
      })),
    [],
  );

  return (
    <group>
      {mountains.map((mountain, index) => (
        <mesh
          key={index}
          position={[mountain.x, mountain.height / 2 - 0.1, mountain.z]}
          rotation={[0, mountain.rotation, 0]}
        >
          <coneGeometry args={[mountain.width, mountain.height, 4]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? palette.mountainFar : palette.mountain}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}
      <mesh position={[-8, 1.5, -68]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[22, 14, 5]} />
        <meshStandardMaterial
          color={palette.mountainFar}
          roughness={1}
          flatShading
        />
      </mesh>
      <mesh position={[19, 1, -73]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[19, 11, 4]} />
        <meshStandardMaterial
          color={palette.mountainFar}
          roughness={1}
          flatShading
        />
      </mesh>
    </group>
  );
}

function SpeedMarkers({
  engine,
  palette,
}: {
  engine: RunnerEngine;
  palette: ScenePalette;
}) {
  const markers = useRef<Array<THREE.Group | null>>([]);

  useFrame(() => {
    for (let index = 0; index < markers.current.length; index += 1) {
      const marker = markers.current[index];
      if (!marker) continue;

      const side = index % 2 === 0 ? -1 : 1;
      const base = -index * 7.5;
      const z = (((base + engine.distance * 1.25 + 90) % 90) + 90) % 90 - 90;
      marker.position.set(side * (8.8 + (index % 3) * 0.55), 0, z + 5);
      marker.rotation.y = side * 0.15;
    }
  });

  return (
    <group>
      {Array.from({ length: 18 }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            markers.current[index] = node;
          }}
        >
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.12, 2.4, 0.12]} />
            <meshStandardMaterial
              color={palette.mountain}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <boxGeometry args={[0.18, 0.22, 0.18]} />
            <meshStandardMaterial
              color={palette.section}
              emissive={palette.section}
              emissiveIntensity={0.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ObstacleField({
  engine,
  palette,
}: {
  engine: RunnerEngine;
  palette: ScenePalette;
}) {
  const cacti = useRef<Array<THREE.Group | null>>([]);
  const birds = useRef<Array<THREE.Group | null>>([]);

  useFrame(() => {
    let cactusIndex = 0;
    let birdIndex = 0;

    for (const obstacle of engine.obstacles) {
      if (obstacle.kind === "cactus") {
        const group = cacti.current[cactusIndex];
        if (group) {
          group.visible = true;
          group.position.set(laneToX(obstacle.lane), 0, obstacle.z);
          group.rotation.y =
            obstacle.variant === 0 ? 0.15 : obstacle.variant === 1 ? 0.8 : -0.45;
          group.scale.set(
            0.88 + obstacle.variant * 0.05,
            obstacle.height / 1.64,
            0.88 + obstacle.variant * 0.05,
          );
        }
        cactusIndex += 1;
      } else {
        const group = birds.current[birdIndex];
        if (group) {
          group.visible = true;
          group.position.set(laneToX(obstacle.lane), 2.16, obstacle.z);
          group.rotation.set(0, Math.PI, 0);
          group.scale.setScalar(0.94);
        }
        birdIndex += 1;
      }
    }

    for (let index = cactusIndex; index < cacti.current.length; index += 1) {
      if (cacti.current[index]) cacti.current[index]!.visible = false;
    }
    for (let index = birdIndex; index < birds.current.length; index += 1) {
      if (birds.current[index]) birds.current[index]!.visible = false;
    }
  });

  return (
    <>
      {Array.from({ length: 14 }, (_, index) => (
        <group
          key={`cactus-${index}`}
          visible={false}
          ref={(node) => {
            cacti.current[index] = node;
          }}
        >
          <CactusModel bodyColor={palette.obstacle} accent="#ef6b1b" />
        </group>
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <group
          key={`bird-${index}`}
          visible={false}
          ref={(node) => {
            birds.current[index] = node;
          }}
        >
          <BirdModel bodyColor={palette.obstacle} accent="#ef6b1b" />
        </group>
      ))}
    </>
  );
}

function ShardField({ engine }: { engine: RunnerEngine }) {
  const shards = useRef<Array<THREE.Group | null>>([]);

  useFrame((state) => {
    for (let index = 0; index < shards.current.length; index += 1) {
      const group = shards.current[index];
      if (!group) continue;
      const shard = engine.shards[index];

      if (!shard) {
        group.visible = false;
        continue;
      }

      group.visible = true;
      group.position.set(
        laneToX(shard.lane),
        shard.y + Math.sin(state.clock.elapsedTime * 2.4 + shard.phase) * 0.1,
        shard.z,
      );
      group.rotation.y = state.clock.elapsedTime * 2.2 + shard.phase;
      group.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 3 + shard.phase) * 0.08);
    }
  });

  return (
    <>
      {Array.from({ length: 7 }, (_, index) => (
        <group
          key={`shard-${index}`}
          visible={false}
          ref={(node) => {
            shards.current[index] = node;
          }}
        >
          <ShardModel accent="#ef6b1b" />
        </group>
      ))}
    </>
  );
}

function CameraRig({ engine }: { engine: RunnerEngine }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const shake = useRef(0);
  const wasOver = useRef(false);

  useFrame((_, delta) => {
    if (!camera.current) return;

    if (engine.status === "over" && !wasOver.current) {
      shake.current = 0.34;
    }
    wasOver.current = engine.status === "over";
    shake.current = Math.max(0, shake.current - delta * 1.5);

    const jitterX = (Math.random() - 0.5) * shake.current;
    const jitterY = (Math.random() - 0.5) * shake.current;

    camera.current.position.x = THREE.MathUtils.damp(
      camera.current.position.x,
      6.8 + engine.lane * 0.14 + jitterX,
      3.5,
      delta,
    );
    camera.current.position.y = THREE.MathUtils.damp(
      camera.current.position.y,
      4.7 + jitterY,
      3.5,
      delta,
    );
    camera.current.lookAt(0, 1.38, -8.4);
  });

  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      position={[6.8, 4.7, 10.4]}
      fov={43}
      near={0.1}
      far={180}
    />
  );
}
