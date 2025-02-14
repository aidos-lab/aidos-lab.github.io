---
title: Computing-Infrastructure:-Tips-and-Tricks
---
(**Draft**)

## Virtual Environments

Whether you are working _locally_ or on a server, it is a good idea to use virtual environments
for your Python projects.

### Rationale

My personal suggestion for using the cluster involves setting up `Miniconda` with a basic
environment, which you can use to maintain compilers and support libraries. Nested within
this environment, we use [`poetry`](https://python-poetry.org/), a great way for managing
and maintaining virtual environments with Python.

#### Advantages

- In many projects, this setup provides a 'fire-and-forget' type solution that you may use
  in other cluster environments as well.
- Dependencies between packages are respected and reproducible builds may be produced.
- `poetry` makes _publishing_ a proper Python package almost trivial.

#### Drawbacks

The integration with `pytorch` and other GPU-based packages is not optimal. However, the
environment set up by `poetry` is a fully-fledged virtual environment. We can always use
`pip` to install specific GPU-based packages here. While this is as little more complex,
we still benefit from having different virtual environments for each project, which will
prevent interference.

#### Alternatives

You can also set up and maintain virtual environments yourself, installing all packages
via `pip`. In more recent versions of `pip`, the `pyproject.toml` used by `poetry` will
be parsed as well.

### Setting up `Miniconda`

```bash
$ wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
# Use a local temporary directory to ensure that this can be installed in
# all cases. This is probably not necessary in your case.
$ mkdir tmp
$ TMPDIR=$HOME/tmp bash Miniconda3-latest-Linux-x86_64.sh
$ bash Miniconda3-latest-Linux-x86_64.sh
# Follow the installer afterwards. My personal recommendation is to
# install Miniconda in $HOME/.miniconda since it will then not show
# up all the time when you issue an ls command.
#
# After the installation, log out and in again. Start bash if it is
# not already your default shell.
$ conda install -c conda-forge poetry
```