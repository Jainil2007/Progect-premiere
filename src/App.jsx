import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Overlay from './Overlay'
import { useStore } from './store'

import SearchBar from './SearchBar'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <SearchBar />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Overlay />
        <Canvas
          camera={{ position: [0, 200, 500], fov: 45, far: 100000 }}
          onPointerMissed={() => useStore.getState().clearSelection()}
        >
          <Scene />
        </Canvas>
      </div>
    </div>
  )
}

export default App
