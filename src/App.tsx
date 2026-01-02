import { Canvas } from "@react-three/fiber";

function Cube() {
	return (
		<mesh>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color="orange" />
		</mesh>
	);
}

function App() {
	return (
		<Canvas
			style={{ width: "100vw", height: "100vh" }}
			camera={{ position: [3, 3, 3], fov: 50 }}
		>
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<Cube />
		</Canvas>
	);
}

export default App;
