import { useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  modelPath?: string
  fallbackColor?: string
}

export default function PlayerModel({ 
  modelPath = '/models/player.gltf', 
  fallbackColor = '#f1c27d' 
}: Props) {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)
  
  // Try to load the custom model
  let gltf: any = null
  try {
    gltf = useGLTF(modelPath)
    if (gltf && !modelLoaded) {
      setModelLoaded(true)
    }
  } catch (error) {
    if (!modelError) {
      console.warn(`Failed to load model at ${modelPath}:`, error)
      setModelError(true)
    }
  }

  // If model loaded successfully, use it
  if (modelLoaded && gltf && gltf.scene) {
    return (
      <primitive 
        object={gltf.scene.clone()} 
        scale={[0.5, 0.5, 0.5]} // Adjust scale as needed
        castShadow
      />
    )
  }

  // Fallback to simple geometry if model fails to load
  return (
    <mesh castShadow>
      <capsuleGeometry args={[0.3, 1.0, 8, 16]} />
      <meshStandardMaterial color={fallbackColor} />
    </mesh>
  )
}
