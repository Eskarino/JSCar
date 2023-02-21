const canvas = document.getElementById("theCanvas");
canvas.height = 500;
canvas.width = 1000;

const ctx = canvas.getContext('2d');
const car = new Car(100, 100, 10, 25);
car.draw(ctx);

loop();

function loop(){

    car.update();
    
    ctx.clearRect(0,0,canvas.width,canvas.height);

    car.draw(ctx);
    requestAnimationFrame(loop)
}