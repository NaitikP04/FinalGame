
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height/2);
        this.body.setCollideWorldBounds(true);

        // Set custom player properties
        this.direction = 'right';
        this.playerVelocity = 500; //original 100
        this.dashCooldown = 300;
        this.hurtTimer = 500;
        this.facing = 'right';
        this.health = 100; // Initialize health
        this.isHurt = false;
        this.lives = 3; // Number of extra lives
        this.isReviving = false;

        this.canDash = true; // Locked by default
        this.canUseShuriken = true; // Locked by default
        this.hasUpgradedShuriken = true;

        this.basicShurikenCooldown = 4000;
        this.upgradedShurikenCooldown = 2000;
        this.lastShurikenTime = 0;

        this.hitbox = scene.add.rectangle(x, y + 5, 30, 10, 0xff0000, 0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.enable = false;

        // Initialize state machine managing player (initial state, possible states, state args[])
        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            swing: new SwingState(),
            dash: new DashState(),
            shoot: new ShootState(),
            revive: new ReviveState()
        }, [scene, this]);
    }

    update(time, delta) {
        this.stateMachine.step();
        this.resetHitbox(); // Reset hitbox position
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
        this.hitbox.y = this.y + 5; // Adjust position as needed
    }

    takeDamage(amount) {
        console.log(`Taking damage: ${amount}`); // Log the amount of damage
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error(`Invalid damage amount: ${amount}`);
            return;
        }

        if (!this.isHurt && !this.isReviving) {
            this.health -= amount;
            this.isHurt = true;
            this.setTint(0xff0000); // Flash red

            console.log(`Player health after damage: ${this.health}`);

            if (this.health <= 0) {
                if (this.lives > 0) {
                    this.lives -= 1;
                    this.stateMachine.transition('revive');
                } else {
                    // Handle player death (e.g., game over logic)
                }
            } else {
                this.scene.time.delayedCall(this.hurtTimer, () => {
                    this.clearTint();
                    this.isHurt = false;
                });
            }
        }
    }

    revive() {
        this.isReviving = true;
        this.isHurt = true;
        this.anims.play('revive');
        this.clearTint();
        this.scene.time.delayedCall(2000, () => { // Adjust the duration if needed
            this.health = 100; // Reset health
            this.isReviving = false;
            this.isHurt = false;
            this.stateMachine.transition('idle');
        });
    }

    checkAttackCollision(target) {
        if (this.hitbox.body.enable && Phaser.Geom.Intersects.RectangleToRectangle(this.hitbox.getBounds(), target.getBounds())) {
            target.takeDamage(20); // Damage amount can be adjusted
        }
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
    }

    unlockDash() {
        this.canDash = true;
    }

    unlockShuriken() {
        this.canUseShuriken = true;
    }

    upgradeShuriken() {
        this.hasUpgradedShuriken = true;
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
            this.stateMachine.transition('dash');
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
            this.stateMachine.transition('dash');
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

        if (player.flipX) {
            player.setVelocityX(-player.playerVelocity * 3);
        } else {
            player.setVelocityX(player.playerVelocity * 3);
        }

        scene.time.delayedCall(player.dashCooldown, () => {
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
