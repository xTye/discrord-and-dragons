import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { graph } from '../lib/conts';
import { game } from '../game';
import { GameStateType } from '../lib/types';
 
export default {
  
  //HEAD MAKE A COMMAND BUILDER FOR THESE SUBCOMMANDS FOR DYNAMIC CREATED MAPS 

	data: new SlashCommandBuilder()
		.setName(COMMANDS.TRAVEL.NAME)
		.setDescription(COMMANDS.TRAVEL.DESCRIPTION)

    .addSubcommand(subcom => 
      subcom.setName("to")
      .setDescription("Travel to a location")
      .addStringOption(option => 
        option.setName("location")
          .setDescription("location")
            .setChoices(
              { name: graph.dragonsLair.name, value: graph.dragonsLair.id },
              { name: graph.tier1Blue.name, value: graph.tier1Blue.id },
              { name: graph.tier3Blue.name, value: graph.tier3Blue.id },
              { name: graph.tier2Yellow.name, value: graph.tier2Yellow.id },
              { name: graph.tier1Red.name, value: graph.tier1Red.id },
              { name: graph.tier3Red.name, value: graph.tier3Red.id })
            .setRequired(true)
    ))
    .addSubcommand(option => 
      option.setName(COMMANDS.TRAVEL.SUBCOMMANDS.TIME.NAME)
        .setDescription(COMMANDS.TRAVEL.SUBCOMMANDS.TIME.DESCRIPTION))

  , 
  /**
   * Executes on travel command, checks if a player can travel
   * and begins travel if eligable.
   * 
   * @param interaction used for reply
   */
  async execute(interaction: CommandInteraction) {

    if (game.state != GameStateType.SEARCH){
      await interaction.reply("Game not in search phase");
      return;
    }

    const player = game.players.get(interaction.user.id);
    if (!player) await interaction.reply({ content: "You are not a player in the game", ephemeral: true });

    else {
      const subcommand = interaction.toString().split(" ");
      switch (subcommand[1]){
        //HEAD FIX "TO" AFTER BASIC IMPLIMENTATION IS DONE
        case "to":
          if (player.travel.traveling) {
            await interaction.reply("You cannot travel while currently traveling");
            return;
          }
          if (player.activity.active) {
            await interaction.reply("You cannot travel while in an activity");
            return;
          }
          const regex = /(?<=(location:))[^\s]*/g;
          const destination = interaction.toString().match(regex)?.toString();
          if (!destination) { await interaction.reply({ content: "Internal game error! ERROR CODE 1" }); return;}
          await player.beginTravel(destination, interaction);
            break;
        case COMMANDS.TRAVEL.SUBCOMMANDS.TIME.NAME:  
          await player.travelTime(interaction);
            break;
      }
    }
  },
};