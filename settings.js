// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
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
