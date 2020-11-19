class Bus {
    constructor(){
        this.channels = {}
    }

    subscribe(channel, callback){
        if (this.channels[channel]){
            this.channels[channel].push(callback)
        }
        else{
            this.channels[channel] = [callback]
        }
    }

    publish(channel, payload){
        if(this.channels[channel]){
            this.channels[channel].forEach(r => r(payload))
        }
    }
}

export default new Bus()
