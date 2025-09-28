// src/components/Player.tsx
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, forwardRef } from 'react'
import { useKeyboardControls, OrbitControls } from '@react-three/drei'
import useStore from '../state'
import Footsteps from './Footsteps'
import PlayerModel from './PlayerModel'

type Props = {
  planetCenter: [number, number, number]
  planetRadius: number
  low?: boolean
  onPlayerReady?: (player: THREE.Group) => void
}

const Player = forwardRef<THREE.Group, Props>(({ planetCenter = [0, 0, 0], planetRadius, low = false, onPlayerReady }, ref) => {
  const internalRef = useRef<THREE.Group>(null!)
  const playerRef = ref || internalRef

  // ✅ New API: get [subscribe, get] from the hook
  const [subscribeKeys, getKeys] = useKeyboardControls<{
    forward: boolean
    back: boolean
    left: boolean
    right: boolean
    reset: boolean
  }>()

  const speed = low ? 2.5 : 3.5
  const center = useMemo(() => new THREE.Vector3(...planetCenter), [planetCenter])

  // Reuse vectors to avoid allocations every frame
  const up = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const tangentForward = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const yUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  const reset = useStore((s) => s.reset)

  // Reset-to-spawn on Space (or whatever you mapped to "reset")
  useEffect(() => {
    const unsub = subscribeKeys(
      (state) => state.reset,
      (pressed) => {
        if (pressed) reset(playerRef, center, planetRadius)
      }
    )
    return unsub
  }, [subscribeKeys, reset, center, planetRadius])

  // Initial spawn
  useEffect(() => {
    reset(playerRef, center, planetRadius)
  }, [reset, center, planetRadius])

  // Notify parent when player is ready
  useEffect(() => {
    if (playerRef.current && onPlayerReady) {
      onPlayerReady(playerRef.current)
    }
  }, [onPlayerReady])

  useFrame((_, dt) => {
    if (!playerRef.current) return
    const { forward, back, left, right: rightKey } = getKeys()
  
    // Spherical up from center → player
    up.copy(playerRef.current.position).sub(center).normalize()
  
    // Choose a reference axis that's NOT parallel to 'up'
    const xAxis = new THREE.Vector3(1, 0, 0)
    const zAxis = new THREE.Vector3(0, 0, 1)
    
    // Use different reference axes based on player position to avoid singularities
    let refAxis
    if (Math.abs(up.dot(yUp)) > 0.99) {
      // Near north pole, use X axis
      refAxis = xAxis
    } else if (Math.abs(up.dot(xAxis)) > 0.99) {
      // Near X poles, use Z axis
      refAxis = zAxis
    } else {
      // Default case, use Y axis
      refAxis = yUp
    }
  
    // Build tangent basis on the sphere with safety checks
    right.crossVectors(refAxis, up)
    if (right.lengthSq() < 0.001) {
      // Fallback if cross product is too small
      right.set(1, 0, 0)
    }
    right.normalize()
    
    tangentForward.crossVectors(up, right)
    if (tangentForward.lengthSq() < 0.001) {
      // Fallback if cross product is too small
      tangentForward.set(0, 0, 1)
    }
    tangentForward.normalize()
  
    // Movement
    dir.set(0, 0, 0)
    if (forward) dir.add(tangentForward)
    if (back)    dir.sub(tangentForward)
    if (left)    dir.sub(right)
    if (rightKey)dir.add(right)
  
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed * dt)
      playerRef.current.position.add(dir)
  
      // Stick to surface
      const fromCenter = playerRef.current.position.clone().sub(center).normalize()
      playerRef.current.position.copy(fromCenter.multiplyScalar(planetRadius + 1).add(center))
      
      // Constrain to upper hemisphere (Y >= 0) - add buffer near north pole
      const currentPos = playerRef.current.position.clone()
      const toCenter = currentPos.sub(center).normalize()
      
      // If player is in lower hemisphere, project to equator
      if (toCenter.y < 0) {
        toCenter.y = 0
        toCenter.normalize()
        playerRef.current.position.copy(toCenter.multiplyScalar(planetRadius + 1).add(center))
      }
      
      // Add small buffer near north pole to prevent spinning
      const northPoleBuffer = 0.98 // Very close to north pole but not exact
      if (toCenter.y > northPoleBuffer) {
        toCenter.y = northPoleBuffer
        toCenter.normalize()
        playerRef.current.position.copy(toCenter.multiplyScalar(planetRadius + 1).add(center))
      }
      
      // Update up vector after constraint
      up.copy(playerRef.current.position).sub(center).normalize()
      
      // Rebuild tangent basis with updated up vector using same logic
      let newRefAxis
      if (Math.abs(up.dot(yUp)) > 0.99) {
        // Near north pole, use X axis
        newRefAxis = xAxis
      } else if (Math.abs(up.dot(xAxis)) > 0.99) {
        // Near X poles, use Z axis
        newRefAxis = zAxis
      } else {
        // Default case, use Y axis
        newRefAxis = yUp
      }
      
      right.crossVectors(newRefAxis, up)
      if (right.lengthSq() < 0.001) {
        right.set(1, 0, 0)
      }
      right.normalize()
      
      tangentForward.crossVectors(up, right)
      if (tangentForward.lengthSq() < 0.001) {
        tangentForward.set(0, 0, 1)
      }
      tangentForward.normalize()
  
      // Face along the surface
      const lookAt = playerRef.current.position.clone().add(tangentForward)
      playerRef.current.lookAt(lookAt)
    }
  })

  return (
    <>
      <group ref={playerRef}>
        <PlayerModel 
          modelPath="/models/player.gltf" 
          fallbackColor="#f1c27d" 
        />
      </group>
      <Footsteps 
        playerRef={playerRef} 
        planetCenter={planetCenter} 
        planetRadius={planetRadius} 
        maxFootsteps={10} 
      />
      <OrbitControls enablePan={false} />
    </>
  )
})

Player.displayName = 'Player'

export default Player
