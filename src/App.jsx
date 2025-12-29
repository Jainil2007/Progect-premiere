import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Dashboard from './Dashboard'
import SearchBar from './SearchBar'
import NasaPortal from './NasaPortal'
import { useStore } from './store'

function App() {
  const nasaPortalOpen = useStore(state => state.nasaPortalOpen);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <SearchBar />
      {nasaPortalOpen && <NasaPortal />}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Dashboard />
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
