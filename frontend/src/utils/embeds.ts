import {
	MessageEmbed,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageInteraction,
	Message,
	InteractionCollector,
	MessageComponentInteraction,
	WebhookEditMessageOptions,
	MessageAttachment,
	SelectMenuInteraction,
} from "discord.js";

export class DefaultEmbed extends MessageEmbed {
	blankFields = 0;

	constructor(title: string = "") {
		super();

		if (title.length !== 0) this.setTitle(title);

		this.setColor("#008080").setFooter({
			text: "© Heⅼіх Sama#0578",
			iconURL: "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256",
		});

		this.blankFields = 0;
	}

	addBlankField(inline = false, value = "\u200b") {
		this.blankFields++;
		this.addField("\u200b".repeat(this.blankFields), value, inline);
		return this;
	}
}

export class ErrorEmbed extends DefaultEmbed {
	constructor(title: string, trueTitle: string = "Error") {
		super();

		this.setTitle(trueTitle);
		this.setDescription(title);
		this.setColor("#db1102");
	}
}

export function awaitSelection(message: Message, filter?: (i: any) => boolean, onSelection?: (i: SelectMenuInteraction) => Promise<void>): Promise<String> {
	const collector = message.createMessageComponentCollector({ filter: filter });

	return new Promise<String>(async res => {
		collector.on("collect", async i => {
			if (!i.isSelectMenu()) return;

			if (onSelection !== undefined) await onSelection(i);

			collector.stop();

			res(i.values[0]);
		});
	});
}

export async function sendMenu(
	interaction: CommandInteraction,
	reply: {
		embeds?: MessageEmbed[];
		components?: any[];
		files?: MessageAttachment[];
		content?: string;
	},
	deferMessage: boolean = true,
	options: {
		customIds: string[];
		idleTime: number;
		preCollect?: () => Promise<void>;
		onCollect: (i: MessageComponentInteraction, message: Message, collector: InteractionCollector<any>) => Promise<void>;
		postCollect?: (reason: String, interaction: MessageInteraction) => Promise<any>;
	}[]
) {
	if (deferMessage) await interaction.deferReply();

	const msg: Message = (await interaction.editReply({
		fetchReply: true,
		embeds: reply.embeds,
		components: reply.components,
		files: reply.files,
		content: reply.content === null ? "" : reply.content,
	} as WebhookEditMessageOptions)) as Message;

	return new Promise<void>(async res => {
		for (const option of options) {
			const filter = (i: MessageComponentInteraction) => option.customIds.includes(i.customId) && i.user.id === interaction.user.id && i.message.id === msg.id;
			const collector = msg.createMessageComponentCollector({ filter: filter, idle: option.idleTime === -1 ? undefined : option.idleTime });

			if (option.preCollect)
				try {
					await option.preCollect();
				} catch (e) {
					return;
				}

			collector.on("collect", async i => {
				collector.resetTimer({ idle: option.idleTime === -1 ? undefined : option.idleTime });
				await option.onCollect(i, msg, collector);
			});

			collector.on("end", async (collected, reason) => {
				if (option.postCollect) await option.postCollect(reason, interaction);
				res();
			});
		}
	});
}

export async function sendNavigationMenu<T>(
	{ navigatable, check, previous = "⬅️", next = "➡️" }: { navigatable: T[]; check: boolean; previous?: string; next?: string },
	interaction: CommandInteraction,
	reply: {
		embeds?: MessageEmbed[];
		components?: any[];
		files?: MessageAttachment[];
		content?: string;
	},
	deferMessage: boolean = true,
	options: {
		idleTime: number;
		preCollect?: () => Promise<void>;
		update: (i: MessageComponentInteraction, message: Message, content: T, pointer: number) => Promise<void>;
	}
): Promise<void> {
	let pointer: number = 0;

	await sendMenu(
		interaction,
		{
			embeds: reply.embeds,
			components: check
				? [
						new MessageActionRow().addComponents(
							new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji(previous),
							new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji(next)
						),
				  ]
				: [],
			files: reply.files,
			content: reply.content,
		},
		deferMessage,
		[
			{
				customIds: ["prev", "next"],
				idleTime: options.idleTime,
				preCollect: options.preCollect,
				onCollect: async (i, m) => {
					if (!i.isButton()) return;

					if (i.customId === "prev") {
						pointer -= 1;
						if (pointer < 0) pointer = navigatable.length - 1;
					} else if (i.customId === "next") {
						pointer += 1;
						if (pointer === navigatable.length) pointer = 0;
					}

					await m.removeAttachments();
					await options.update(i, m, navigatable[pointer], pointer);
				},
				postCollect: async (reason, _) => await interaction.editReply({ components: [] }),
			},
		]
	);
}
