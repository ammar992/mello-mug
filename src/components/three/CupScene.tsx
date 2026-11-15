"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CREAM = "#fbf3e8";

function useLathe(points: [number, number][], segments = 72) {
  return useMemo(() => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments), [points, segments]);
}

const CUP_PROFILE: [number, number][] = [
  [0, 0], [0.78, 0], [0.86, 0.04], [0.9, 0.12], [1.02, 0.6], [1.12, 1.15], [1.16, 1.42], [1.13, 1.46],
  [1.07, 1.44], [1.04, 1.18], [0.95, 0.62], [0.84, 0.2], [0, 0.18],
];
const SAUCER_PROFILE: [number, number][] = [
  [0, 0], [1.4, 0], [1.9, 0.08], [2.05, 0.18], [2.02, 0.22], [1.85, 0.16], [1.3, 0.1], [0, 0.1],
];

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.38);
  s.bezierCurveTo(-0.18, -0.24, -0.5, -0.02, -0.4, 0.2);
  s.bezierCurveTo(-0.32, 0.38, -0.08, 0.36, 0, 0.18);
  s.bezierCurveTo(0.08, 0.36, 0.32, 0.38, 0.4, 0.2);
  s.bezierCurveTo(0.5, -0.02, 0.18, -0.24, 0, -0.38);
  return s;
}

function Steam() {
  const group = useRef<THREE.Group>(null);
  const curves = useMemo(
    () =>
      [-0.35, 0, 0.35].map((x, i) =>
        new THREE.CatmullRomCurve3(
          Array.from({ length: 6 }, (_, k) => new THREE.Vector3(x + Math.sin(k * 1.4 + i) * 0.14, k * 0.32, Math.cos(k + i) * 0.08)),
        ),
      ),
    [],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current?.children.forEach((c, i) => {
      const m = c as THREE.Mesh;
      const phase = (t * 0.35 + i * 0.33) % 1;
      m.position.y = phase * 0.6;
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.45;
      m.scale.setScalar(0.85 + phase * 0.35);
    });
  });
  return (
    <group ref={group} position={[0, 1.55, 0]}>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 40, 0.045, 8, false]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Beans() {
  const ref = useRef<THREE.Group>(null);
  const beans = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        return { r: 2.3 + (i % 3) * 0.35, a, y: -0.2 + ((i * 37) % 10) / 6, s: 0.8 + ((i * 13) % 5) / 10, rot: i * 0.7 };
      }),
    [],
  );
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.12;
    ref.current.children.forEach((b, i) => {
      b.rotation.x += dt * (0.4 + (i % 3) * 0.2);
      b.rotation.z += dt * 0.3;
      b.position.y = beans[i].y + Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.12;
    });
  });
  return (
    <group ref={ref}>
      {beans.map((b, i) => (
        <group key={i} position={[Math.cos(b.a) * b.r, b.y, Math.sin(b.a) * b.r]} rotation={[b.rot, b.rot * 2, 0]} scale={b.s}>
          <mesh scale={[0.17, 0.12, 0.23]}>
            <sphereGeometry args={[1, 20, 20]} />
            <meshStandardMaterial color="#5a3825" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.115, 0]} scale={[0.02, 0.012, 0.2]}>
            <boxGeometry />
            <meshStandardMaterial color="#1c100a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Cup() {
  const root = useRef<THREE.Group>(null);
  const cup = useLathe(CUP_PROFILE);
  const saucer = useLathe(SAUCER_PROFILE);
  const heart = useMemo(() => new THREE.ShapeGeometry(heartShape(), 24), []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.5 + Math.sin(t * 0.3) * 0.15, 2.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.18 + 0.32, 2.5, dt);
  });

  return (
    <group ref={root} position={[0, -0.75, 0]}>
      <mesh geometry={saucer} position={[0, -0.02, 0]}>
        <meshPhysicalMaterial color={CREAM} roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cup} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial color={CREAM} roughness={0.22} clearcoat={1} clearcoatRoughness={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* caramel band */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[1.005, 0.97, 0.08, 72, 1, true]} />
        <meshStandardMaterial color="#c27a3e" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* coffee + crema + latte heart */}
      <mesh position={[0, 1.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 64]} />
        <meshStandardMaterial color="#8a5129" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.345, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.88, 1.05, 64]} />
        <meshStandardMaterial color="#5a3014" roughness={0.4} />
      </mesh>
      <mesh geometry={heart} position={[0, 1.35, 0.05]} rotation={[-Math.PI / 2, 0, Math.PI]} scale={1.15}>
        <meshStandardMaterial color="#fff3e2" roughness={0.6} />
      </mesh>
      {/* handle */}
      <mesh position={[1.12, 0.78, 0]} rotation={[0, 0, -0.1]}>
        <torusGeometry args={[0.36, 0.09, 18, 40, Math.PI * 1.15]} />
        <meshPhysicalMaterial color={CREAM} roughness={0.22} clearcoat={1} />
      </mesh>
      <Steam />
    </group>
  );
}

export default function CupScene({ active = true }: { active?: boolean }) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 2.6, 8.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      <ambientLight intensity={0.55} color="#ffe9d2" />
      <directionalLight position={[4, 6, 4]} intensity={1.8} color="#fff1dc" />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#e2a866" />
      <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
        <Cup />
      </Float>
      <Beans />
      <ContactShadows position={[0, -0.85, 0]} opacity={0.4} scale={7} blur={2.8} far={2.5} color="#3b2418" />
      <Environment resolution={128}>
        <Lightformer intensity={2.4} position={[0, 4, 3]} scale={[8, 2, 1]} color="#fff4e6" />
        <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[2, 6, 1]} color="#ffd6a8" />
        <Lightformer intensity={0.8} position={[4, 0, 2]} scale={[2, 6, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
