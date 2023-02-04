module.exports = (command, data) => {
    command.setName(data.name).setDescription(data.description);
    if (data.options !== undefined) {
        for (var i = 0; i < data.options.length; i++) {
            const option = data.options[i];
            command[`add${option.type}Option`]((o) => {
                const addition = o
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required ?? false);
                if (
                    option.choices &&
                    (option.type === "String" || option.type === "Number" || option.type === "Integer")
                ) {
                    const choices = [];
                    for (var choice in option.choices) {
                        choices.push({
                            name: choice,
                            value: option.choices[choice],
                        });
                    }
                    o.addChoices(...choices);
                }
                return addition;
            });
        }
    }
    return command;
};
