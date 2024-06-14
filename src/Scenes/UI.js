class UI extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        // Shuriken cooldown UI
        this.shurikenIcon = scene.add.image(50, scene.scale.height - 50, 'shuriken', 5).setOrigin(0.5).setVisible(false);
        this.shurikenCooldownText = scene.add.text(50, scene.scale.height - 25, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5).setVisible(false);
        this.shurikenIcon.setScrollFactor(0);
        this.shurikenCooldownText.setScrollFactor(0);

        // Dash cooldown UI
        this.dashIcon = scene.add.image(100, scene.scale.height - 50, 'dash').setOrigin(0.5).setVisible(false);
        this.dashCooldownText = scene.add.text(100, scene.scale.height - 25, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5).setVisible(false);
        this.dashIcon.setScrollFactor(0);
        this.dashIcon.setScale(0.7);
        this.dashCooldownText.setScrollFactor(0);

        this.add([this.shurikenIcon, this.shurikenCooldownText, this.dashIcon, this.dashCooldownText]);
    }

    showShurikenUI() {
        this.shurikenIcon.setVisible(true);
        this.shurikenCooldownText.setVisible(true);
    }

    showDashUI() {
        this.dashIcon.setVisible(true);
        this.dashCooldownText.setVisible(true);
    }

    updateShurikenCooldown(cooldown, isUpgraded, currentTime, lastShurikenTime) {
        const remainingCooldown = cooldown - (currentTime - lastShurikenTime);
        if (remainingCooldown > 0) {
            const opacity = (cooldown - remainingCooldown) / cooldown;
            this.shurikenIcon.setAlpha(opacity);
            this.shurikenCooldownText.setText(Math.ceil(remainingCooldown / 1000) + 's');
        } else {
            this.shurikenIcon.setAlpha(1);
            this.shurikenCooldownText.setText('');
        }

        this.shurikenIcon.setFrame(isUpgraded ? 0 : 5); // Set the correct frame for the shuriken icon
    }

    updateDashCooldown(cooldown, currentTime, lastDashTime) {
        const remainingCooldown = cooldown - (currentTime - lastDashTime);
        if (remainingCooldown > 0) {
            const opacity = (cooldown - remainingCooldown) / cooldown;
            this.dashIcon.setAlpha(opacity);
            this.dashCooldownText.setText(Math.ceil(remainingCooldown / 1000) + 's');
        } else {
            this.dashIcon.setAlpha(1);
            this.dashCooldownText.setText('');
        }
    }
}
