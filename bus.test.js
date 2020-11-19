import bus from './bus'

test('subscribes to a channel', () => {
    const callback = () => {} 
    bus.subscribe("CHANNEL", callback)
    expect(bus.channels["CHANNEL"]).toStrictEqual([callback])
});

test('publishes a message to a channel', () => {
    bus.subscribe("CHANNEL", (payload) => expect(payload).toBe("PAYLOAD"))
    bus.publish("CHANNEL", "PAYLOAD")
});

