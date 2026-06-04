import time
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from textwrap import indent
import sys
import os
import json

if len(sys.argv) < 2:
    print("Usage: python live_updater.py your_module_id")
    sys.exit()

module = sys.argv[1]
path = f"./modules/{module}/"
ha_path = ""

if not module or not os.path.exists(path):
    print(f"Module directory {path} not found.")
    sys.exit()

with open('config.json', 'r') as f:
    data: dict = json.load(f)
    ha_path = data.get('ha-path')

last_trigger_time = time.time()

class MyFileSystemEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global last_trigger_time
        current_time = time.time()
        if event.src_path.find('~') == -1 and (current_time - last_trigger_time) > 1:
            last_trigger_time = current_time
            self.update_module()

    def update_module(self):
        config = ""
        bak = ""
        
        with open(f"{path}module.yaml") as f:
            config += f.read()

        config += \
            "\n" \
            "  code: | \n"
        
        with open(f"{path}style.css") as f:
            config += indent(f.read(), "    ")
        
        config += \
            "\n\n" \
            "    ${(() => { \n"
        
        with open(f"{path}code.js") as f:
            config += indent(f.read(), "      ")

        config += \
            "\n" \
            "    })()} \n" \
            "\n"
        
        with open(f"{path}editor.yaml") as f:
            config += indent(f.read(), "  ")
                    
        config += "\n"

        with open(f"{path}{module}.yaml") as f:
            bak = f.read()

        with open(f"{path}{module}.yaml.bak", "w") as f:
            f.write(bak)

        with open(f"{path}{module}.yaml", "w") as f:
            f.write(config)

        if os.path.exists(f"{ha_path}/{module}.yaml"):
            with open(f"{ha_path}/{module}.yaml", "w") as f:
                f.write(config)      

        print(f"{module} module updated at {time.localtime().tm_hour}:{time.localtime().tm_min}")

event_handler = MyFileSystemEventHandler()
observer = Observer()
observer.schedule(event_handler, path, recursive=False)
observer.start()

try:
    while True:
        time.sleep(1)
finally:
    observer.stop()
    observer.join()
