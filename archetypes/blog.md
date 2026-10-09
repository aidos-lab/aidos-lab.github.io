+++
# Names must match `name` in `data/people/` to be linked automatically.
authors = [""]

# Title in title case, without HTML, e.g., "Geometry-Aware Edge Pooling".
title = "{{ replace .File.ContentBaseName "-" " " | title }}"

# Optional subtitle in sentence case, without HTML; it is shown in italics
# after the title. Remove this line if there is no subtitle.
subtitle = ""

# One sentence of at most ~155 characters, used in search results and link
# previews.
description = ""

date = {{ .Date }}
draft = true
+++
