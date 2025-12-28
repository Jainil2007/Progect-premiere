import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Overlay from './Overlay'
import { useStore } from './store'

function App() {
  return (
    <>
      <Overlay />
      <Canvas
        camera={{ position: [0, 200, 500], fov: 45, far: 100000 }}
        onPointerMissed={() => useStore.getState().clearSelection()}
      >
        <Scene />
      </Canvas>
    </>
  )
}

export default App
