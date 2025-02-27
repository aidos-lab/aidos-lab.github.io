---
title: Adding wiki entries
---
### Adding new sections

To add a new section of wiki entries, add a new folder <topic name> to content/wiki/. Then add a file to the folder
with the name _index.md and add the lines:
```
---
title: <Topic name>
---
```
to the top of the file. This will create a new section in the wiki with the title <Topic name>.

### Adding a new entry

To add a wiki entry, drop a markdown file into content/wiki/<topic-name>. Add the lines 
```
---
title: <Content title>
---
```
To the top of the file. Now you can fill the markdown file with content.

### Using figures

If you are referencing figures in your markdown file, add a folder <content-title> to static/wiki/.
Then, add your figures to the folder static/wiki/<content-title> that you just created.
You can then reference these figures in your markdown file with the following command:

```HTML
<img src="/wiki/<content-title>/<figure-x>"
alt="<figure x> not displayed correctly"
style="width: 100%; height: auto;">
```

### Adding external links

Add a file <external-link-name>.md to content/wiki/external-guides/ with the following content:
```
---
title: <Content title>
external_url: "<url>"
---
```
.