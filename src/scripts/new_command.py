#!/usr/bin/env python
import sys
import os

command_name = sys.argv[1]

file_name = command_name + ".js"

command_folder = "../commands"

command_template = [ "const Command = require(\"../structures/Command.js\");\n\n",
                     "module.exports = new Command({\n",
                    f"    name: \"{command_name}\",\n",
                     "    description: ,\n",
                     "    run: ,\n",
                     "    status: \n",
                     "})\n"]

with open(os.path.join(command_folder, file_name), "a") as f:
    f.writelines(command_template)