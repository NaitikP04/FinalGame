// player prefab
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame); // Call Sprite parent class
        scene.add.existing(this);           // Add player to existing scene
        scene.physics.add.existing(this);   // Add physics body to scene

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        // Set custom player properties
        this.direction = 'right';           // Default direction
        this.playerVelocity = 100;            // Velocity in pixels
        this.dashCooldown = 300;            // Dash cooldown in ms
        this.hurtTimer = 250;               // Hurt timer in ms
        this.facing = 'right';              // Default facing direction

        this.hitbox = scene.add.rectangle(x, y+5, 30, 10, 0xff0000, 0);  // Invisible rectangle
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.enable = false;

        // Initialize state machine managing player (initial state, possible states, state args[])
        scene.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            swing: new SwingState(),
            dash: new DashState(),
        }, [scene, this]);   // Pass these as arguments to maintain scene/object context in the FSM
    }

    update(time, delta) {
        this.resetHitbox();  // Reset hitbox position
    }

    updateHitbox() {
        if (this.facing === 'left') {
            this.hitbox.x = this.x - 20;
            this.hitbox.y = this.y+5;
        } else if (this.facing === 'right'){
            this.hitbox.x = this.x + 20;
            this.hitbox.y = this.y+5;
        }
    }

    resetHitbox() {
        // Reset hitbox position
        this.hitbox.x = this.x;  
        this.hitbox.y = this.y + 5;  // Adjust position as needed
    }
}

// player-specific state classes
class IdleState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('idle', true);
        // player.anims.stop()
    }

    execute(scene, player) {
        const { left, right, up, down, space, shift } = scene.keys;

        // Transition to swing if pressing space
        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        // Transition to dash if pressing shift
        if (Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
            return;
        }

        // Transition to move if pressing a movement key
        if (left.isDown || right.isDown || up.isDown || down.isDown) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends State {
    execute(scene, player) {
        const { left, right, up, down, space, shift } = scene.keys;

        // Transition to swing if pressing space
        if (Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        // Transition to dash if pressing shift
        if (Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
            return;
        }

        // Transition to idle if not pressing movement keys
        if (!up.isDown && !left.isDown && !down.isDown && !right.isDown) {
            this.stateMachine.transition('idle');
            return;
        }

        // Handle movement
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
            player.setFlipX(true);  // Flip the sprite horizontally
        } else if (right.isDown) {
            moveDirection.x = 1;
            player.direction = 'right';
            player.facing = 'right';
            player.setFlipX(false); // Ensure the sprite is not flipped
        }

        // Normalize movement vector, update player position, and play proper animation
        moveDirection.normalize();
        player.setVelocity(player.playerVelocity * moveDirection.x, player.playerVelocity * moveDirection.y);
        player.anims.play('run', true);
    }
}


class SwingState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('attack');
        player.hitbox.body.enable = true;  // Enable hitbox
        player.updateHitbox();    // Update hitbox position
        // player.hitbox.body.enable = false;  // Enable hitbox
        player.once('animationcomplete', () => {
            player.hitbox.body.enable = false;  // Disable hitbox
            // player.resetHitbox();  // Reset hitbox position
            this.stateMachine.transition('idle');
        });
    }

    // execute(scene, player) {
    //     player.resetHitbox();  // Update hitbox position
    // }
}

class DashState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play('dash');
        player.setTint(0x00AA00);     // Turn green

        // Set dash velocity based on direction
        if (player.flipX) {
            player.setVelocityX(-player.playerVelocity * 3);
        } else {
            player.setVelocityX(player.playerVelocity * 3);
        }

        // Set a short cooldown delay before going back to idle
        scene.time.delayedCall(player.dashCooldown, () => {
            player.clearTint();
            this.stateMachine.transition('idle');
        });
    }
}
    