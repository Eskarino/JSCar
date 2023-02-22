const canvas = document.getElementById("theCanvas");
canvas.height = 500;
canvas.width = 1000;
const ctx = canvas.getContext('2d');

const points = 7;

const road = new Road(ctx, points, canvas.height, canvas.width);
const car = new Car(ctx, road.starting_x, road.starting_y);

loop();

function loop() {

    car.update();
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();
    car.draw();
    requestAnimationFrame(loop);
}