
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        // Set custom player properties
        this.direction = 'right';
        this.playerVelocity = 150;
        this.dashCooldown = 2000;  // Updated to a more reasonable cooldown
        this.hurtTimer = 500;
        this.facing = 'right';
        this.health = 200;
        this.maxHealth = 200;
        this.isHurt = false;
        this.lives = 0;
        this.isReviving = false;

        this.canDash = false;
        this.canUseShuriken = false;
        this.hasUpgradedShuriken = false;

        this.basicShurikenCooldown = 3000; // Updated to a more reasonable cooldown
        this.upgradedShurikenCooldown = 2000; // Updated to a more reasonable cooldown
        this.lastShurikenTime = 0;
        this.lastDashTime = 0;  // Added for dash cooldown tracking

        this.hitbox = scene.add.rectangle(x, y + 5, 30, 10, 0xff0000, 0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.enable = false;

        // Initialize state machine managing player
        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            swing: new SwingState(),
            dash: new DashState(),
            shoot: new ShootState(),
            revive: new ReviveState()
        }, [scene, this]);

        // Initialize health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Initialize UI
        this.ui = new UI(scene);
    }

    update(time, delta) {
        this.stateMachine.step();
        this.resetHitbox();
        this.updateHealthBar();
        this.ui.updateShurikenCooldown(this.hasUpgradedShuriken ? this.upgradedShurikenCooldown : this.basicShurikenCooldown, this.hasUpgradedShuriken, time, this.lastShurikenTime);
        this.ui.updateDashCooldown(this.dashCooldown, time, this.lastDashTime);
    }

    updateHitbox() {
        if (this.facing === 'left') {
            this.hitbox.x = this.x - 20;
            this.hitbox.y = this.y + 5;
        } else if (this.facing === 'right') {
            this.hitbox.x = this.x + 20;
            this.hitbox.y = this.y + 5;
        }
    }

    resetHitbox() {
        this.hitbox.x = this.x;
        this.hitbox.y = this.y + 5;
    }

    takeDamage(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error(`Invalid damage amount: ${amount}`);
            return;
        }

        if (!this.isHurt && !this.isReviving) {
            this.health -= amount;
            this.isHurt = true;
            this.setTint(0xff0000); // Flash red

            if (this.health <= 0) {
                if (this.lives > 0) {
                    this.lives -= 1;
                    this.stateMachine.transition('revive');
                } else {
                    this.setVelocity(0);
                    this.clearTint();
                    this.anims.play('death');
                    if (this.scene.isBossMusicPlaying){
                        this.scene.sound.stopByKey('bossMusic');
                        this.scene.isBossMusicPlaying = false;
                    }
                    if (this.scene.isBackgroundMusicPlaying) {
                        this.scene.backgroundMusic.stop();
                        this.scene.isBossMusicPlaying = false;
                    }
                    this.scene.time.delayedCall(3200, () => { // 3 seconds delay for death animation
                        this.scene.scene.start('GameOverScene'); // Transition to game over scene
                    });                
                }
            } else {
                this.scene.time.delayedCall(this.hurtTimer, () => {
                    this.clearTint();
                    this.isHurt = false;
                });
            }

            this.updateHealthBar();
        }
    }

    revive() {
        this.isReviving = true;
        this.isHurt = true;
        this.anims.play('revive');
        this.clearTint();
        this.scene.time.delayedCall(2000, () => { // Adjust the duration if needed
            this.health = this.maxHealth; // Reset health
            this.isReviving = false;
            this.isHurt = false;
            this.stateMachine.transition('idle');
            this.updateHealthBar();
        });
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.x - 15, this.y - 20, (30 * this.health) / this.maxHealth, 5);
        this.healthBar.lineStyle(1, 0xffffff);
        this.healthBar.strokeRect(this.x - 15, this.y - 20, 30, 5);
    }

    shootShuriken() {
        const currentTime = this.scene.time.now;
        const cooldown = this.hasUpgradedShuriken ? this.upgradedShurikenCooldown : this.basicShurikenCooldown;
        if (!this.canUseShuriken || currentTime - this.lastShurikenTime < cooldown) {
            return;
        }

        this.lastShurikenTime = currentTime;
        const shurikenType = this.hasUpgradedShuriken ? 'shurikenUpgraded' : 'shurikenBasic';
        const damage = this.hasUpgradedShuriken ? 15 : 5;
        const piercing = this.hasUpgradedShuriken ? 2 : 1;
        const speed = 300;

        let velocity = new Phaser.Math.Vector2(0, 0);
        const { left, right, up, down } = this.scene.keys;

        if (left.isDown) {
            velocity.x = -speed;
        }
        if (right.isDown) {
            velocity.x = speed;
        }
        if (up.isDown) {
            velocity.y = -speed;
        }
        if (down.isDown) {
            velocity.y = speed;
        }

        if (velocity.length() === 0) {
            // Default direction if no keys are pressed
            velocity.x = this.facing === 'left' ? -speed : speed;
        }

        velocity.normalize().scale(speed);

        const shuriken = new Shuriken(this.scene, this.x, this.y, shurikenType, damage, piercing, velocity, this.direction);
        shuriken.setScale(0.6);

        // Play the appropriate sound effect
        if (this.hasUpgradedShuriken) {
            this.scene.sound.play('shurikenUpgraded');
        } else {
            this.scene.sound.play('shurikenBasic');
        }
    }

    unlockDash() {
        this.canDash = true;
        this.ui.showDashUI();
    }

    unlockShuriken() {
        this.canUseShuriken = true;
        this.ui.showShurikenUI();
    }

    upgradeShuriken() {
        this.hasUpgradedShuriken = true;
        this.ui.showDashUI();
    }

    dash() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastDashTime >= this.dashCooldown) {
            this.lastDashTime = currentTime;
            this.stateMachine.transition('dash');
            this.scene.sound.play('dash');
        }
    }
}


// Player-specific state classes
class IdleState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('idle', true);
    }

    execute(scene, player) {
        const { left, right, up, down, space, shift, c } = scene.keys;

        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        if (player.canDash && Phaser.Input.Keyboard.JustDown(shift)) {
            player.dash();
            return;
        }

        if (player.canUseShuriken && Phaser.Input.Keyboard.JustDown(c)) {
            this.stateMachine.transition('shoot');
            return;
        }

        if (left.isDown || right.isDown || up.isDown || down.isDown) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends State {
    execute(scene, player) {
        const { left, right, up, down, space, shift, c } = scene.keys;

        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        if (player.canDash && Phaser.Input.Keyboard.JustDown(shift)) {
            player.dash();
                return;
        }

        if (player.canUseShuriken && Phaser.Input.Keyboard.JustDown(c)) {
            this.stateMachine.transition('shoot');
            return;
        }

        if (!up.isDown && !left.isDown && !down.isDown && !right.isDown) {
            this.stateMachine.transition('idle');
            return;
        }

        let moveDirection = new Phaser.Math.Vector2(0, 0);
        if (up.isDown) {
            moveDirection.y = -1;
            player.direction = 'up';
        } else if (down.isDown) {
            moveDirection.y = 1;
            player.direction = 'down';
        }
        if (left.isDown) {
            moveDirection.x = -1;
            player.direction = 'left';
            player.facing = 'left';
            player.setFlipX(true);
        } else if (right.isDown) {
            moveDirection.x = 1;
            player.direction = 'right';
            player.facing = 'right';
            player.setFlipX(false);
        }

        moveDirection.normalize();
        player.setVelocity(player.playerVelocity * moveDirection.x, player.playerVelocity * moveDirection.y);
        player.anims.play('run', true);
    }
}

class SwingState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('attack');
        player.hitbox.body.enable = true;
        player.updateHitbox();
        player.once('animationcomplete', () => {
            player.hitbox.body.enable = false;
            this.stateMachine.transition('idle');
        });
    }

    execute(scene, player) {
        player.updateHitbox();
        // player.checkAttackCollision(scene.assassinBoss);
    }
}


class DashState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('dash');
        player.setTint(0x00AA00);

        const dashDistance = player.playerVelocity * 4; // Adjust if needed
        const dashDuration = 200; // Adjust the duration of the dash in milliseconds

        if (player.flipX) {
            player.setVelocityX(-dashDistance);
        } else {
            player.setVelocityX(dashDistance);
        }

        scene.time.delayedCall(dashDuration, () => {
            player.setVelocity(0);
            player.clearTint();
            this.stateMachine.transition('idle');
        });
    }
}

class ShootState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.shootShuriken();
        this.stateMachine.transition('idle');
    }
}

class ReviveState extends State {
    enter(scene, player) {
        player.revive();
    }
}
