
class DungeonMap extends Phaser.Scene {
    constructor() {
        super("dungeonMap");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("dungeonTileset", "tilemap_packed.png");
    }

    create() {
        const MAP_SIZE = 62; // Size of the map in tiles
        const GRID_SIZE = 3; // Number of rooms along each axis
        this.TILE_FLOOR = 48;
        this.TILE_FLOOR_ALT = 49;
        this.TILE_WALL = 40;

        const rndlvl = this.create2DArray(MAP_SIZE);
        this.initializeMap(rndlvl, MAP_SIZE, GRID_SIZE);

        document.getElementById('description').innerHTML = '<h2>Welcome to CityMap</h2>';

        const map = this.make.tilemap({
            data: rndlvl,
            tileWidth: 16,
            tileHeight: 16
        });

        const tilesheet = map.addTilesetImage("dungeonTileset");
        const layer = map.createLayer(0, tilesheet, 0, 0);
    }

    create2DArray(size) {
        let array = new Array(size);
        for (let i = 0; i < size; i++) {
            array[i] = new Array(size).fill(null);
        }
        return array;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    initializeMap(array, mapSize, gridSize) {
        const cellSize = Math.floor(mapSize / gridSize);

        let rooms = [];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                let room = this.createRoom(x * cellSize, y * cellSize, cellSize, mapSize);
                rooms.push(room);
                this.placeRoom(array, room, mapSize);

                this.placeDoor(array, room);
            }
        }
    }

    createRoom(cellX, cellY, cellSize, mapSize) {
        let roomWidth = this.getRandomInt(Math.floor(cellSize * 0.4), Math.floor(cellSize * 0.9));
        let roomHeight = this.getRandomInt(Math.floor(cellSize * 0.4), Math.floor(cellSize * 0.9));
        let roomX = this.getRandomInt(cellX + 1, cellX + cellSize - roomWidth - 2);
        let roomY = this.getRandomInt(cellY + 1, cellY + cellSize - roomHeight - 2);

        // Ensure the room fits within the map boundaries
        roomX = Math.min(roomX, mapSize - roomWidth - 1);
        roomY = Math.min(roomY, mapSize - roomHeight - 1);

        return { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
    }

    placeRoom(array, room, mapSize) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x >= 0 && x < mapSize && y >= 0 && y < mapSize) {
                    array[y][x] = this.getRandomInt(0, 1) === 0 ? this.TILE_FLOOR : this.TILE_FLOOR_ALT;
                }
            }
        }

        for (let y = room.y - 1; y <= room.y + room.height; y++) {
            for (let x = room.x - 1; x <= room.x + room.width; x++) {
                if (x >= 0 && x < mapSize && y >= 0 && y < mapSize) {
                    if (y === room.y - 1 || y === room.y + room.height || x === room.x - 1 || x === room.x + room.width) {
                        array[y][x] = this.TILE_WALL;
                    }
                }
            }
        }
    }

    placeDoor(array, room) {
        // Randomly decide whether to create one door or two doors
        let doorCount = this.getRandomInt(1, 2);
    
        // Create an array to store the door positions for each door
        let doorPositions = [];
        let doorCoordinates = []; // Store door coordinates
    
        // Generate unique random door positions
        while (doorPositions.length < doorCount) {
            let doorPosition = this.getRandomInt(0, 3);
            if (!doorPositions.includes(doorPosition)) {
                doorPositions.push(doorPosition);
            }
        }
    
        // Array to keep track of which sides already have doors
        let doorsPlaced = [false, false, false, false];
    
        // Place doors based on the generated positions
        for (let i = 0; i < doorPositions.length; i++) {
            let doorPosition = doorPositions[i];
            let doorX = 0;
            let doorY = 0;
    
            switch (doorPosition) {
                case 0: //top
                    if (!doorsPlaced[0] && !this.doorExistsOnSide(array, room, "top")) {
                        doorX = this.getRandomInt(room.x + 1, room.x + room.width - 2);
                        doorY = room.y - 1;
                        doorsPlaced[0] = true;
                    }
                    break;
                case 1: //right
                    if (!doorsPlaced[1] && !this.doorExistsOnSide(array, room, "right")) {
                        doorX = room.x + room.width;
                        doorY = this.getRandomInt(room.y + 1, room.y + room.height - 2);
                        doorsPlaced[1] = true;
                    }
                    break;
                case 2: //bottom
                    if (!doorsPlaced[2] && !this.doorExistsOnSide(array, room, "bottom")) {
                        doorX = this.getRandomInt(room.x + 1, room.x + room.width - 2);
                        doorY = room.y + room.height;
                        doorsPlaced[2] = true;
                    }
                    break;
                case 3: //left
                    if (!doorsPlaced[3] && !this.doorExistsOnSide(array, room, "left")) {
                        doorX = room.x - 1;
                        doorY = this.getRandomInt(room.y + 1, room.y + room.height - 2);
                        doorsPlaced[3] = true;
                    }
                    break;
            }
    
            if (doorX !== 0 && doorY !== 0) {
                // Store door position along with coordinates
                doorCoordinates.push({ x: doorX, y: doorY, position: doorPosition });
                array[doorY][doorX] = this.TILE_FLOOR;
                // this.createCorridor(array, doorX, doorY);
            }
        }
    
        // If no doors were placed, add a door on a random side
        if (doorCoordinates.length === 0) {
            let doorPosition = this.getRandomInt(0, 3);
            let doorX = 0;
            let doorY = 0;
    
            switch (doorPosition) {
                case 0: //top
                    doorX = this.getRandomInt(room.x + 1, room.x + room.width - 2);
                    doorY = room.y - 1;
                    break;
                case 1: //right
                    doorX = room.x + room.width;
                    doorY = this.getRandomInt(room.y + 1, room.y + room.height - 2);
                    break;
                case 2: //bottom
                    doorX = this.getRandomInt(room.x + 1, room.x + room.width - 2);
                    doorY = room.y + room.height;
                    break;
                case 3: //left
                    doorX = room.x - 1;
                    doorY = this.getRandomInt(room.y + 1, room.y + room.height - 2);
                    break;
            }
    
            // Store door position along with coordinates
            doorCoordinates.push({ x: doorX, y: doorY, position: doorPosition });
            array[doorY][doorX] = this.TILE_FLOOR;
        }
        this.createCorridors(array, doorCoordinates);
    }

    createCorridors(array, doorCoordinates) {
        // Loop through all the doors
        for (let i = 0; i < doorCoordinates.length; i++) {
            let door = doorCoordinates[i];
            let x = door.x;
            let y = door.y;
            let position = door.position;

            console.log(door);
    
            // Create a corridor based on the door's position
            switch (position) {
                case 0: // top
                    while (y > 0 && (array[y - 1] && array[y - 1][x] !== this.TILE_WALL) && array[y - 1][x] !== this.TILE_FLOOR) {
                        y--;
                        array[y][x] = this.TILE_FLOOR;
                    }
                    break;
                case 1: // right
                    while (x < array[0].length - 1 && (array[y] && array[y][x + 1] !== this.TILE_WALL) && array[y][x + 1] !== this.TILE_FLOOR) {
                        x++;
                        array[y][x] = this.TILE_FLOOR;
                    }
                    break;
                case 2: // bottom
                    while (y < array.length - 1 && (array[y + 1] && array[y + 1][x] !== this.TILE_WALL) && array[y + 1][x] !== this.TILE_FLOOR) {
                        y++;
                        array[y][x] = this.TILE_FLOOR;
                    }
                    break;
                case 3: // left
                    while (x > 0 && (array[y] && array[y][x - 1] !== this.TILE_WALL) && array[y][x - 1] !== this.TILE_FLOOR) {
                        x--;
                        array[y][x] = this.TILE_FLOOR;
                    }
                    break;
            }
        }
    }
    
    doorExistsOnSide(array, room, side) {
        let doorExists = false;
    
        switch (side) {
            case "top":
                doorExists = array[room.y - 1][room.x + Math.floor(room.width / 2)] === this.TILE_FLOOR;
                break;
            case "right":
                doorExists = array[room.y + Math.floor(room.height / 2)][room.x + room.width] === this.TILE_FLOOR;
                break;
            case "bottom":
                doorExists = array[room.y + room.height][room.x + Math.floor(room.width / 2)] === this.TILE_FLOOR;
                break;
            case "left":
                doorExists = array[room.y + Math.floor(room.height / 2)][room.x - 1] === this.TILE_FLOOR;
                break;
        }
    
        return doorExists;
    }
    
    update() {
        // Your update logic here
    }
}




