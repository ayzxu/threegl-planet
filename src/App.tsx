import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState, useRef } from 'react'
import { Environment, Html, KeyboardControls, StatsGl } from '@react-three/drei'
import * as THREE from 'three'
import Planet from './components/Planet'
import Player from './components/Player'
import AIPlayer from './components/AIPlayer'
import Camera from './components/Camera'
import UI from './components/UI'

export default function App() {
  // simple mobile quality toggle
  const [low, setLow] = useState(false)
  const [playerObject, setPlayerObject] = useState<THREE.Group | null>(null)
  const playerRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    setLow(isMobile)
  }, [])

  // Update player object when player is ready
  const handlePlayerReady = (player: THREE.Group) => {
    setPlayerObject(player)
  }

  return (
    <>
      <div className="hud">
        <div><strong>Andy Xu's Planet</strong></div>
        <div>WASD/Arrows: move • Space: reset</div>
      </div>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
          { name: 'back', keys: ['KeyS', 'ArrowDown'] },
          { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
          { name: 'right', keys: ['KeyD', 'ArrowRight'] },
          { name: 'reset', keys: ['Space'] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 4, 17], fov: 60 }}>
          <StatsGl /> 
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 10, 5]} castShadow intensity={1.1} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <Suspense fallback={<Html center>Loading…</Html>}>
            <Environment preset="sunset" />
            <Planet radius={10} />
            <Player ref={playerRef} planetCenter={[0,0,0]} planetRadius={10} low={low} onPlayerReady={handlePlayerReady} />
            <AIPlayer planetCenter={[0,0,0]} planetRadius={10} low={low} />
            <Camera 
              target={playerObject} 
              planetCenter={[0, 0, 0]} 
              planetRadius={10} 
              offset={[0, -3, 12]} 
              smoothness={0.1} 
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <UI />
    </>
  )
}