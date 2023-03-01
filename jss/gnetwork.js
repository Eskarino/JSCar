class GNet{
    constructor(neuronCount){
        this.layers=[];
        for(let i = 0; i<neuronCount.length-1; i++){
            this.layers.push(new Layer(
                neuronCount[i], neuronCount[i+1]
            ));
        }
    }

    static forward(inputGiven, network){
        let outputs = Layer.forward(
            inputGiven, network.layers[0]);
        for (let i= 1; i<network.layers.length; i++){
            outputs= Layer.forward(
                outputs, network.layers[i]);
        }
        return outputs;
    }

    static mutate(network, percentage = 0, mutation_prob = 1){
        network.layers.forEach(layer => {
            for(let i=0; i<layer.biases.length; i++){
                if (Math.random()<mutation_prob){
                    layer.biases[i]=lerp(
                        layer.biases[i],
                        Math.random()*2-1,
                        percentage
                    )
                }
            }
            for(let i=0; i<layer.weights.length; i++){
                for(let j=0; j<layer.weights[i]; j++){
                    if (Math.random()<mutation_prob){
                        layer.weights[i][j]=lerp(
                            layer.weights[i][j],
                            Math.random()*2-1,
                            percentage
                        )
                    }
                }
            }   
        });
    }
}

class Layer{
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];

        for(let i = 0; i<inputCount; i++){
            this.weights[i]=new Array(outputCount);
        }
        Layer.#randomize(this);
    }

    static #randomize(layer){
        for(let i=0; i < layer.inputs.length; i++){
            for(let j=0; j < layer.outputs.length; j++){
                layer.weights[i][j] = Math.random()*2-1;
            }
        }

        for(let i=0; i<layer.biases.length; i++){
            layer.biases[i] = Math.random()*2-1;
        }
    }

    static forward(inputsGiven, layer){
        for(let i=0; i<layer.inputs.length; i++){
            layer.inputs[i]=inputsGiven[i];
        }

        for(let i=0; i<layer.outputs.length; i++){
            let sum=0;
            for(let j=0; j < layer.inputs.length; j++){
                sum += layer.inputs[j]*layer.weights[j][i];
            }

            if(sum > layer.biases[i]){
                layer.outputs[i]=1;
            } else {
                layer.outputs[i]=0;
            }
        }
        return layer.outputs;
    }
}