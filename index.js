const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs')
const dotenv=require('dotenv');
dotenv.config();	
let settings = JSON.parse(fs.readFileSync(__dirname+"/settings.json"));	
let prefix = settings['prefix'];	
let cooldown = settings['cooldown']	
const generated = new Set();	


bot.on("ready", () => {	
    console.log(`Logged in as ${bot.user.tag}!`);	
    console.log("prefix is",prefix,"\nCooldown is",cooldown)	
});	

bot.on("message", async message => {	
    prefix = settings['prefix'];	
    cooldown = settings['cooldown']	
    if (message.author.bot) return;	
    var command = message.content	
    .toLowerCase()	
    .slice(prefix.length)	
    .split(" ")[0];	

    if (command === "gen") {	
        if(message.channel.id !== process.env.CHANNEL_TOKEN) return message.channel.send("This command can be runned only in the generate channel")	

        if (generated.has(message.author.id)) {	
            message.channel.send("Wait before generating another account!. - " + message.author);	
        } else {	

            let messageArray = message.content.split(" ");	
            let args = messageArray.slice(1);	
            if (!args[0]) return message.reply("Please, specify the service you want!");	
            let data;	
            try{	
                data = fs.readFileSync(__dirname + "/" + args[0].toLowerCase() + ".json")	

            } catch{	
                return message.reply(args[0].toLowerCase()+' service do not exists')  	
            } 	
            let account = JSON.parse(data)	
                if (account.length <= 0) return message.reply("There isn't any account avaible for that service")	
                const embed = {	
                    title: "Account Generated!",	
                    description: "Check your dm for the account's information!",	
                    color: 8519796,	
                    timestamp: "2019-04-04T14:16:26.398Z",	
                    footer: {	
                        icon_url:	
                            "https://cdn.discordapp.com/avatars/530778425540083723/7a05e4dd16825d47b6cdfb02b92d26a5.png",	
                        text: "Buy discord bots from Skorpion#0471"	
                    },	
                    thumbnail: {	
                        url:	
                            "http://www.compartosanita.it/wp-content/uploads/2019/02/right.png"	
                    },	
                    author: {	
                        name: "Account Generator",	
                        url: "https://discordapp.com",	
                        icon_url: bot.displayAvatarURL	
                    },	
                    fields: []	
                };	

                await message.channel.send({ embed });	
                await generated.add(message.author.id);	
                await message.author.send({embed: {	
                    "title": "Account information",	
                    "color": 1127848,	
                    "fields": [	
                      {	
                        "name": "Username/Email",	
                        "value": account[0].email	
                      },	
                      {	
                        "name": "Password",	
                        "value": account[0].password	
                      }	
                    ]	
                  }	
                })	
                await message.author.send("copy-paste: "+account[0].email+":"+account[0].password)	
                account.splice(0,1)	
                console.log(account)	
                fs.writeFileSync(__dirname + "/" + args[0] + ".json", JSON.stringify(account));	
                setTimeout(() => {	
                    generated.delete(message.author.id);	
                }, cooldown);	
        }	
    }	

    if (command === "check") {	
        let messageArray = message.content.split(" ");	
        let args = messageArray.slice(1);	
        let data;	
        if (!args[0])	
            return message.reply("Please, specify the service you want!");	
        try{	
            data = JSON.parse(fs.readFileSync(__dirname + "/" + args[0] + ".json"))	
            message.channel.send("There are "+data.length+" accounts in "+args[0])	

        } catch {	
            return message.reply('That service do not exists')  	
        } 	
    }	

    if (command === "change"){	
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("Sorry, you can't do it, you are not an admin!");	
        let messageArray = message.content.split(" ");	
        let args = messageArray.slice(1);	
        try{
            if (!args[0]||!args[1]) return message.reply(`please add an argument`);    
            settings[args[0].toLowerCase()] = args[1].toLowerCase()	
            fs.writeFileSync(__dirname+"/settings.json", JSON.stringify(settings));	
            message.reply(args[0]+" changed to "+args[1])	

        } catch (err){	
            message.reply(`An error occured ${err}`);	
        }	
    }	

    if(command === "stock"){	
        let stock = []	

        fs.readdir(__dirname, function (err, files) {	
            if (err) {	
                return console.log('Unable to scan directory: ' + err);	
            } 	

            files.forEach(function (file) {	
                if (!file.includes(".json")) return	
                if (file.includes('package-lock') || file.includes('package.json') || file.includes('settings.json')) return	
                stock.push(file) 	
            });	
            console.log(stock)	
            if(!stock) return message.channel.send("There aren't any services stored");
            stock.forEach((data) => {	
                let acc = fs.readFileSync(__dirname + "/" + data)	
                message.channel.send(data.replace(".json","")+" has "+JSON.parse(acc).length+" accounts\n")	

            })	

        });	
    }	

    if(command === "add") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("Sorry, you can't do it, you are not an admin!");  
        let messageArray = message.content.split(' ');  
        let args = messageArray[1];
        if (!args) return message.reply("Please specify the service!");
        let commander = messageArray.slice(2);
        if (!commander) return message.reply("Please specify what accounts to add!");
        let lists = commander.map(content => {
            account=content.split("\n");
            return account;
        });
        let accounts=lists[0].map(content=> {
            let usr= content.split(':');
            return {
                "email":usr[0],
                "password":usr[1]
            }
        });
        fs.readFile(__dirname + "/" + args.toLowerCase() + ".json",function(err, data) {     
        if(err){    
            let newnewData =  accounts; 
            try {   
                fs.writeFileSync(__dirname + "/" + args.toLowerCase()+".json", JSON.stringify(newnewData))   
                message.reply(`Service Created and ${accounts[1] ? "accounts" : "account" } added!`) 
            } catch {
                message.channel.send('**Error** Cannot create service and add that account/s!');  

            }   
        }   

        else {
            try {
            let data = fs.readFileSync(__dirname+"/"+args.toLowerCase()+".json");
            data=data.toString().replace(/.$/,",");  
                transformer =accounts.map((element) => {
                data=data.replace(/.$/,",");  
                data+=JSON.stringify(element)+"]";
                console.log(element);
            });
                console.log(data);
                data[data.length-1]="]";  
                fs.writeFileSync(__dirname + "/" + args.toLowerCase()+".json", data); 
                message.reply("Account added!") 
            }
                catch (err){   
                message.channel.send(`**Error** Cannot add that account! ${err}`);  
            }    
        }   
    });     
        
}
if(command === "help") {	
    if (!message.member.hasPermission("ADMINISTRATOR")) {	
        message.channel.send({embed: {	
        "title": "Commands",	
        "color": 1127848,	
        "fields": [	
          {	
            "name": prefix+"gen SERVICENAME",	
            "value": "generate an account of that service."	
          },	
          {	
            "name": prefix+"check SERVICENAME",	
            "value": "check how many accounts are in that server."	
          },	
          {	
            "name": prefix+"stock",	
            "value": "check the services and the accounts.."	
          }	
        ]	
      } 	

    })	
} else {	
        message.channel.send({embed: {	
        "title": "Commands",	
        "color": 1127848,	
        "fields": [	
          {	
            "name": prefix+"gen SERVICENAME",	
            "value": "generate an account of that service."	
          },	
          {	
            "name": prefix+"check SERVICENAME",	
            "value": "check how many accounts are in that server."	
          },	
          {	
            "name": prefix+"stock",	
            "value": "check the services and the accounts.."	
          },	
          {	
            "name": prefix+"add SERVICENAME ACCOUNT",	
            "value": "add that account to the service, remember to use the syntax username:password"	
          },	
          {	
            "name": prefix+"change OPTION VALUE",	
            "value": "change prefix or cooldown (option) to a value, for the cooldown remember that the value must be in ms"	
          }	
        ]	
      }	

    })	
}	
}	
})	

bot.login(process.env.BOT_TOKEN);	
