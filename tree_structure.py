import os

def print_directory_tree(root_dir, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = []
    
    result = []
    
    def _generate_tree(directory, prefix=""):
        # Get all items in the current directory
        items = sorted(os.listdir(directory))
        
        # Process each item
        for i, item in enumerate(items):
            path = os.path.join(directory, item)
            
            # Skip excluded directories
            if os.path.isdir(path) and any(excluded in path for excluded in exclude_dirs):
                continue
            
            # Determine if this is the last item at this level
            is_last = i == len(items) - 1
            
            # Add appropriate branch symbol
            branch = "└── " if is_last else "├── "
            
            # Add this item to the result
            result.append(f"{prefix}{branch}{item}")
            
            # If it's a directory, process its contents
            if os.path.isdir(path):
                # Adjust prefix for the next level
                next_prefix = prefix + ("    " if is_last else "│   ")
                _generate_tree(path, next_prefix)
    
    # Start the recursive generation from the root directory
    result.append(os.path.basename(root_dir))
    _generate_tree(root_dir, "")
    
    return result

# Set the root directory and exclusion patterns
root_dir = r"d:\python-workspace\road"
exclude_dirs = ["node_modules", "__pycache__", ".venv", ".qodo", ".git", ".vscode", "venv", ".conda", ".idea", "refs", "objects"]

# Generate and print the tree
tree = print_directory_tree(root_dir, exclude_dirs)
for line in tree:
    print(line)
