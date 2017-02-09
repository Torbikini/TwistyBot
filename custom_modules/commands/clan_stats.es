var get_clan_list = custom_require('report/sources/clan_list');

module.exports.help = {
	name: 'clan_stats',
	text: 'Search clan stats.',
	category: 'Deities'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !clan_stats`
};
module.exports.permissions = [];

module.exports.command = async function(client, message, params) {
	var clan_list = await load_report_data();
	var under_1500_total = [];
	var under_70_agil = [];
	var under_80_range = [];
	var under_80_magic = [];
	var under_85_range = [];
	var under_85_magic = [];
	for(var i in clan_list)
	{
		var member = clan_list[i];
		if (member.history.length == 0)
			continue;

		var hs = member.history[0].hiscores;
		if (hs.overall.level < 1500) under_1500_total.push(member);
		if (hs.agility.level < 70) under_70_agil.push(member);
		if (hs.ranged.level < 80) under_80_range.push(member);
		if (hs.magic.level < 80) under_80_magic.push(member);
		if (hs.ranged.level >= 80 && hs.ranged.level < 85) under_85_range.push(member);
		if (hs.magic.level >= 80 && hs.magic.level < 85) under_85_magic.push(member);
	}

	message.channel.sendmsg('Under 1500 total:' + Discord.code_block(
		under_1500_total.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.overall.level)
		).join('\n')
	));

	message.channel.sendmsg('Under 70 agility:' + Discord.code_block(
		under_70_agil.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.agility.level)
		).join('\n')
	));

	message.channel.sendmsg('Under 80 range:' + Discord.code_block(
		under_80_range.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.ranged.level)
		).join('\n')
	));

	message.channel.sendmsg('Under 80 magic:' + Discord.code_block(
		under_80_magic.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.magic.level)
		).join('\n')
	));

	message.channel.sendmsg('Under 85 ranged:' + Discord.code_block(
		under_85_range.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.ranged.level)
		).join('\n')
	));

	message.channel.sendmsg('Under 85 magic:' + Discord.code_block(
		under_85_magic.map(m =>
			util.printf('%12s   %4s', m.name, m.history[0].hiscores.magic.level)
		).join('\n')
	));

	message.channel.sendmsg('Unique:' + Discord.code_block(
		under_1500_total.concat(under_70_agil, under_80_range, under_80_magic, under_85_range, under_85_magic)
			.filter(onlyUnique).map(m => m.name).join('\n')
		));
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

async function load_report_data()
{
	var report = await util.load_json_file(global.server_directory + '/storage/latest_report.json', []);
	var earliest = Date.now() - 33 * 24 * 60 * 60 * 1000;
	var hiscores_history = await database.query(
		`SELECT timestamp, hiscores, name
			FROM hiscores_history
			JOIN players
			ON hiscores_history.player_id = players.id
			WHERE timestamp > ?;`, earliest);
	//var players = await database.query('SELECT * FROM players');
	for(var i = 0; i < report.clan_list.length; i++)
	{
		var member = report.clan_list[i];

		// Extract history entries for this player, sorted from newest to oldest
		member.history = hiscores_history
			.filter(row => row.name.toLowerCase() == member.name.toLowerCase())
			.map(row => ({ timestamp: row.timestamp, hiscores: JSON.parse(row.hiscores) }))
			.sort( (a,b) => b.timestamp - a.timestamp );
	}
	return report.clan_list;
}
