import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

type Props = {
  target: THREE.Object3D | null
  planetCenter?: [number, number, number]
  planetRadius?: number
  offset?: [number, number, number]
  smoothness?: number
}

export default function Camera({ 
  target, 
  planetCenter = [0, 0, 0], 
  planetRadius = 10, 
  offset = [0, 4, 8], 
  smoothness = 0.1 
}: Props) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3())
  const currentPosition = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())
  const center = useRef(new THREE.Vector3(...planetCenter))

  useEffect(() => {
    // Initialize camera position
    if (target) {
      // Calculate camera position relative to sphere surface
      const playerToCenter = target.position.clone().sub(center.current).normalize()
      const cameraOffset = new THREE.Vector3(...offset)
      
      // Position camera behind and above player on the sphere
      const desiredPosition = target.position.clone().add(
        playerToCenter.clone().multiplyScalar(cameraOffset.z)
      ).add(new THREE.Vector3(0, cameraOffset.y, 0))
      
      targetPosition.current.copy(desiredPosition)
      camera.position.copy(targetPosition.current)
      currentPosition.current.copy(camera.position)
    }
  }, [target, camera, offset, planetRadius])

  useFrame(() => {
    if (!target) return

    // Calculate camera position relative to sphere surface
    const playerToCenter = target.position.clone().sub(center.current).normalize()
    const cameraOffset = new THREE.Vector3(...offset)
    
    // Position camera behind and above player on the sphere
    const desiredPosition = target.position.clone().add(
      playerToCenter.clone().multiplyScalar(cameraOffset.z)
    ).add(new THREE.Vector3(0, cameraOffset.y, 0))
    
    // Smooth camera movement
    targetPosition.current.lerp(desiredPosition, smoothness)
    currentPosition.current.lerp(targetPosition.current, smoothness)
    
    // Update camera position
    camera.position.copy(currentPosition.current)
    
    // Make camera look at the player
    currentLookAt.current.lerp(target.position, smoothness)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
