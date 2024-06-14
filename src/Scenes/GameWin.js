class GameWinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameWinScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'gameWin').setOrigin(0.5);
        this.sound.play('winScreen', { volume: 0.65 });
    }
}