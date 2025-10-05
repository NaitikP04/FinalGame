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

        // Control hints UI (top-left corner with pixelated style)
        const controlsX = 10;
        const controlsY = 10;
        const lineHeight = 20;
        
        // Movement controls
        this.movementText = scene.add.text(controlsX, controlsY, 'MOVE: WASD / Arrow Keys', { 
            fontSize: '12px', 
            fill: '#fff',
            fontFamily: 'monospace',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0).setScrollFactor(0);
        
        // Attack controls
        this.attackText = scene.add.text(controlsX, controlsY + lineHeight, 'ATTACK: SPACE / Left Click', { 
            fontSize: '12px', 
            fill: '#fff',
            fontFamily: 'monospace',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0).setScrollFactor(0);
        
        // Dash controls (initially hidden)
        this.dashText = scene.add.text(controlsX, controlsY + lineHeight * 2, 'DASH: SHIFT / Middle Click', { 
            fontSize: '12px', 
            fill: '#ffff00',
            fontFamily: 'monospace',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0).setScrollFactor(0).setVisible(false);
        
        // Shuriken controls (initially hidden)
        this.shurikenText = scene.add.text(controlsX, controlsY + lineHeight * 3, 'SHURIKEN: C / Right Click', { 
            fontSize: '12px', 
            fill: '#00ffff',
            fontFamily: 'monospace',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0).setScrollFactor(0).setVisible(false);

        this.add([this.shurikenIcon, this.shurikenCooldownText, this.dashIcon, this.dashCooldownText, 
                  this.movementText, this.attackText, this.dashText, this.shurikenText]);
    }

    showShurikenUI() {
        this.shurikenIcon.setVisible(true);
        this.shurikenCooldownText.setVisible(true);
        this.shurikenText.setVisible(true);
    }

    showDashUI() {
        this.dashIcon.setVisible(true);
        this.dashCooldownText.setVisible(true);
        this.dashText.setVisible(true);
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

        this.shurikenIcon.setFrame(isUpgraded ? 0 : 5); 
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
