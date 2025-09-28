import create from 'zustand'
import * as THREE from 'three'

type Keys = { forward: boolean, back: boolean, left: boolean, right: boolean, reset: boolean }
type Store = {
  delivered: number
  reset: (ref: React.RefObject<THREE.Group>, center: THREE.Vector3, radius: number) => void
  keys: Keys
}

const useStore = create<Store>((set) => ({
  delivered: 0,
  reset: (ref, center, radius) => {
    if (!ref.current) return
    // Spawn at 75% up the sphere
    const spawnPosition = new THREE.Vector3(0, radius * 0.75, radius * 0.66).add(center)
    ref.current.position.copy(spawnPosition)
    
    // Look forward along the surface
    const lookAt = spawnPosition.clone().add(new THREE.Vector3(0, 0, -1))
    ref.current.lookAt(lookAt)
  },
  keys: { forward:false, back:false, left:false, right:false, reset:false }
}))

export default useStore