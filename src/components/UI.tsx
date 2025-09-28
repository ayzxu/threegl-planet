import { useEffect, useState } from 'react'
import useStore from '../state'

export default function UI() {
  const [msg, setMsg] = useState('Deliver the letter to the glowing mailbox.')
  const delivered = useStore(s => s.delivered)
  useEffect(() => { if (delivered > 0) setMsg('Nice! Press Space to reset to spawn.') }, [delivered])
  return null
}