---
title: Adding a new tool
---
This wiki article explains how to add a new tool to the AIDOS toolbox (see [Research](/research).)

### Step 1: Upload an image.

#### Important! Remember to make a branch and open a pull request! All the following changes should be made on a separate branch.

Choose an image that represents your tool. It is ideal if this image is roughly square-shaped.

Save this image as `your-tool-name.svg` (.png or .jpg is also fine). Upload it to the `/static/tools/` folder.

### Step 2: Create a .toml file

In the `/data/tools/` folder, create a new file named `your-tool-name.toml`. The toolbox cards pull from these `.toml` files when they render.  

You can use the following as a template:

```html
name    = "SCOTT"
paper   = "Curvature Filtrations for Graph Generative Model Evaluation"
image   = "scott.jpg"
description     = """\
          SCOTT is a Python package for computing **curvature 
          filtrations** for graphs and graph distributions. 
          Our method introduces a novel way to compare graph 
          distributions by combining discrete curvature on 
          graphs with persistent homology, providing 
          descriptors of graph sets that are: *robust*, 
          *stable*, *expressive*, and *compatible with 
          statistical testing*.
          """
repo    = "https://github.com/aidos-lab/curvature-filtrations"
pub     = "https://doi.org/10.48550/arXiv.2301.12906"
pip     = "pip install curvature-filtrations"
```

#### Data dictionary
Bolded fields appear on the tool cards and thus are mandatory.
- **Name**: he name of your tool (a clever acronym perhaps?) 
- Paper: If applicable, the name of the paper associated with your tool. 
- **Image**: The name of the image file from Step 1. Note that the field automatically points to `/static/tools`.
- **Description**: A short description, often similar to what is in a README. Markdown format. 
- **Repo**: A link to the GitHub repo. The GitHub logo on the tool card will link to this url. 
- **Pub**: A link to a publication, blogpost, or other online presence associated with your tool. The document icon on the tool card will link to this url. 
- Pip: If applicable, an installation command (e.g. `pip install your-tool-name`). 

### Step 3: Add your tool to tools.md

In the `/content/tools.md` file, add:  

```html
< tool "your-tool-name" > within a pair of double curly braces {{}}
```
 
 to the **top** of the list of tools. (We want to preserve ordering from most to least recently developed.)
 
 **Sanity check:** Make sure "your-tool-name" is the same as the name of your `toml` file.  

### Step 3: Final Check & PR Submission

After a quick check to make sure the toolbox is rendering properly with your new addition, you are ready to submit the pull request for Bastian to review.

Nice work!

### Further Development

Keen to change how the tool cards render?

Tool cards are designed in the `/layouts/shortcodes/tool.html` file, with support from the `/layouts/partials/icons.html` file (for the GitHub and Document icons).

These files use classes defined in the main CSS file, found at `/themes/brevis/static/css/style.css`.