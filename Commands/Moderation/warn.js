const { MessageEmbed } = require('discord.js');
const Keyv = require('keyv');
const warnings = new Keyv(process.env.wrns);
const { deletionTimeout, reactionError, reactionSuccess, pinEmojiId } = require('../../config.json');
const { getRoleColor } = require('../../Utils/getRoleColor');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  name: 'warn',
  description: `Sends a warning message to a user.`,
  usage: 'warn @`user` `reason`',
  requiredPerms: ['KICK_MEMBERS'],
  async execute(message, args, prefix) {
    const member = message.mentions.members.first();
    const author = message.author.username;
    if (!args[1]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}warn @[user] [reason]`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (!member) {
      let msg = await message.channel.send(`Couldn't find ${args[0]}`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (member.id == message.author.id) {
      let msg = await message.channel.send(`You can't warn youself, smarty pants!`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
      let msg = await message.channel.send('Your roles must be higher than the roles of the person you want to ban!');
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    args.shift();
    const reason = '`' + args.join(' ') + '`';
    let warns = await warnings.get(`warns_${member.id}_${message.guild.id}`);
    if (!warns) warns = 1;
    else warns = warns + 1;

    let color = getRoleColor(message.guild);
    const warnEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle(`${message.client.emojis.cache.get(pinEmojiId).toString()} Warn Information`)
      .addFields(
        { name: `Defendant's name:`, value: `${member.user.tag}` },
        { name: `Issued by:`, value: `${author}` },
        { name: 'Reason:', value: `${reason}` }
      )
      .setTimestamp();
    await sendLog(message.guild, message.channel, warnEmbed);
    await member.user.send(`${author} is warning you in ${message.guild.name} for ${reason}.`);
    await warnings.set(`warns_${member.user.id}_${message.guild.id}`, warns);
    message.react(reactionSuccess);
  }
}