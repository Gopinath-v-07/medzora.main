import os
import glob

directory = 'c:/Users/GOPINATH V/OneDrive/Desktop/medzo2--copy/components'
prefixes = ['bg-', 'text-', 'border-', 'ring-', 'from-', 'to-', 'shadow-']

for path in glob.glob(os.path.join(directory, '**/*.tsx'), recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace 'prefix' + 'blue-' with 'prefix' + 'teal-'
    new_content = content
    for p in prefixes:
        new_content = new_content.replace(f"{p}blue-", f"{p}teal-")
        
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")
