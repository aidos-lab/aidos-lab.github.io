---
title: Updating featured projects on the homepage
---
As the lab engages in new projects, the website should be updated to reflect these exciting new endeavors.  

This wiki article explains how to update one of the hexagonal icons on the homepage (see [Welcome](/)).

### Step 1: Design a new hexagon overview figure using Figma

You will need access to the AIDOS lab's shared Figma project. (Reach out to a team member if you require access.)

Within the project, there is a page entitled `Project Overview Figure`. Here you will find the template for a new project icon, shown below.

<img src="/wiki/project-template.svg" alt="Project icon template" style="width: 25%; height: auto;">

Duplicate the template, fill in the project name, and add your favorite figure.  

Once you are content with the project icon, select it and use the control panel on the right export it as an SVG file.

<img src="/wiki/exporting-svg.png" alt="Project icon template" style="width: 50%; height: auto;">

For consistency, please name the file `project_title.svg`.

### Step 2: Update the Repo

#### Important! Remember to make a branch and open a pull request! All the following changes should be made on a separate branch.

1. Upload your image (saved as `project_title.svg`) to the repo under the `/static/project-images/` folder.

2. Open `/data/featured_projects.toml` file. This file controls which projects render as part of the overview image.

It will look something like this.
```toml
# Key:
# img = Image path from the static folder (in project-images folder)
# alt = Alt text for the image (name of the project)
# link = Hyperlink for the image (arXiv link)

# Position (e.g. top left)
img1       = "project-images/your-project.svg"
alt1       = "Your Project Title"
link1      = "https://arxiv.org/abs/#########"
```

Edit the `img`, `alt`, and `link` fields in the position where you want your image to appear (e.g. Top left). Please consider replacing the oldest project.

### Step 3: Final Check & PR Submission

After a quick check to make sure the image is rendering properly, you are ready to submit the pull request for Bastian to review.

Nice work!
