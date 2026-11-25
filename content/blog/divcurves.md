+++
authors = ["Nadja Häusermann"]
title = "Diversity Curves for Graph Representation Learning"
subtitle = "Size-robust graph embeddings combining coarsening and structural diversity"

date = 2026-11-24
description = "Diversity Curves offer a novel approach for graph representations that are robuts to varying sizes by tracking structural diversity of graphs across a coarsening sequence."
+++

Our work on "Diversity Curves for Graph Representation Learning" has been accepted to NeurIPS 2026. Before hopefully meeting some of you in Paris, we will already give you a brief glimpse into our main motivation and results.

## What are graph representations?
Our work focuses on unsupervised graph representations. These are important tools to explore and characterise graphs and graph datasets when there are no labels present. In particular, the goal for a useful graph representation or graph embedding is to find a vectorisation of a graph in such a way that some intrinsic properties of the graphs are being preserved. 
<!-- Current methods include ... [add some general graph representation reference!?]  Yes, we let's give evidence to say why this is the case. Like the nect paragraph should say why current methods struggle with size. -->

Current methods struggle when they need to simultaneously handle graphs of varying cardinality. This is an issue, as often we are dealing with datasets in which graphs sharing the same general properties can have very different sizes. For example, it has been shown that graph neural networks struggle with generalising across molecular graphs of varying resolutions.  <!-- Similarily many geometric methods that use graph filtrations, ... TODO: add more motivation here -->
 The focus of our work lies on tackling this problem and finding a novel unsupervised graph representation method that captures the coarse geometry of a graph in such a way that it can be used for applications where graphs have different sizes. 
<!-- In the next section, we will explain how we achieve this by combining coarsening together with the structural diversity. -->

## How can we improve size-robustness of graph representations?
To address the issue of graph representation methods that generalize well to graphs of different cardinalities, we propose **diversity curves**, novel graph level representations that aim to capture the coarse geometry and structure of graphs while being robust to their size. How we are able to achieve this, is by neatly combining graph coarsening together with a structural descriptor that is the graphs' diversity. 

Let's look at how we obtain the diversity curve for some example graphs. 

{{< centered-figure 
    src="overview.png" 
    alt="Diversity curves for three example graphs." 
    width="100%" 
    border-weight="1.5px" 
    caption="**Figure 1.** Diversity curves for three example graphs." 
>}}

First, for each graph we construct a sequence of coarsened graphs of some specified cardinalities. Specifically, to make graphs smaller, we use edge contraction pooling[^edge-sequence] in our work because it allows us to control the cardinality in each step, can be applied iteratively, preserves the structure of the graph[^mag-edge-pooling] and has been shown to improve expressivity. If needed, we can also make graphs larger by upsampling nodes in the graph. 
<!-- We obtain a sequence of graphs that captures the coarse geomtetry of the graph. -->

Second, we now use a structural descriptor, the diversity of the graph, which we measure by its metric space spread. At each cardinality, we evaluate the diversity of the graph and thus obtain a curve, which we term **diversity curve** that tracks this structural diversity across different coarsening levels. Let's briefly dive into the world of diversity measures and our choice of using the spread. The study of diversity has its roots in the problem of characterising biological diversity in a community. 
<!-- Do we need to clarify the difference between magnitude and spread here? The text below is quite long compared to the rest of the blog post and maybe not needed to understand the paper. -->
This question has started a thorough mathematical analysis, where we denote a diversity measure as an invariant of a metric space that characterises how diverse its points are with respect to the metric. The *magnitude* of a metric space is such a diversity measure, capturing the "effective number of points" and has been studied through various theoretical work. Recently, magnitude has been applied to a growing range of applications, such as in predicting protein flexibility or in our own work on using magnitude to evaluate diversity of latent representation [^magnitude]. As an alternative quantity, we use the *spread* of a metric space for this work. Spread is a diversity measure closely related to the magnitude, but it is well-defined for any metric space and faster to compute in practice. Note that in order to compute the spread of a graph, we need to view the graph as a metric space. Our default choice is to use the shortest-path metric, but other options are possible as we will touch upon in the applications and we discuss further in the paper. 

Finally, the diversity curve gives us a multiscale summary of the graph, describing its coarse geometry. We can use the vectorisation of diversity curves directly for downstream tasks. The unique interplay between the structural diversity and the coarsening ensures that diversity curves are robust to size, interpretable, and expressive graph representations that perform well in various applications to unsupervised tasks for structured data, as we will see next. 


## How do diversity curves perform?

In our work we investigate the abilities of diversity curves across different applications and in theoretical settings. Below, we present a selection of the results that can be found in the paper.

### Diversity curves are expressive graph representations

First, we find that using coarsening together with diversity does not only help in achieving size-robustness, but also increases expressivity compared to the diversity alone. Figure 2 shows two graphs that have the same diversity but their diversity curves[^multiset] differ already when contracting one edge, as can be seen in the plot on the right.

{{< centered-figure 
    src="expressivity.png" 
    alt="Two 1-WL indistinguishable graphs with the same spread and different diversity curves." 
    width="100%" 
    border-weight="1.5px" 
    caption="**Figure 2.** Two 1-WL indistinguishable graphs with the same spread and different diversity curves." 
>}}

Furthermore, the two graphs in Figure 2 are also 1-WL indistinguishable. We further test whether diversity curves can distinguish 1-WL graphs on a larger scale experiment on pairs of graphs from the BREC dataset, and find that indeed this holds true more generally with the performance of diversity curves being comparable to the best unsupervised graph representation baselines we tested.

<!-- ### Diversity curves track graph perturbations -->

### Diversity curves distinguish graph distributions

To validate how robust diversity curves are with respect to  different graph sizes, we first test on simulated graph datasets. We generate graphs from four different random graph models of varying size and try to distinguish the graphs based on the distribution they are sampled from. Our findings show that diversity curves are able to cluster these graphs well. Accuracies from k-NN classification are comparable to the best baseline methods and the clustering quality measured in terms of the silhouette score clearly outperforms the baselines. This supports our claim that we are robust to different graph sizes and are able to intrinsically cluster graphs in an unsupervised way. Figure 2 shows a PCA plot of the diversity curves from the graphs of the different graph distributions.

{{< centered-figure 
    src="simulation_distributions_pca.png" 
    alt="PCA of diversity curves of graphs of varying sizes sampled from four random graph distributions ER, RP, SBM, and RG." 
    width="50%" 
    border-weight="1.5px" 
    caption="**Figure 2.** PCA of diversity curves of graphs of varying sizes sampled from four random graph distributions ER, RP, SBM, and RG." 
>}}

We further modify the experiment and try to characterise and distinguish between graphs drawn from the same underlying random graph model when varying the parameters. Here, we investigate whether diversity curves also pick up on these differences in parameter choices. Supporting our earlier results, accuracies and silhouette scores indicate that the diversity curves perform well at this task. Figure 3 shows the table of the k-NN classification accuracies for diversity curves against the baselines.

{{< centered-figure 
    src="sim_params_acc.png" 
    alt="Accuracies at distinguishing parameter choices of random graph models." 
    width="100%" 
    border-weight="1.5px" 
    caption="**Figure 3.** Accuracies at distinguishing parameter choices of random graph models." 
>}}

### Diversity curves distinguish trajectory or cluster structures in single-cell graphs

Having evaluated our method on simulated graph datasets, we expand to a real-world setting. Here, we present the application to single-cell data, where it is of importance for downstream analysis to distinguish the structure of single-cell graphs into cluster- or trajectory-like. We test the ability of diversity curves at this geometric task on an annotated dataset. Since single-cell graphs also contain node features, we leverage the flexibility of our pipeline and compute diversity curves based on the shortest-path distance in the graphs and on the Euclidean distance between features and combining the curves together to obtain one representation per graph. We find that cluster-like graphs have on average higher diversity across the coarsening and we are able to separate well between the different structures. Diversity curves further outperform previously proposed geometric evaluation scores for this task. Figure 4 shows the PCA of diversity curves for the single-cell graphs.

{{< centered-figure 
    src="single_cell.png" 
    alt="PCA of the diversity curves for cluster- and trajectory-like single-cell graphs with examples of two graphs in each class." 
    width="75%" 
    border-weight="1.5px" 
    caption="**Figure 4.** PCA of the diversity curves for cluster- and trajectory-like single-cell graphs with examples of two graphs in each class." 
>}}

<!-- ### Diversity curves characterise molecular graph datasets -->

### Diversity curves characterise geometric shapes

As a last study, we focus on a purely geometric task that also lets us demonstrate the flexibility of our method to adapt to different experimental settings. We use a dataset of triangulations of 2-manifolds from the MANTRA dataset. The task is to distinguish the triangulations according to their homeomorphism type. We first use diversity curves only on the 1-skeleton graphs, that is we only consider the vertices and edges of the triangulation, where we achieve the best possible accuracy an optimal classifier can have[^1skeleton]. Exploiting the higher-order structure, we use the higher-order heat kernel distance between faces of the triangulations to compute the spread. With this approach, diversity curves essentially solve the task, reaching an accuracy of 99%. The PCA in Figure 5 shows that the diversity curves with this choice of metric separate the classes well.

{{< centered-figure 
    src="mantra.png" 
    alt="PCA of the diversity curves for triangulations of four different homeomorphism types computed using the heat kernel distance." 
    width="75%" 
    border-weight="1.5px" 
    caption="**Figure 5.** PCA of the diversity curves for triangulations of four different homeomorphism types computed using the heat kernel distance." 
>}}

As an additional test, we also evaluate the performance of diversity curves when training our classifier on the original dataset and evaluating on triangulations where barycentric subdivision is performed to increase the number of nodes. We find that diversity curves still outperform the best previously reported baseline on this task, supporting the robustness of diversity curves with respect to number of nodes and their ability to encode the intrinsic geometry of data.

## Closing remarks

We successfully exploited the combination of a coarsening together with the diversity measured by the spread as a graph invariant to obtain diversity curves, novel unsupervised graph representations. Diversity curves use a coarsening sequence that transforms all graphs to the same cardinalities across which we can then evaluate the structural diversity at each level. We find that diversity curves are robust to graphs of different sizes and give expressive representations that perform well on a variety of tasks on inherently geometric and real-world molecular graphs.

If you are interested in learning more about our methods, check out our [paper](https://arxiv.org/abs/2605.06466). There are more experiments to discover: we show how diversity curves behave under perturbations of the graphs, use them to perform statistical tests between different graph datasets, and give further theoretical background and details. If you would like to try out using diversity curves yourself, the accompanying code is published [here](https://github.com/aidos-lab/diversity_curves).

This was a joint work between the following authors, thanks everyone!

**[Katharina Limbeck](https://limbeckkat.github.io/)**, (soon to be finished) PhD student at [Helmholtz Munich](https://www.helmholtz.de/) and [Technical University of Munich](https://www.tum.de/)

**[Nadja Häusermann](https://nadja.topology.rocks/)**, PhD student at [University of Fribourg](https://www.unifr.ch/)

**[Martin Carrasco](https://martin.topology.rocks/)**, PhD student at [University of Fribourg](https://www.unifr.ch/)

**[Guy Wolf †](https://guywolf.org/)**, Full Professor at [University of Montréal](https://www.umontreal.ca/en/) and Core Academic Member at [Mila - Quebec AI Institute](https://mila.quebec/en)

**[Bastian Grossenbacher-Rieck †](https://bastian.rieck.me/)**, Full Professor at [University of Fribourg](https://www.unifr.ch/)

† These authors jointly supervised the work.
## References

R. Ballester, E. Röell, D. B. Schmid, M. Alain, S. Escalera, C. Casacuberta, and B. Rieck.
[MANTRA: The manifold triangulations assemblage](https://arxiv.org/abs/2410.02392). In International Conference on Learning
Representations, 2025.

W. Bi, H. Feng, J. Wu, J. Li, G Wei. [Topological magnitude for protein flexibility analysis](https://royalsocietypublishing.org/rsos/article/12/12/251599/364074/Topological-magnitude-for-protein-flexibility). Royal Society Open Science, 12(12):251599, 2025.

V. Lachi, A. Moallemy-Oureh, A. Roth, and P. Welke. [Expressive pooling for graph neural
networks](https://mlanthology.org/tmlr/2025/lachi2025tmlr-expressive/). Transactions on Machine Learning Research, 2025

T. Leinster. [Entropy and Diversity: The Axiomatic Approach](https://arxiv.org/abs/2012.02113). Cambridge University Press, 2021.

H. S. Lim and P. Qiu. [Quantifying the clusterness and trajectoriness of single-cell RNA-seq
data](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011866). PLoS Computational Biology, 20(2):e1011866, 2024.

K. Limbeck, R. Andreeva, R. Sarkar, and B. Rieck. [Metric space magnitude for evaluating
the diversity of latent representations](https://arxiv.org/abs/2311.16054). In Advances in Neural Information Processing Systems,
volume 37, 2024.

Y. Wang and M. Zhang. [An empirical study of realized GNN expressiveness](https://proceedings.mlr.press/v235/wang24cl.html). In Proceedings
of the 41st International Conference on Machine Learning, volume 235, pages 52134–52155.
PMLR, 2024.

S. Willerton. [Spread: a measure of the size of metric spaces](https://www.worldscientific.com/doi/abs/10.1142/S0218195915500120). International Journal of
Computational Geometry & Applications, 25(03):207–225, 2015.

[^edge-sequence]: There is a choice involved here in how we select the edge contraction sequence. We have investigated different methods in our paper and found that for our experiments repeating the coarsening over three randomly generated edge sequences works well while being computationally efficient. 

[^mag-edge-pooling]: Check out our previous work using magnitude based edge contraction pooling in the respective [blog post](https://aidos.group/blog/magedge/) or the [paper](https://arxiv.org/abs/2506.11700).

[^magnitude]: For further references, there exists a [bibliography of magnitude](https://webhomes.maths.ed.ac.uk/~tl/magbib/).

[^multiset]: We have to be a bit careful with this statement, because one graph technically can have different diversity curves depending on what edges we contract. Here we use the average diversity curve over all possible ways to contract edges in the graph. 

[^1skeleton]: Certain shapes in the dataset (the Klein bottle and Torus) cannot be distinguished by their 1-skeleton alone. This is why we compare against an optimal classifier that can distinguish the homeomorphism types of the 1-skeleta where theoretically possible, and misclassifies everything that is not distinguishable by the 1-skeleton in a consistent manner.