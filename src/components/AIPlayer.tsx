import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../state'
import PlayerModel from './PlayerModel'
import Footsteps from './Footsteps'

type Props = {
  planetCenter: [number, number, number]
  planetRadius: number
  low?: boolean
}

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

export default function AIPlayer({
  planetCenter = [0, 0, 0],
  planetRadius,
  low = false,
}: Props) {
  const playerRef = useRef<THREE.Group>(null!)
  const reset = useStore((s) => s.reset)

  const center = useMemo(() => new THREE.Vector3(...planetCenter), [planetCenter])
  const up = useMemo(() => new THREE.Vector3(), [])
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const yUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const direction = useRef(new THREE.Vector3())
  const changeTimer = useRef(0)
  const speed = low ? 2.0 : 2.75

  const chooseNewDirection = () => {
    if (!playerRef.current) return

    up.copy(playerRef.current.position).sub(center).normalize()

    // Generate a random vector and project it onto the tangent plane
    const randomVec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    tangent.copy(randomVec.sub(up.clone().multiplyScalar(randomVec.dot(up))))

    if (tangent.lengthSq() < 1e-4) {
      // Fall back to cross product with a world-up axis to avoid degeneracy
      tangent.crossVectors(up, yUp)
    }

    if (tangent.lengthSq() < 1e-4) {
      tangent.set(1, 0, 0)
    }

    tangent.normalize()
    direction.current.copy(tangent)
    changeTimer.current = randomInRange(1.5, 3.5)
  }

  useEffect(() => {
    reset(playerRef, center, planetRadius)
    chooseNewDirection()
  }, [reset, center, planetRadius])

  useFrame((_, dt) => {
    const group = playerRef.current
    if (!group) return

    changeTimer.current -= dt
    if (changeTimer.current <= 0) {
      chooseNewDirection()
    }

    if (direction.current.lengthSq() === 0) return

    const moveStep = direction.current.clone().multiplyScalar(speed * dt)
    group.position.add(moveStep)

    // Stick to surface and keep in upper hemisphere
    const fromCenter = group.position.clone().sub(center).normalize()
    group.position.copy(fromCenter.multiplyScalar(planetRadius + 1).add(center))

    if (fromCenter.y < 0) {
      fromCenter.y = 0
      fromCenter.normalize()
      group.position.copy(fromCenter.multiplyScalar(planetRadius + 1).add(center))
      chooseNewDirection()
    }

    const northPoleBuffer = 0.98
    if (fromCenter.y > northPoleBuffer) {
      fromCenter.y = northPoleBuffer
      fromCenter.normalize()
      group.position.copy(fromCenter.multiplyScalar(planetRadius + 1).add(center))
      chooseNewDirection()
    }

    // Update up and adjust direction to stay tangent
    up.copy(group.position).sub(center).normalize()
    tangent.copy(direction.current)
    tangent.sub(up.clone().multiplyScalar(tangent.dot(up)))
    if (tangent.lengthSq() > 1e-4) {
      tangent.normalize()
      direction.current.copy(tangent)
    } else {
      chooseNewDirection()
    }

    // Face along movement direction
    const lookAt = group.position.clone().add(direction.current)
    group.lookAt(lookAt)
  })

  return (
    <>
      <group ref={playerRef}>
        <PlayerModel
          modelPath="/models/player.gltf"
          fallbackColor="#4a90e2"
        />
      </group>
      <Footsteps
        playerRef={playerRef}
        planetCenter={planetCenter}
        planetRadius={planetRadius}
        maxFootsteps={6}
      />
    </>
  )
}
