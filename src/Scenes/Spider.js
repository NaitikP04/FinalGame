class Spider extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'spider'); // Use 'spider' texture
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        this.hp = 40; // Adjust as needed

        this.chaseSpeed = 60; // Speed of the spider when chasing the player
        this.chargeSpeed = 250; // Speed of the spider when charging at the player
        this.chaseRange = 300; // Range at which the spider will chase the player
        this.chargeRange = 100; // Range at which the spider will charge at the player

        this.returnPosition = { x, y }; // Store the starting position
        this.isCharging = false;

        // Initialize state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new SpiderIdleState(),
            chase: new SpiderChaseState(),
            charge: new SpiderChargeState(),
            return: new SpiderReturnState(),
        }, [scene, this]);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.scene.sound.play('hitMarker');
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    update(time, delta) {
        // Update logic handled in SampleScene update method
    }
}

// State Classes for Spider
class SpiderIdleState extends State {
    enter(scene, spider) {
        spider.setVelocity(0);
    }

    execute(scene, spider) {
        const player = scene.player;
        const distance = Phaser.Math.Distance.Between(spider.x, spider.y, player.x, player.y);

        if (distance < spider.chaseRange) {
            this.stateMachine.transition('chase');
        }
    }
}

class SpiderChaseState extends State {
    enter(scene, spider) {
        spider.isCharging = false;
    }

    execute(scene, spider) {
        const player = scene.player;
        const distance = Phaser.Math.Distance.Between(spider.x, spider.y, player.x, player.y);

        scene.physics.moveToObject(spider, player, spider.chaseSpeed);

        if (player.x < spider.x) {
            spider.setFlipX(true);  // Facing left
        } else {
            spider.setFlipX(false); // Facing right
        }

        if (distance < spider.chargeRange && !spider.isCharging) {
            spider.returnPosition = { x: spider.x, y: spider.y }; // Update the return position
            this.stateMachine.transition('charge');
        } else if (distance > spider.chaseRange) {
            this.stateMachine.transition('idle');
        }
    }
}

class SpiderChargeState extends State {
    enter(scene, spider) {
        const player = scene.player;
        spider.isCharging = true;
        scene.physics.moveToObject(spider, player, spider.chargeSpeed);
    }

    execute(scene, spider) {
        const player = scene.player;
        const distance = Phaser.Math.Distance.Between(spider.x, spider.y, player.x, player.y);

        if (distance < 5) { // Check if spider is close enough to the player to deal damage
            player.takeDamage(10); // Adjust damage as needed
            this.stateMachine.transition('return');
        }
        else if (distance > spider.chargeRange) {
            this.stateMachine.transition('chase');
        }
    }
}

class SpiderReturnState extends State {
    enter(scene, spider) {
        // Move to the starting position using opposite velocity
        scene.physics.moveTo(spider, spider.returnPosition.x, spider.returnPosition.y, spider.chargeSpeed * 0.6);
    }

    execute(scene, spider) {
        const distance = Phaser.Math.Distance.Between(spider.x, spider.y, spider.returnPosition.x, spider.returnPosition.y);

        if (distance < 10) { // Check if spider has returned to its starting position
            spider.setVelocity(0);
            const player = spider.scene.player;
            const playerDistance = Phaser.Math.Distance.Between(spider.x, spider.y, player.x, player.y);

            if (playerDistance < spider.chargeRange) {
                this.stateMachine.transition('charge');
            } else if (playerDistance < spider.chaseRange) {
                this.stateMachine.transition('chase');
            } else {
                this.stateMachine.transition('idle');
            }
        }
    }
}
