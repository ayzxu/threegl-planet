# Tiny Planet Starter (React + Vite + Three.js + R3F)

A barebones starter to build a Messenger-style tiny-planet WebGL experience.

## Quickstart
```bash
npm install
npm run dev
```

Open the shown URL. Controls: **WASD / Arrows to move**, **Space to reset**, **Right mouse drag to orbit**.

## Stack
- React + TypeScript + Vite
- three.js via @react-three/fiber and @react-three/drei
- zustand for minimal state

## What’s included
- Spherical world with simple baked texture (placeholders in `/assets`)
- Player controller with spherical gravity + ground alignment
- Basic lighting and environment
- Mobile-aware quality toggle (simplifies a few things on mobile)

## Next steps
- Replace `/assets/planet_bake.jpg` with your baked lightmap and add props/buildings.
- Add interaction zones (mailboxes/NPCs) by placing meshes and checking player distance in `useFrame`.
- If you want multiplayer, add a Socket.IO/Colyseus server that broadcasts `{id, pos, rot}`; interpolate others.
- Optimize: compress textures (KTX2/Basis), Draco-compress GLB models, and split non-critical code.
- Deploy to Cloudflare Pages/Netlify: `npm run build` and upload `dist/`.

## Notes
- This starter is intentionally small and readable. No physics engine; movement is kinematic.
- If shadows cost too much on mobile, disable the light’s `castShadow` and remove `receiveShadow/castShadow` flags.