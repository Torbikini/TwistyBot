module.exports = async function(client, message, params) {
	if (params.length != 1)
	{
		throw Error('Usage: !stats <username>\n\nExamples:'
			+ '\n!stats Twisty Fork'
			+ '\n!stats Vegakargdon');
	}

	var stats = await apis.RuneScape.lookup_player(params[0]);
	if (!stats)
		throw Error('Player not found.');

	var output = 'Skill               Rank  Level            XP';
	var table_data = []
	for(var skill of apis.RuneScape.skills)
	{
		var unranked = stats[skill].rank == -1;
		output += util.printf('\n%-12s %11s %6s %13s',
			skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize first letter
			unranked ? '-' : stats[skill].rank,
			unranked ? '-' : stats[skill].level,
			unranked ? 'Unranked' : util.format_number(stats[skill].xp));
	}

	return util.dm.code_block(output);
};
