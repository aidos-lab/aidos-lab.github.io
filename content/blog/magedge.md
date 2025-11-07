+++
draft = true
authors = ["Katharina Limbeck"]
title = "Geometry-Aware Edge Pooling: <span style='font-weight: lighter; font-style: italic'>Motivational guide to structure-preserving graph coarsening for graph neural networks</span>"

date = 2025-11-03
+++


Before heading to present at NeurIPS 2025, now seems to be a great chance to discuss our newest work on geometry-guided graph pooling that is the result of an exciting collaboration with Guy Wolf and Lydia Mezrag at MILA and Université de Montréal.

As a general starting point, let’s consider the following main question: How to reduce a graph while retaining its most important properties?

## What is graph pooling and why do we care?

Graph pooling describes a range of methods that are used to coarsen i.e. compress graphs during GNN training. Global graph pooling layers reduce each graph to a single vector representation and are often used as part of a final readout operation. In contrast, hierarchical graph pooling layers reduce the number of nodes in each graph and are used in alternation with message passing layers. Hierarchical pooling in combination with convolutional layers allows the model to learn from coarsened graphs at multiple resolutions. Figure 1 shows a sketch of a GNN architecture with one intermediate hierarchical edge pooling layer that merges adjacent nodes and aggregates their node features. This allows the GNN to capture multi-scale structural information and learn from graphs in a hierarchical manner. 

{{< centered-figure 
    src="pipeline.png" 
    alt="Hierarchical graph pooling" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 1.** Example of a GNN with one intermediate hierarchical graph pooling layer." 
>}}


## What makes a good pooling method?

The focus of our work is to design “better” hierarchical pooling methods guided by the graphs’ geometry. To do so, we first need to assess what it means for a pooling method to be successful or useful. Overall, we find that the main goals of graph pooling are to:
* **Reduce the size** of graphs during GNN training.
* Maintain or even increase **task performance**.
* Enable faster and more **efficient** GNN training.
* Preserve **graph structure** and topology.
* Make **interpretable** pooling decisions.
* Retain key **node feature** information.
* Ensure **expressivity** at distinguishing pooled graphs.

Designing pooling methods is a field of ongoing research which has proposed a wide range of methods that balance these goals to varying extents.[^pool] 

## Why do we need structure-aware pooling?

Considering the goals above, we find that existing pooling methods often struggle with preserving graphs’ connectivities in an interpretable manner. The examples below illustrate how standard pooling methods tend to make counterintuitive pooling decisions even on simple toy examples. Node dropping methods, such as TopK or SAGPool, remove nodes, which reduces expressivity and can disconnect entire portions of the graphs. Node clustering methods, such as Graclus or DiffPool, merge clusters of nodes and tend to create counterintuitive edges or return dense graph representations that do not preserve any geometric structure. In comparison, our proposed methods, MagEdgePool and SpreadEdgePool, contract adjacent nodes during pooling and faithfully preserve graphs’ connectivities. Our edge-centric and structure-aware pooling methods perform best at capturing the original graphs’ geometry for the motivating examples below. 

{{< centered-figure 
    src="examples.png" 
    alt="Examples of pooled graphs" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 2.** Examples of pooled graphs using different pooling layers." 
>}}


## Structural diversity: How do we measure the geometry of a graph?

To design structure-aware pooling operations, we find that it is of interest to leverage tools from computational geometry to formally quantify the qualitative difference between graphs. That is, we make precise when a pooled graph succeeds or fails to preserve the original graph’s geometry by tracking whether key graph invariants are preserved. In particular, we find that the magnitude or the spread of a graph, which are generalised measures of size and diversity, are especially promising candidates. By using the magnitude or spread to guide our pooling decisions, we aim to preserve the graph’s structural diversity. 

For this blog post, we briefly present the intuition behind computing these invariants.[^maths] Want to learn more? Further details can be found in our [graph pooling paper](https://arxiv.org/abs/2506.11700), our previous work on [diversity evaluation using magnitude](https://arxiv.org/abs/2311.16054), or other references on magnitude or spread.[^ref] 

First, to consider the geometry of a graph, we view the graph as a metric space characterised by its nodes and the structural dissimilarity between them. Specifically, we compute diffusion distances based on the graph’s adjacencies, which encode the information flow between nodes and allow us to directly make comparisons across graphs.[^diffusion] 

Structural diversity as measured via magnitude or spread  summarises the number of distinct sub-communities in a network based on the distance metric and degree of similarity between nodes. Intuitively, to preserve the input graph’s geometry, we’d like to collapse the most redundant graph structures during pooling but preserve the ones that are most characteristic of the graph’s structural diversity. Magnitude and spread help us to distinguish between structurally important or redundant edges. 

As a motivating example, we consider the three graphs in Figure 3. The graph on the left has two distinct communities and is more diverse than the modified graph in the middle, for which two edges in the denser cluster have been collapsed. In contrast, the graph on the right, for which the two structurally important edges that bridge the two communities are contracted, is the least diverse example. By computing magnitude or spread, we are thus able to distinguish structural differences between graphs and detect structurally-important edges.

Note that spread gives a faster and closely-related alternative to magnitude, but magnitude has a stronger theoretic foundation and has been more frequently used in applications. This is why we investigate both measures and use them interchangeably throughout our work. 


{{< centered-figure 
    src="mag_example.png" 
    alt="Structural diversity detects important edges" 
    width="75%" 
    border-weight="1.5px" 
    caption="**Figure 3.** Structural diversity detects important edges." 
>}}




## MagEdgePool and SpreadEdgePool: Geometry-aware graph pooling

We choose edge contraction, i.e. the collapse of adjacent nodes, as a pooling operation because edge-centric pooling aligns well with our goal of changing the structure of the graph as little as possible. We do not remove nodes, disconnect the graph, or create counterintuitive connectivities between clusters of nodes as often done by node-centric pooling methods. Rather, edge pooling offers a very faithful way to respect connectivities based on simply collapsing edges. By further guiding our edge pooling decisions to retain the original graph’s structural diversity as best as possible, we ensure interpretable structure preservation. Our pooling algorithms MagEdgePool and SpreadEdgePool use magnitude or spread respectively to decide which edges should be collapsed and operate as follows. 

1. Before training we compute each edge’s importance score as the difference in structural diversity, i.e. the difference in magnitude (or spread), after collapsing the edge.

{{< centered-figure 
    src="contract.png" 
    alt="Contracting one edge" 
    width="45%" 
    border-weight="1.5px" 
    caption="**Figure 4.** Contracting one edge." 
>}}

2. Then, we stepwise contract the edge with the lowest edge score not adjacent to an already contracted node until the desired pooling ratio is reached. 

{{< centered-figure 
    src="pool.png" 
    alt="Pool edges based on edge importance" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 5.** Pool edges based on edge importance." 
>}}

3. During GNN training our pooling layers reduce the graph based on the pre-computed edge selection. The node features of the merged nodes are averaged (or otherwise aggregate).

{{< centered-figure 
    src="feature_pool.png" 
    alt="Aggregate the node features" 
    width="45%" 
    border-weight="1.5px" 
    caption="**Figure 6.** Aggregate the node features." 
>}}

## Overview: How does our method compare to alternative pooling methods?

For further context, we compare our pooling methods to alternative pooling layers in the overview table below. From the comparison it is clear that our methods are non-trainable and can be pre-computed independently of the GNN architecture, which allows for more efficient GNN training. Further, edge contraction is compatible with sparse GNN layers, which enables faster training than dense pooling methods, which need to be followed by dense convolutional layers. In terms of the size of the pooled graphs, our methods allow for a flexible choice of pooling ratio making it more flexible than other layers, which always pool graphs to approximately half their size or to a fixed number of super-nodes. Regarding theoretical properties, we can further show that MagEdgePool and SpreadEdgePool fulfil sufficient conditions for retaining the expressivity of the preceding message passing layers laid out by Bianchi et al. (2023) ensuring that non-isomorphic pooled graphs output by our methods can be distinguished.


{{< centered-figure 
    src="overview.png" 
    alt="Overview of different pooling methods" 
    width="75%" 
    border-weight="1.5px" 
    caption="**Figure 7.** Overview of different pooling methods." 
>}}


## Graph classification performance

The success of graph pooling layers is often evaluated by assessing whether they maintain or even increase task performance of GNNs at downstream tasks, such as graph classification. To compare our methods against alternative pooling layers we plug each layer into the same GNN architecture, which contains one intermediate pooling layer that reduces graphs to approximately half their original size. The table below reports the classification accuracies of different pooling layers across stratified 10-fold cross-validation. From the results, we are happy to report that our proposed pooling methods reach top classification performance amongst alternative pooling layers and achieve the highest mean ranks across datasets. 

{{< centered-figure 
    src="classification.png" 
    alt="Graph classification performance" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 8.** Graph classification performance." 
>}}

## Graph classification performance across pooling ratios

We consider the best performing methods from before and ask how task performance changes for increasing pooling ratios i.e. when reducing the size of the pooled graphs from the ENZYMES or NCI1 datasets. Keeping almost the same model architecture as before, we vary the pooling ratio for flexible methods. Else, for fixed methods that always pool graphs to approximately half their size, we apply the pooling operation repeatedly. Our methods retain robust classification performance across various pooling ratios and reach top accuracies amongst alternative pooling layers, especially at low pooling ratios.

{{< centered-figure 
    src="ratios.png" 
    alt="Graph classification performance across pooling ratios" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 9.** Graph classification performance across pooling ratios." 
>}}

## Graph structure preservation

To assess whether our methods preserve graph structure during pooling as intended, we compare how well different pooling layers preserve spectral properties or the structural diversity of the input graphs for all graphs from the NCI1 dataset. The left plots report the normalised spectral distances between the original and pooled graphs. The right plots show the relative difference in magnitude compared to the input graph. Our methods reach the lowest spectral distances as well as the lowest differences in magnitude compared to alternative pooling layers. MagEdgePool and SpreadEdgePool thus best preserve graph structure during pooling. 


{{< centered-figure 
    src="spectral.png" 
    alt="Graph structure preservation" 
    width="95%" 
    border-weight="1.5px" 
    caption="**Figure 9.** Graph structure preservation across pooling ratios." 
>}}

## Final remarks

Let’s answer our original question on how to pool a graph while preserving its key properties. Edge-contraction pooling using MagEdgePool or SpreadEdgePool ensures that task performance, graph structure, and node feature information are maintained in an expressive and interpretable manner. Our pooling methods are useful general-purpose approaches that respect the graph’s inherent geometry while achieving robust classification performance across datasets and pooling ratios.  

Interested in learning more or trying the pooling methods on your own datasets? Here is a link to our [paper](https://arxiv.org/abs/2506.11700) and to a PyTorch implementation of our pooling methods on [GitHub](https://github.com/aidos-lab/mag_edge_pool). Our paper shows a more in-depth evaluation of computational efficiency, performance at graph regression tasks, or comparisons with other baseline pooling methods. We further report theoretical results linking magnitude and spread, and demonstrate key properties of our pooling methods, such as permutation invariance, computational efficiency, and expressivity.

We’d like to thank the reviewers at both [NeurIPS 2025](https://neurips.cc/virtual/2025/loc/san-diego/poster/117100) and [MLG 2025](https://mlg-europe.github.io/2025/) for their excellent feedback and everyone who made it all the way through reading through this blog post. We look forward to presenting this work at NeurIPS and hopefully meeting some of you in San Diego!

## References

F. M. Bianchi and V. Lachi. [The expressive power of pooling in graph neural networks](https://arxiv.org/abs/2304.01575). In
Advances in Neural Information Processing Systems, volume 37, pages 71603–71618., 2023

R. R. Coifman and S. Lafon. [Diffusion maps](https://www.sciencedirect.com/science/article/pii/S1063520306000546). Applied and Computational Harmonic Analysis,
21(1):5–30, 2006.

D. Grattarola, D. Zambon, F. M. Bianchi, and C. Alippi. [Understanding pooling in graph neural networks](https://arxiv.org/abs/2110.05292). IEEE Transactions on Neural Networks and Learning Systems, 35(2):2708–2718, 2022.

T. Leinster. [The magnitude of metric spaces](https://arxiv.org/abs/1012.5857). Documenta Mathematica, 18:857–905, 2013.

T. Leinster. [Entropy and Diversity: The Axiomatic Approach](https://arxiv.org/abs/2012.02113). Cambridge University Press,
2021.

K. Limbeck, R. Andreeva, R. Sarkar, and B. Rieck. [Metric space magnitude for evaluating
the diversity of latent representations](https://arxiv.org/abs/2311.16054). In Advances in Neural Information Processing Systems, volume 38, pages 123911–123953., 2024.

C. Liu, Y. Zhan, J. Wu, C. Li, B. Du, W. Hu, T. Liu, and D. Tao. [Graph pooling for graph neural networks: progress, challenges, and opportunities](https://arxiv.org/abs/2204.07321). In Proceedings of the 32nd International Joint Conference on Artificial Intelligence, pages 6712–6722, 2023.

S. Willerton. [Spread: a measure of the size of metric spaces](https://arxiv.org/abs/1209.2300). International Journal of
Computational Geometry & Applications, 25(03):207–225, 2015.

## Footnotes

[^pool]: For further context, here is a comprehensive [blog post on graph pooling](https://filippomb.github.io/blogs/gnn-pool-1/) that introduces and compares various pooling approaches. 

[^diffusion]: Our framework is flexible and we could vary this choice of distance to explore alternative geometries. Nevertheless, we find that diffusion distances are particularly suitable to encode and compare the geometry of graphs.

[^maths]: Following in the footsteps of more renowned mathematicians, who long since mastered the art of [blogging about magnitude](https://case.edu/artsci/math/mwmeckes/mdblogs.html), spread or the diversity of metric spaces, with more mathematical rigour. 

[^ref]: Check out this [bibliography on magnitude](https://webhomes.maths.ed.ac.uk/~tl/magbib/) for a comprehensive overview on the mathematical background.
