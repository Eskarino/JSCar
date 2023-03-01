class Controls{
    constructor(agent_type){
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        if(agent_type=='Virtual'){
            null;
        }else{
            this.#detectkey();
        }
    }

    #detectkey(){
        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowDown":
                    this.backward = true;
                    break;
            }
        }
        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowDown":
                    this.backward = false;
                    break;
            }
        }
    }
}