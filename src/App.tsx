import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import oc from "open-color";
import { OceanCrossSection } from "./components/OceanCrossSection";

function App() {
	return (
		<Canvas
			style={{ width: "100vw", height: "100vh" }}
			camera={{ position: [5, 3, 5], fov: 50 }}
		>
			<color attach="background" args={[oc.gray[1]]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<OceanCrossSection />
			<OrbitControls />
		</Canvas>
	);
}

export default App;
