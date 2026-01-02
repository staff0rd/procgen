import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { OceanCrossSection } from "./components/OceanCrossSection";
import { DebugControls } from "./debug/DebugControls";
import { ocToHex, useDebugConfig } from "./debug/debugConfig";

function Scene() {
	const { world } = useDebugConfig();
	const bgColor = ocToHex(world.backgroundColor);

	return (
		<>
			<color attach="background" args={[bgColor]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<OceanCrossSection />
			<OrbitControls />
		</>
	);
}

function App() {
	return (
		<>
			<DebugControls />
			<Canvas
				style={{ width: "100vw", height: "100vh" }}
				camera={{ position: [5, 3, 5], fov: 50 }}
			>
				<Scene />
			</Canvas>
		</>
	);
}

export default App;
