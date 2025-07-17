+++
draft = true
authors = ["Emily Simons"]
title = "Standard graph-learning benchmarks earn poor marks: <span style='font-weight: lighter; font-style: italic'>New dataset-evaluation framework raises concerns about how the field measures progress</span>"
date = 2025-07-17
+++

While the field of graph-learning has not yet come of age (by Hobbit standards), the forthcoming story will be reminiscent of Bilbo Baggins’ eleventy-first birthday bash: There will be some goodbyes, the bestowal of powerful rings (yes, rings *plural*), and the beginnings of a noble pursuit — aided by some (mathematical) wizardry. Buckle up.

{{< centered-figure 
    src="happy-birthday.png" 
    alt="Bilbo Baggins Birthday Banner" 
    width="100%" 
>}}

As most good stories do, we begin with a crisis. Sound the graph-learning community alarms: **It’s time for a recall on our benchmarks.**

At first glance, the field of graph learning appears to be progressing rapidly, with a constant influx of new graph neural network (GNN) models promising ever-increasing performance. Claims of increased performance, in this case, are often based on results from a dozen or so commonly-used graph classification datasets. Chances are that you have encountered some or all of these benchmarks in the wild: AIDS, COLLAB, DD, Enzymes, Gollum, IMDB-B, IMDB-M, MUTAG, MolHIV, NCI1, Peptides, Proteins, Reddit-B, Reddit-M.[^gollum]

However, new evidence shows that not all of these datasets qualify as good benchmarks.  That is, our new models might be guided by datasets that are **fundamentally flawed as evaluators of GNN performance.**

Now, this all sounds like quite a lot of doom and gloom. Fear not! To address the issues plaguing our benchmarks, we now have a new tool to help **diagnose** and **triage** graph datasets.

Follow along on a mathematical journey to where the grass is greener - a ~SHIRE~ HIGHER standard and principled evaluation schema for our benchmark datasets. This is the **reward of the RINGS** framework.

{{< centered-figure 
    src="grass-is-greener.png" 
    alt="Frodo and Gandalf En Route" 
    width="100%" 
>}}

## What is *RINGS*? And why do we care?

**R**elevant **I**nformation in **N**ode Features and **G**raph **S**tructure (RINGS) is a data-ablation framework designed to assess the quality of graph datasets. It does so by systematically perturbing the information in the two modes of an attributed graph – the node features and graph structure. Put simply, benchmarks assess GNN performance; RINGS assesses benchmarks.

RINGS was forged as part of the recent paper [No Metric To Rule Them All: Towards Principled Evaluations of Graph-Learning Datasets](https://arxiv.org/abs/2502.02379) – and yes, it is a Lord of the Rings reference.

Perhaps more importantly, RINGS is also a response to growing concerns in the graph-learning community about the datasets used to guide model development. Recent work has highlighted that popular graph-learning benchmarks represent a niche subset of the space of all possible graphs [(Palowitch et al., 2022)](https://doi.org/10.48550/arXiv.2203.00112), and that GNNs overfit graph structure even with it is uninformative and irrelevant to the given task [(Bechler-Speicher et al., 2024)](https://doi.org/10.48550/arXiv.2309.04332). It has also showcased instances where graph-learning methods are outperformed by those ignoring graph structure altogether [(Errica et al., 2020)](https://doi.org/10.48550/arXiv.1912.09893). These are troubling results – all the more so since they suggest a dataset environment that might not be conducive to developing and evaluating GNN models.

RINGS – purpose-built from first principles – begins by establishing what an ideal dataset *is*. Namely, we assert that a good graph dataset should satisfy the following properties:
1. The graph structure and the node features both contain task-relevant information.	 
2. The graph structure and the node features contain complementary information. 
We introduce two novel metrics to capture these desiderata: *performance separability* and *mode complementarity*, respectively.

Before we dive into them, however, we must first cover the core machinery underlying RINGS: our mode-perturbation framework.

## Mode Perturbations: The source of the RINGS’ power

Perturbations follow the age-old scientific instinct to “poke it and see what happens.” And since we are indeed scientists, we do so in a structured and systematic way.

RINGS introduces three main types of perturbations – *empty*, *complete*, and *random* – which it applies to each of the two given modes. Adding the control case of “doing nothing”, we get a total of seven perturbations: 
* **Original (o)**: The identity. Do not apply any perturbation.
* **Empty-features (ef)**: Assign identical features (zero vector) to each node.
* **Complete-features (cf)**: Assign unique node IDs as features to each node (i.e., maximally distinctive node features where each node can be uniquely identified).
* **Random-features (rf)**: Randomize node features – either by sampling new features from a standard normal distribution or by shuffling existing node features between nodes.
* **Empty-graph (eg)**: Remove all edges, creating an empty graph.
* **Complete-graph (cg)**: Replace the existing graph structure with a complete graph.
* **Random-graph (rg)**: Replace the existing graph structure with a random graph, generated either by using an Erdős–Rényi model or by randomly shuffling the current edges.

These perturbations are visualized in the figure below, with graph perturbations in the top row and feature perturbations in the bottom row. Note that in order to isolate the impact of changes to a specific mode, we perturb *either* the features *or* graph structure, but not both at the same time (although the framework *would* allow us to do that, too).

{{< centered-figure 
    src="mode-perturbations.png" 
    alt="Mode Perturbations" 
    width="60%"
    border-weight="1.5px" 
    caption="**Figure 1. Mode perturbations.**" 
>}}

Now that we have a systematic “poking scheme” in place, it’s time to “see what happens.”

## Performance Separability: How informative is each mode for the given task?

*Performance separability* quantifies the effect of mode perturbations on performance for downstream tasks – in our case, primarily graph classification.

To calculate performance separability, we create perturbed versions of our dataset, train and test common GNN models on those perturbed versions, and finally record performance. We use statistical testing to determine whether changes in performance between perturbed versions of the dataset are “separable,” i.e., whether the performance distributions are significantly different.

{{< centered-figure 
    src="performance-separability.png" 
    alt="Performance Separability" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 2. Performance separability.** Shows the mean and 95th percentile interval of accuracy and AUROC across 100 runs of the best among our tuned models." 
>}}

Intuitively, if we perturb the information in one of our modes (by removing it, rendering it trivial, or muddling it via randomization), we would expect our model performance to decrease. Such is the behavior exhibited by the **NCI1** dataset in the figure above: Performance on the original dataset (shown in black) separably exceeds that of all its perturbed versions. 

However, if performance between the original dataset and the perturbed version does *not* decrease, or worse, it *increases*, this means that the information in the perturbed mode was not essential for the task. This is a red flag – it means a dataset fails to achieve our first desideratum: that graph structure and the node features should both contain *task-relevant* information.	 

Take **Enzymes**, for example. Here, our models performed better when the graph structure was completely removed (via the “eg” perturbation) than when all information was retained in its original form. From this, we conclude that the graph structure was uninformative for the task. It does not take a wizard to see that this behavior is not fitting of a good graph-learning benchmark.

## Mode Complementarity: How similar is the information contained in node features and graph structure?

Recall our second desideratum: Graph structure and node features should contain *complementary* information.

So, how do we compare the tabular information in node features with the relational information in the graph structure?

{{< centered-figure 
    src="complementarity-calculation.png" 
    alt="Calculating Mode Complementarity" 
    width="85%" 
    border-weight="1.5px" 
    caption="**Figure 3. Calculating mode complementarity.**" 
>}}

First, we convert both into normalized pairwise *n* x *n* distance matrices (a.k.a. finite metric spaces), where *n* is the number of nodes in the graph. For node features, we do so by taking the Euclidean distance between their feature vectors. For graph structure, we use the diffusion distance between nodes in order to capture the message-passing behavior that drives most GNNs. We then take the difference between these two distance matrices, and the L<sub>1,1</sub> norm of the resulting matrix.[^metrics]

The output is our *mode complementarity* score: a value from zero to one indicating the extent to which node features and graph structure encode similar information. A high score (close to one) indicates that each mode contributes novel information. A low score (close to zero) indicates redundancy between the modes.

{{< centered-figure 
    src="complementarity-vs-performance.png" 
    alt="Mode Complementarity vs. Performance" 
    width="85%" 
    border-weight="1.5px" 
    caption="**Figure 4: Mode complementarity vs. performance**, as measured by the AUROC of our best-on-average models. Each marker represents a (dataset, perturbation, *t*) tuple, where *t* ∈ [10] is the number of diffusion steps in the diffusion distance." 
>}}

Interestingly, the results in the figure above show that mode complementarity is correlated with performance, although the exact theoretical grounds for this are worthy of further investigation. (There is, admittedly, a LOT going on in that plot.)

More important to us, however, is the assertion that datasets where GNNs have something to gain from both modes make for better graph-learning datasets than those which are redundant across modes. Now, we have a way to measure exactly that.

## The Extended Cut: Mode Diversity

*Mode diversity* – a natural extension of mode complementarity and a byproduct of our perturbation framework – quantifies how interesting and varied the geometric structure of a mode is.

Rather than comparing the information in the original node features to that of the original graph structure, we again leverage perturbations to decouple the modes. In essence, we get a notion of how interesting the geometric information of a mode is by measuring how complementary it is to a trivial counterpart.

To measure *structural* diversity, we investigate the mode complementarity of the dataset under the “empty-features” perturbation. Conversely, to measure *feature* diversity, we investigate the mode complementarity of the dataset under the “empty-graph” perturbation.

Given that graph structure is what differentiates graph-learning datasets from regular, old-school tabular datasets, *structural* diversity is the focus of our evaluation.

## Takeaways: Who shall not pass?

Together, performance separability and mode diversity provide the insight necessary to triage graph datasets (see taxonomy below).

{{< centered-figure 
    src="taxonomy.png" 
    alt="Dataset Taxonomy" 
    width="85%" 
    border-weight="1.5px" 
    caption="**Figure 5. Dataset taxonomy**, where we note evidence from performance separability (†) and mode diversity (‡)." 
>}}

According to RINGS, only three of the thirteen popular benchmarks investigated exhibit both performance separability and structural diversity, thus qualifying as good graph datasets. These are our “Keep”ers.

Five datasets do not exhibit the structural diversity that we consider befitting of a graph-learning benchmark (with some also lacking performance separability); we relegate these to the “Deprecate” class.

The remaining five occupy somewhat of a (Gandalf the) grey area, with low separability but high structural diversity. These, we do not suggest throwing into the depths of Mount Doom. Doing so would be unrealistic (not to mention *dramatic*), and it might waste some untapped potential. Rather, we make the case for *realignment*. We still believe these datasets may prove helpful, but suggest that new tasks or different data modeling may render them better suited to graph learning.

In the wise (and lightly edited) words of Samwise Gamgee, “There is some good in this world [of graph-learning datasets], and it’s worth fighting for.”

## Cheers to a ~shire~ higher standard for our benchmarks

We hope that RINGS enriches the ongoing dialogue about our graph-learning benchmarks, and that it can serve as a useful tool to the community.

If you’re building or evaluating GNNs, we encourage you to put your benchmarking datasets through RINGS. You might be surprised by what you find.

Join us! Check out the [full paper](https://doi.org/10.48550/arXiv.2502.02379), and the associated [code repo](http://github.com/aidos-lab/rings/) here.

## The Fellowship of the RINGS

This blog post is based on work that was a joint effort by the members of the RINGS fellowship:

**[Corinna Coupette*](https://www.coupette.io/)**, Assistant Professor of Computer Science at [Aalto University](https://www.aalto.fi/en)

**[Jeremy Wayland*](https://jeremy-wayland.me/)**, PhD candidate at [Helmholtz Munich](https://www.helmholtz-munich.de/) and the [Technical University of Munich](https://www.tum.de/)

**[Emily Simons](https://emsimons.github.io/me/)**, Visiting Fulbright Student with [Helmholtz Munich](https://www.helmholtz-munich.de/) and the [Technical University of Munich](https://www.tum.de/)

**[Bastian Grossenbacher Rieck](https://bastian.rieck.me/)**, Full Professor of Machine Learning at the [University of Fribourg](https://www.unifr.ch/)

*Denotes sharing equal burden of the RINGS.

## Roll the credits…

Bechler-Speicher, M., Amos, I., Gilad-Bachrach, R., and Globerson, A. [Graph neural networks use graphs when they shouldn’t](https://doi.org/10.48550/arXiv.2309.04332). In *International Conference on Learning Representations*, 2024.

Coupette, C., Wayland, J., Simons, E., & Rieck, B. [No metric to rule them all: Toward principled evaluations of graph-learning datasets](https://doi.org/10.48550/arXiv.2502.02379). In *International Conference of Machine Learning*, 2025.

Errica, F., Podda, M., Bacciu, D., and Micheli, A. [A fair comparison of graph neural networks for graph classification](https://doi.org/10.48550/arXiv.1912.09893). In *International Conference on Learning Representations*, 2020.

Palowitch, J., Tsitsulin, A., Mayer, B. A., and Perozzi, B. [GraphWorld: Fake graphs bring real insights for GNNs](https://doi.org/10.48550/arXiv.2203.00112). In *Proceedings of the ACM SIGKDD Conference on Knowledge Discovery and Data Mining*, pp. 3691–3701, 2022.

*With honorable mention:*

Tolkien, J. R. R. The Lord of the Rings. HarperCollins, 1991.

And [https://movie-screencaps.com/](https://movie-screencaps.com/) for Lord of the Rings images.

## The Director's Cut:

[^gollum]: Wait, how did Gollum get in there?! Ignore him.

[^metrics]: Note that this workflow is modular: Our feature metric (Euclidean distance), graph metric (diffusion distance), and norm (L<sub>1,1</sub>) can all be exchanged for other metrics. See our paper for a lengthier discussion of our choices and recommended alternatives.


