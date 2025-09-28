import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Footstep = {
  position: THREE.Vector3
  rotation: THREE.Euler
  age: number
}

type Props = {
  playerRef: React.RefObject<THREE.Group>
  planetCenter: [number, number, number]
  planetRadius: number
  maxFootsteps?: number
}

export default function Footsteps({ 
  playerRef, 
  planetCenter, 
  planetRadius, 
  maxFootsteps = 10 
}: Props) {
  const footstepsRef = useRef<THREE.Group>(null!)
  const footsteps = useRef<Footstep[]>([])
  const lastFootstepTime = useRef(0)
  const footstepInterval = 0.5 // Place a footstep every 0.5 seconds
  const center = useRef(new THREE.Vector3(...planetCenter))

  // Add a new footstep
  const addFootstep = () => {
    if (!playerRef.current) return

    const playerPos = playerRef.current.position.clone()
    const playerRot = playerRef.current.rotation.clone()

    // Add new footstep
    footsteps.current.push({
      position: playerPos.clone(),
      rotation: playerRot.clone(),
      age: 0
    })

    // Remove oldest footstep if we exceed max
    if (footsteps.current.length > maxFootsteps) {
      footsteps.current.shift()
    }

    // Update the visual representation
    updateFootstepMeshes()
  }

  // Update the visual representation of footsteps
  const updateFootstepMeshes = () => {
    if (!footstepsRef.current) return

    // Clear existing meshes
    footstepsRef.current.clear()

    footsteps.current.forEach((footstep, index) => {
      const footstepGroup = new THREE.Group()
      
      // Create a small 3D cylinder to represent the footstep
      const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x8B4513, // Brown color
        transparent: true,
        opacity: Math.max(0.1, (index + 1) / maxFootsteps) // Start dark, fade to lighter
      })
      
      const footstepMesh = new THREE.Mesh(geometry, material)
      
      // Position the footstep on the planet surface
      const direction = footstep.position.clone().sub(center.current).normalize()
      const surfacePosition = direction.multiplyScalar(planetRadius).add(center.current)
      
      footstepGroup.position.copy(surfacePosition)
      
      // Orient the cylinder to stand perpendicular to the planet surface
      footstepGroup.lookAt(surfacePosition.clone().add(direction))
      // Rotate to make the cylinder stand up from the surface
      footstepGroup.rotateX(Math.PI / 2)
      
      footstepGroup.add(footstepMesh)
      footstepsRef.current.add(footstepGroup)
    })
  }

  useFrame((_, delta) => {
    if (!playerRef.current) return

    // Update age of existing footsteps
    footsteps.current.forEach(footstep => {
      footstep.age += delta
    })

    // Check if it's time to place a new footstep
    const currentTime = performance.now() / 1000
    if (currentTime - lastFootstepTime.current > footstepInterval) {
      addFootstep()
      lastFootstepTime.current = currentTime
    }

    // Update visual representation
    updateFootstepMeshes()
  })

  return <group ref={footstepsRef} />
}
