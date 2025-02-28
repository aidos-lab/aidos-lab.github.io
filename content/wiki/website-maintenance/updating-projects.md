---
title: Updating projects on the homepage figure
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

Upload your image (saved as `project_title.svg`) to the repo under the `/static/project-images/` folder.

In the `/layouts/shortcodes/projects.html` file, you will see the HTML code that controls which project images are shown.

Find the `project-column` div with the project you want to replace. It will look something like so:

```html
<div class="project-column">
    <a href="https://arxiv.org/abs/######">
        <img src="project-images/project-name.svg"
        alt="Project name here">
    </a>
</div>
```

Make sure you:
1. Edit the arXiv link.
2. Change `project-name.svg` to the name of your new uploaded image.
3. Change the alt text to reflect your project title.

### Step 3: Final Check & PR Submission

After a quick check to make sure the image is rendering properly, you are ready to submit the pull request for Bastian to review.

Nice work!
