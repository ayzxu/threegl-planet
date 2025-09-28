import * as THREE from 'three'
import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

type Props = { radius?: number }
export default function Planet({ radius = 10 }: Props) {
  const tex = useLoader(TextureLoader, '/assets/planet_bake.jpg')
  const normal = useLoader(TextureLoader, '/assets/planet_normal.png')
  const geo = useMemo(() => new THREE.SphereGeometry(radius, 128, 128), [radius])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={tex} normalMap={normal} roughness={0.95} metalness={0.0} />
    </mesh>
  )
}