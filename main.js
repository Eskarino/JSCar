const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');

const points = 7;

const road = new Road(ctx, points, canvas.height, canvas.width);
const car = new Car(ctx, road.starting_x, road.starting_y);
const sensors = new Sensors(ctx, car, road)

loop();

function loop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();
    car.draw();
    sensors.draw();

    car.update();
    sensors.update();
    
    requestAnimationFrame(loop);
}