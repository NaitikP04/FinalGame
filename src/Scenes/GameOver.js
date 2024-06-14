class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'gameOver').setOrigin(0.5);

        this.cameras.main.shake(500, 0.01);

        this.sound.play('gameOver', { volume: 0.65 });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.stopByKey('gameOver');
            this.scene.start('sampleScene'); // Restart the main game scene
        });

    }
}
