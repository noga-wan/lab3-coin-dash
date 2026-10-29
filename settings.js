// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  // One power-up at a time: appears every spawnSeconds, vanishes after lifetimeSeconds if not taken.
  powerUps: {
    spawnSeconds: 7,
    lifetimeSeconds: 5,
    speedMultiplier: 1.6,
    types: {
      shield: { label: 'Shield', seconds: 5, color: 0x6ab0ff },
      speed: { label: 'Speed', seconds: 5, color: 0x9dff6a },
      freeze: { label: 'Freeze', seconds: 4, color: 0xd6f3ff }
    }
  },
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a },
  // Scoring sounds are synthesized, so there are no audio files. Frequencies are in Hz.
  sound: {
    volume: 0.2,
    noteSeconds: 0.07,
    coinNotes: [988, 1319],
    milestoneEvery: 10,
    milestoneNotes: [784, 988, 1175, 1568]
  }
};
