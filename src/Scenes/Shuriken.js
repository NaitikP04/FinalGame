class Shuriken extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, damage, piercing, velocity, direction) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(10, 10);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.damage = damage;
        this.piercing = piercing;
        this.setVelocity(velocity.x, velocity.y);
        this.play(texture);

        this.scene.physics.world.on('worldbounds', this.onWorldBounds, this);

        // Add collision checks with all enemy groups
        scene.physics.add.collider(this, scene.bats, this.handleCollision, null, this);
        scene.physics.add.collider(this, scene.ghosts, this.handleCollision, null, this);
        scene.physics.add.collider(this, scene.spiders, this.handleCollision, null, this);
        scene.physics.add.collider(this, scene.assassinBoss, this.handleCollision, null, this);
    }

    onWorldBounds(body) {
        if (body.gameObject === this) {
            this.destroy();
        }
    }

    handleCollision(shuriken, enemy) {
        enemy.takeDamage(shuriken.damage);
        shuriken.piercing -= 1;
        if (shuriken.piercing <= 0) {
            shuriken.destroy();
        } else {
            // Calculate the normalized direction vector
            const direction = new Phaser.Math.Vector2(shuriken.body.velocity.x, shuriken.body.velocity.y).normalize();
            // Reset the velocity to maintain the speed of 300
            shuriken.setVelocity(direction.x * 300, direction.y * 300);
        }
    }

    update() {
        // Additional update logic if needed
    }
}
