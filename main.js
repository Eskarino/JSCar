const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');

const points = 7;

const road = new Road(ctx, points, canvas.height, canvas.width);
const cars = generateCars(100);

loop();

function loop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();

    for(let i = 0; i < cars.length; i++){
        
        cars[i].draw();
        cars[i].update();
    }
    
    requestAnimationFrame(loop);
}

function generateCars(nb_cars){
    const cars = [];
    for(let i = 0; i < nb_cars; i++){
        cars.push(new Car(ctx, road, i, 'Virtual'))
    }
    return cars
}