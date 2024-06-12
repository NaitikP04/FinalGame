
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        // Set custom player properties
        this.direction = 'right';
        this.playerVelocity = 100;
        this.dashCooldown = 300;
        this.hurtTimer = 250;
        this.facing = 'right';
        this.health = 100;
        this.isHurt = false;

        this.hitbox = scene.add.rectangle(x, y + 5, 30, 10, 0xff0000, 0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.enable = false;

        // Initialize state machine managing player (initial state, possible states, state args[])
        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            swing: new SwingState(),
            dash: new DashState(),
        }, [scene, this]);
    }

    update(time, delta) {
        // this.stateMachine.step();
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
        if (!this.isHurt) {
            this.health -= amount;
            this.isHurt = true;
            this.setTint(0xff0000); // Flash red

            this.scene.time.delayedCall(this.hurtTimer, () => {
                this.clearTint();
                this.isHurt = false;
            });
        }
    }

    checkAttackCollision(target) {
        if (this.hitbox.body.enable && Phaser.Geom.Intersects.RectangleToRectangle(this.hitbox.getBounds(), target.getBounds())) {
            target.takeDamage(20); // Damage amount can be adjusted
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
        const { left, right, up, down, space, shift } = scene.keys;

        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
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
        const { left, right, up, down, space, shift } = scene.keys;

        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
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
