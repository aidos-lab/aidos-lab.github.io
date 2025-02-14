---
title: Speed up latex
---

Some tips for speeding up latex compile times.

**Only compile what you need.** 
- Normally latex  does the following:
	- Compiles bibliography
	- Compiles figures, 
	- Runs Cross references.
- When editing text you don't need it.
- One run of pdflatex is sufficient. 

**Enable draft mode**
- Does not render graphics such as tikz and images

**Figures and Tikz**
- Figures 
	- Add graphics in pdf instead of png. 
	- Saves latex some time compiling to pdf.
	- Check the DPI settings of the images 
		- Too large is long render time, too low is bad quality.
- Tikz
	- Externalize tikz figures (externalize package)
	- This only rerenders tikz figures when changed.

**Compile preamble**
- Loading the preamble takes a long time for pdflatex
- Compiling before one *significantly* increases the compile time. 

After the preamble add `\csname endofdump\endcsname`
Then compile the preamble once with: 

```shell

# Compile
pdflatex -ini -jobname="main" "&pdflatex" mylatexformat.ltx main.tex

# Run the compiled version takes 1.996 seconds (on my machine ;).
pdflatex "&main" main.tex


# Run with defaults takes 4.591 seconds.
pdflatex main.tex

```



