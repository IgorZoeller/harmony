#!/usr/bin/env python
import sys
import os

# Take the function parameter as the new command name
command_name = sys.argv[1]

file_name = command_name + ".js"

# Go to the Project scripts folder, this makes sure that the
# command file will be created at the correct directory
os.chdir(os.path.dirname(os.path.realpath(__file__)))
command_folder = "../commands"

path = os.path.join(command_folder, file_name)

command_template = ["const Command = require(\"../structures/Command.js\");\n\n",
                    "module.exports = new Command({\n",
                    "    name: \"{}\",\n".format(command_name),
                    "    description: ,\n",
                    "    run: ,\n",
                    "    status: \n",
                    "})\n"]

# Check if the command already exists to prevent overwriting
if not os.path.exists(path):
    with open(path, "w") as f:
        f.writelines(command_template)
else:
    print("Command \"{}\" already exists.".format(command_name))