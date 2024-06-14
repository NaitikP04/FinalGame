class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Display the game over graphic
        this.add.image(width / 2, height / 2, 'gameOver').setOrigin(0.5);

        // Implement screen shake effect
        this.cameras.main.shake(500, 0.01);

        this.sound.play('gameOver', { volume: 0.65 });

        // Listen for space key to restart the game
        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.stopByKey('gameOver');
            this.scene.start('sampleScene'); // Restart the main game scene
        });

        // Show a message to press space to restart if it's not included in the graphic
        // this.add.text(width / 2, height / 2 + 100, 'Press SPACE to restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    }
}
