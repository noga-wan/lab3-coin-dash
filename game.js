/* global Phaser, COIN_DASH */
class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.finished = false;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24, c.colors.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9, c.colors.coin);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < c.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * 270, 100, 26, 26, c.colors.drone);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * c.droneSpeed, Math.sin(angle) * c.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => {
      if (!this.isActive('shield')) this.finish('A drone caught you!');
    });
    this.effects = {};
    this.effectsHud = this.add.text(c.width - 18, 12, '', { font: '18px monospace', color: '#ffffff' })
      .setOrigin(1, 0);
    this.shieldRing = this.add.circle(0, 0, 21).setVisible(false)
      .setStrokeStyle(3, c.powerUps.types.shield.color);
    this.powerUp = this.add.star(0, 0, 4, 6, 14, 0xffffff).setVisible(false);
    this.physics.add.existing(this.powerUp);
    this.powerUp.body.enable = false;
    this.tweens.add({ targets: this.powerUp, angle: 360, duration: 1800, repeat: -1 });
    this.physics.add.overlap(this.player, this.powerUp, () => this.collectPowerUp());
    this.time.addEvent({
      delay: c.powerUps.spawnSeconds * 1000, loop: true, callback: () => this.spawnPowerUp()
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
  }

  placeCoin() {
    const { x, y } = this.randomSpot();
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  // A random point in the play area that is not directly underneath the player.
  randomSpot() {
    const c = COIN_DASH;
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    return { x, y };
  }

  spawnPowerUp() {
    if (this.finished || this.powerUp.visible) return;
    const p = COIN_DASH.powerUps;
    this.powerUpType = Phaser.Utils.Array.GetRandom(Object.keys(p.types));
    const { x, y } = this.randomSpot();
    this.powerUp.setPosition(x, y).setFillStyle(p.types[this.powerUpType].color).setVisible(true);
    this.powerUp.body.enable = true;
    this.powerUp.body.reset(x, y);
    this.powerUpExpires = this.time.now + p.lifetimeSeconds * 1000;
  }

  hidePowerUp() {
    this.powerUp.setVisible(false);
    this.powerUp.body.enable = false;
  }

  collectPowerUp() {
    if (this.finished || !this.powerUp.visible) return;
    this.hidePowerUp();
    const type = this.powerUpType;
    this.effects[type] = this.time.now + COIN_DASH.powerUps.types[type].seconds * 1000;
    if (type === 'freeze') this.setDronesFrozen(true);
  }

  isActive(type) {
    return (this.effects[type] || 0) > this.time.now;
  }

  setDronesFrozen(frozen) {
    const c = COIN_DASH;
    // Turning off `moves` stops a drone in place but keeps its velocity for when it thaws.
    this.drones.getChildren().forEach((drone) => {
      drone.body.moves = !frozen;
      drone.setFillStyle(frozen ? c.powerUps.types.freeze.color : c.colors.drone);
    });
  }

  updateEffects() {
    const types = COIN_DASH.powerUps.types;
    if (this.powerUp.visible && this.time.now > this.powerUpExpires) this.hidePowerUp();
    if (this.effects.freeze && !this.isActive('freeze')) {
      delete this.effects.freeze;
      this.setDronesFrozen(false);
    }
    this.shieldRing.setVisible(this.isActive('shield')).setPosition(this.player.x, this.player.y);
    this.effectsHud.setText(Object.keys(types).filter((type) => this.isActive(type))
      .map((type) => `${types[type].label} ${Math.ceil(Math.round(this.effects[type] - this.time.now) / 1000)}s`)
      .join('  '));
  }

  update() {
    if (this.finished) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const speed = COIN_DASH.playerSpeed
      * (this.isActive('speed') ? COIN_DASH.powerUps.speedMultiplier : 1);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(speed);
    this.player.body.setVelocity(direction.x, direction.y);
    this.updateEffects();
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}                       Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    this.shieldRing.setVisible(false);
    const c = COIN_DASH;
    this.add.rectangle(c.width / 2, c.height / 2, 460, 150, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
