class GameStartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameStartScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'gameStart').setOrigin(0.5);
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('sampleScene');
        });
    }
}
