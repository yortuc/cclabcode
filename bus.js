class Bus {
    constructor(){
        this.channels = {}
    }

    subscribe(channel, callback){
        if (this.channels[channel]){
            this.channels[channel].append(callback)
        }
        else{
            this.channels[channel] = [callback]
        }
    }

    publish(channel, payload){
        this.channels[channel].foreach(r => r(payload))
    }
}

export default new Bus()
