const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');
const road_width = 100

const DOM_selected_car = document.getElementById("selectedCar");
const DOM_best_car_counter = document.getElementById("bestCar");
const DOM_selected_car_counter = document.getElementById("selectedCar");
const stop_training_button = document.getElementById("selectedCar");
let animation_ongoing = false;

let road = new Road(ctx, canvas.height, canvas.width);

let nb_cars = 50;
let cars = generateCars(nb_cars);
let car_table = create_car_table(nb_cars);

let stop_training = false;
let reward_limit = 1500;


discard_gnet()

let best_car = null;
let selected_car = null;

check_clicked_car()

let loop_counter = 0;

function start(){
    if (animation_ongoing){
        animation_ongoing = !animation_ongoing;
    } else {
        DOM_selected_car_counter.innerText = 'Selected: | Reward: '
        selected_car = null;
        DOM_selected_car.value = '';
        loop_counter = 0;
        car_init();
        animation_ongoing = true;
        loop();
    }
}

function loop() {
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();

    for(let i = 0; i < cars.length; i++){
        let car_to_draw = best_car;
        if(selected_car) {car_to_draw=selected_car;}
        cars[i].draw(car_to_draw);
        if (!cars[i].damaged){
            cars[i].update();
            calculate_reward(cars[i], car_table)   
        }

        best_car  = cars.find(
            c=>car_table[c.id].reward==Math.max(
                ...cars.map(c=>car_table[c.id].reward)
        ));

    DOM_best_car_counter.innerText = 'Best car: ' + String(best_car.id) + ' | Reward: ' + String(~~car_table[best_car.id].reward)
    if (selected_car){
        DOM_selected_car_counter.innerText = 'Selected: ' + String(selected_car.id) + ' | Reward: ' + String(~~car_table[selected_car.id].reward)
    }
    loop_counter+= 1
    }

    if (animation_ongoing){
        requestAnimationFrame(loop);
    }
}

function startXtimes(){
    animation_ongoing = false;
    stop_training = false;

    let best_reward = 0;
    let last_reward = 0;
    for (let i=0; i<100; i++){
        best_car_from_race = one_race();
        if (best_car_from_race.reward>best_reward){
            best_car = best_car_from_race.race_best_car;

            best_reward = best_car_from_race.reward;
            if (best_reward > reward_limit){
                break;
            }
        }
        console.log('Iteration ' + String(i) + ' || Best reward: ' + String(~~best_reward))
        if (i%10==0 && i!=0){
            save_gnet();
        }

        if (best_reward < 100 && best_reward - last_reward < 1 && i%20==0){
            discard_gnet();
            if(best_reward<100){
                best_car = null;
                best_reward = 0;
                last_reward = 0;
            }
        } else if (i%20==0){
            last_reward = best_reward;
        }
    }
    save_gnet()
    start()
}

function one_race(){
    car_table = create_car_table(nb_cars);
    loop_counter = 0;
    car_init();
    let finished = false;
    let race_best_car = cars[0];
    while(!finished){
        for(let i = 0; i < cars.length; i++){
            if (!cars[i].damaged){
                cars[i].update();
                calculate_reward(cars[i], car_table);
            }
        }
        if (car_table[race_best_car.id].reward > reward_limit || loop_counter > 1000 + 10*car_table[race_best_car.id].reward || loop_counter > 10000){
            finished = true;
        }
        loop_counter++;
    }

    race_best_car  = cars.find(
        c=>car_table[c.id].reward==Math.max(
            ...cars.map(c=>car_table[c.id].reward)
            ));
    return {race_best_car: race_best_car, reward: car_table[race_best_car.id].reward};
}

function generateCars(nb_cars){
    let cars = [];
    for(let i = 0; i < nb_cars; i++){
        cars.push(new Car(ctx, road, i, 'Virtual'))
        cars[cars.length-1].draw(cars[cars.length-1])
    }
    return cars
}

function create_car_table(nb_cars){
    let car_table = [];
    for(i = 0; i < nb_cars; i++){
        one_car = {car_id: i, reward: 0, next_gate: 4};
        car_table.push(one_car);        
    }
    return car_table
}

function calculate_reward(car, car_table){
    for(let i = 0; i < car.car_segments.length; i++){
        let next_gate = car_table[car.id].next_gate;
        for (let j = next_gate; j < (next_gate + 2); j++){

            if(getIntersection(car.car_segments[i], road.gates[j%road.gates.length])){
                car_table[car.id].reward += 1;
                car_table[car.id].next_gate = (j + 1)%road.gates.length;
                return null
            }
        }
        car_table[car.id].reward += car.speed / 1000;
    }
}

function car_init(){
    cars = generateCars(nb_cars);
    if(!best_car){
        best_car = cars[0]
    }

    car_table = create_car_table(nb_cars)
    let mutation_rate = document.getElementById("mutationRate").value/100;
    let mutation_prob = document.getElementById("mutationProb").value/100;
    if (localStorage.getItem('best_car')){
        for (let i=0; i<cars.length; i++){
            cars[i].net = JSON.parse(localStorage.getItem('best_car'));
            if(i!=0){
                GNet.mutate(cars[i].net, mutation_rate, mutation_prob)
            }
        }
    }
}

function save_gnet(){
    if(selected_car){
        localStorage.setItem('best_car', 
            JSON.stringify(selected_car.net));
        } else {
            localStorage.setItem('best_car', 
                JSON.stringify(best_car.net));
    }
    console.log('Saved')
}

function discard_gnet(){
    localStorage.removeItem('best_car');
    DOM_best_car_counter.innerText = 'Best car: | Reward: '
    console.log('Discarded')
}

function reset_map(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road = new Road(ctx, canvas.height, canvas.width);
    road.draw();
    cars = []
}

function pause_resume(){
    paused = !paused;
    loop()
}

function check_clicked_car(){
    let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
    let canvasTop = canvas.offsetTop + canvas.clientTop;
    let canvasClientHeight = canvas.clientHeight;
    let canvasClientWidth = canvas.clientWidth;

    canvas.addEventListener('click', function(event) {
        let x = (event.pageX -canvasLeft)*(canvas.height/canvasClientHeight);
        let y = (event.pageY -canvasTop)*(canvas.width/canvasClientWidth);
        let radius = 20;

        closest_distance = radius;
        cars.forEach(function(car) {
            if (y > car.y - radius && y < car.y + radius 
                && x > car.x - radius && x < car.x + radius) {
                
                let dist = Math.hypot((x - car.x), (y - car.y))
                if (dist < closest_distance){
                    closest_distance = dist;
                    selected_car = car;
                }    
            }
        });
    }, false);
}