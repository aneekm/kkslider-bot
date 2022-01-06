import { Client } from "discord.js";

export default (client: Client): void => {
    client.once("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        console.log(`Hey ${client.user.username}. It's real groovy being here today.`);

        // Set bot presence
        client.user.setPresence({ activities: [{ name: 'the-aux', type: "LISTENING" }], status: 'online' });
    });
};