const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');

const points = 7;

let road = new Road(ctx, points, canvas.height, canvas.width);

const nb_cars = 100;
let cars = generateCars(nb_cars);
let car_table = create_car_table(nb_cars)
let best_car = cars[0];

road.draw();
let loop_counter = 0;
start()

function start(){
    loop_counter = 0;
    car_init();
    loop();
}

function loop() {
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();

    for(let i = 0; i < cars.length; i++){
        cars[i].draw(best_car);
        cars[i].update();
        calculate_reward(cars[i], car_table)
    }

    best_car  = cars.find(
        c=>car_table[c.id].reward==Math.max(
            ...cars.map(c=>car_table[c.id].reward)
        ));
    
    
    if (car_table[best_car.id].reward > -1 + loop_counter / 1000){
        requestAnimationFrame(loop);
        loop_counter+= 1
    }
}

function generateCars(nb_cars){
    const cars = [];
    for(let i = 0; i < nb_cars; i++){
        cars.push(new Car(ctx, road, i, 'Virtual'))
    }
    return cars
}

function create_car_table(nb_cars){
    let car_table = [];
    for(i = 0; i < nb_cars; i++){
        one_car = {car_id: i, reward: 0, next_gate: 0};
        car_table.push(one_car);        
    }
    return car_table
}

function calculate_reward(car, car_table){
    for(let i = 0; i < car.car_segments.length; i++){
        let next_gate = car_table[car.id].next_gate;
        for (let j = next_gate; j < (next_gate + 2)%road.gates.length; j++){
            if(getIntersection(car.car_segments[i], road.gates[j])){
                car_table[car.id].reward += 1;
                car_table[car.id].next_gate = (j + 1)%road.gates.length;
                return null
            }
        }
    }
    car_table[car.id].reward += car.speed/1000000;
}

function car_init(){
    cars = generateCars(nb_cars);
    car_table = create_car_table(nb_cars)
    best_car = cars[0];
    if (localStorage.getItem('best_car')){
        for (let i=0; i<cars.length; i++){
            cars[i].net = JSON.parse(localStorage.getItem('best_car'));
            if(i!=0){
                GNet.mutate(cars[i].net, 0.15) //(i*3)
            }
        }
    }
}

function save_gnet(){
    localStorage.setItem('best_car', 
        JSON.stringify(best_car.net));
}

function discard_gnet(){
    localStorage.removeItem('best_car');
}