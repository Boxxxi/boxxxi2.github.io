# Merchant Categorization Using NLP and Clustering Techniques

In the financial and e-commerce sectors, accurately categorizing merchants based on transaction data is essential for analytics, fraud detection, and personalized services. This article details a comprehensive approach to merchant categorization, leveraging Natural Language Processing (NLP) and clustering algorithms. We'll walk through the process step-by-step, incorporating code snippets and data examples to illustrate each phase.

## Project Overview

The primary objective is to develop an ML-driven system that classifies merchants from transactional data. The methodology encompasses data preprocessing, embedding generation, dimensionality reduction, clustering, and visualization (and of course, further iterations of the same!).

**Key Components:**

- **Data Preprocessing:** Cleaning and preparing merchant names.
- **Embedding Generation:** Transforming text data into numerical representations using FastText.
- **Dimensionality Reduction:** Utilizing UMAP to project embeddings into a lower-dimensional space.
- **Clustering:** Applying HDBSCAN and KMeans to group similar merchants.
- **Visualization:** Creating word clouds and plots to interpret clustering results.

## 1. Data Preprocessing

Begin by extracting and cleaning merchant names from your transactional dataset. This step ensures that the text data is uniform and free from noise, which is crucial for accurate embedding generation.

### Example Code:

```python
import pandas as pd
import re

# Load your data
data = pd.read_csv('MerchantsData.csv')

# Function to clean merchant names
def clean_merchant_name(text) -> Union[None, str]:
    '''
    Returns only alphabetical part from text
    '''
    response = None
    pattern = r'[a-z]+'
    parts = re.findall(pattern, str(text), re.IGNORECASE)
    ## Keep only words with at least 2 letters
    if parts := [x.lower() for x in parts if len(x) > 1]:
        response = " ".join(parts)
    return response

# Apply cleaning function
data['cleaned_merchant_name'] = data['merchant_name'].apply(clean_merchant_name)
dara[['merchant_name', 'cleaned_merchant_name']].head(10)
```

### Sample Data Before and After Cleaning:

| Original Merchant Name                       | Cleaned Merchant Name                          |
|----------------------------------------------|------------------------------------------------|
| BAJAJ FINANCE LIMI	                       | bajaj finance limi                             |
| SHUHARITECHVENTURES	                       | shuharitechventures                            |
| Razorpay software pvt ltd	                   | razorpay software pvt ltd                      |
| PESTSOLUTIONS INC	                           | pestsolutions inc                              |
| ABS ABSOLUTE BARBECUES	                   | abs absolute barbecues                         |
| Bansidhar Packaging	                       | bansidhar packaging                            |
| Ing*Play Games Rummy	                       | ing play games rummy                           |


## 2. Embedding Generation with FastText

Transform the cleaned merchant names into numerical vectors using FastText embeddings. These embeddings capture semantic similarities between words, which aids in clustering similar merchants together.


| Method    | Pros                                         | Cons                                         |
|-----------|----------------------------------------------|----------------------------------------------|
| Word2Vec  | Simple, effective for word similarity        | Cannot handle unseen words, no subword info  |
| GloVe     | Pretrained vectors available                 | No subword knowledge, lacks adaptability     |
| TF-IDF    | Simple, works well for keywords              | No semantic understanding, purely statistical|
| BERT      | Context-aware, powerful NLP model            | Heavy computation, overkill for merchant names|
| FastText  | Handles typos, OOV words, and short text well| Slightly larger memory usage than Word2Vec   |


### Example Code:

**Note:** Ensure that `'cleaned_merchant_names.txt'` contains one cleaned merchant name per line.

```python
import fasttext

# Prepare the data for FastText
# FastText expects one sentence per line, with labels prefixed by __label__
with open('cleaned_merchant_names.txt', 'w', encoding='utf-8') as f:
    for text in df[text_column]:
        f.write(f'__label__dummy {text}\n')

# Train FastText model
model = fasttext.train_unsupervised('cleaned_merchant_names.txt', model='skipgram', dim=100)

# Generate embeddings
data['embedding'] = data['cleaned_merchant_name'].apply(lambda x: model.get_sentence_vector(x))
```

## 3. Dimensionality Reduction with UMAP

To visualize and cluster the high-dimensional embeddings, reduce their dimensionality using UMAP. This technique preserves the local and global structure of the data.


| Feature                                       | UMAP                                      | PCA                                   |
|----------------------------------------------|-------------------------------------------|---------------------------------------|
| Captures Non-Linear Relationships            | Yes                                       | No (only linear)                      |
| Preserves Local & Global Structure           | Yes                                       | No                                    |
| Handles High-Dimensional Data Well           | Yes                                       | Limited                               |
| Metric Customization (Cosine Similarity, etc.)| Yes                                      | No                                    |
| Speed & Scalability                          | Slower than PCA                           | Very fast                             |
| Manifold Learning Approach                   | Yes (Graph-based)                         | No                                    |
| Best Use Cases                               | Clustering, preserving semantic similarity | Data compression, basic visualization |

### Example Code:

```python
import umap
import numpy as np
import matplotlib.pylot as plt
import seaborn as sns

# Stack embeddings into a numpy array
embeddings = np.array(data['embedding'].tolist())

# Apply UMAP
## Run UMAP
umap_embeddings = umap.UMAP(
    n_components=10,
    n_neighbors=15,
    metric='cosine',
).fit_transform(scaled_embeddings)

# Add UMAP embeddings to DataFrame
data['umap_x'] = umap_embeddings[:, 0]
data['umap_y'] = umap_embeddings[:, 1]

plt.figure(figsize=(10, 5))
sns.scatterplot(x=umap_embeddings[:, 0], y=umap_embeddings[:, 1])
plt.xlabel('UMAP1')
plt.ylabel('UMAP2')
plt.title('UMAP')
```

## 4. Clustering with HDBSCAN

Utilize HDBSCAN to identify clusters of similar merchants. HDBSCAN is effective for clustering data with varying densities and can handle noise by classifying outliers.

### Example Code:

```python
import hdbscan

# Apply HDBSCAN
clusterer = hdbscan.HDBSCAN(min_cluster_size=50, min_samples=10, metric='euclidean')
clusterer = HDBSCAN(
    min_cluster_size=100,
    min_samples=50,
    cluster_selection_method='eom'
)
clusterer.fit(umap_embeddings)
data['cluster'] = clusterer.fit_predict(umap_embeddings)
data[['merchant_name', 'cluster']].head(10)
```

### Interpreting Clustering Results:

| Merchant Name              | Cluster Label |
|----------------------------|---------------|
| sharma enterprises         | 0             |
| sarath enterprises         | 0             |
| sri raghavendra ent        | 0             |
| reliance retail ltd        | 3             |
| mart retail ltd	         | 3             |
| northern arc capital limi	 | 5             |
| payu finance india pvt ltd | 5             |
| shubha trading company     | 6             |
| shiv trading company	     | 6             |
| resilient innov            | -1            |
| rrpal construct            | -1            | 

A cluster label of `-1` indicates that the merchant was classified as noise or an outlier.

## 5. Visualization

Visualize the clustering results to interpret and validate the groupings. Word clouds can represent the most frequent terms in each cluster, and scatter plots can display the distribution of clusters.

### Example Code for Scatter Plot:

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Scatter plot of UMAP embeddings colored by cluster
plt.figure(figsize=(10, 5))
sns.scatterplot(x='umap_x', y='umap_y', hue='cluster', data=data, palette='viridis')
plt.xlabel('UMAP Dimension 1')
plt.ylabel('UMAP Dimension 2')
plt.title('HDBSCAN Clusters')
plt.show()
```

### Example Code for Word Cloud:

```python
from wordcloud import WordCloud

# Generate word cloud for a specific cluster
cluster_id = 0
cluster_data = data[data['cluster'] == cluster_id]
text = ' '.join(cluster_data['cleaned_merchant_name'])

wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud, interpolation='bilinear')
plt.title(f'Word Cloud for Cluster {cluster_id}')
plt.axis('off')
plt.show()
```

## Results

You may need to tune the hyperparaneters to get best results. For this exercise, the best results were achieved at the following parameter values.

```markdown
# Hyperparameters
n_neighbors = 10
n_components = 30
min_cluster_size = 500
min_samples = 50

# Clustering results
n_clusters = 29
purity = 0.05
silhouette_score = 0.20
noise_ratio = 28%
```

### Sample of Final Cluster Wordclouds

> Note: The wordcloud images shown below are placeholders. You'll need to add your actual wordcloud images to the `./src/assets/images/merchant-categorization/` directory for them to display properly.

<div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud2.png" width="30%" alt="Wordcloud Cluster 1"/>
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud32.png" width="30%" alt="Wordcloud Cluster 2"/>
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud25.png" width="30%" alt="Wordcloud Cluster 3"/>
</div>

<div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud19.png" width="30%" alt="Wordcloud Cluster 4"/>
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud22.png" width="30%" alt="Wordcloud Cluster 5"/>
    <img src="./src/assets/images/projects/merchant-categorization/Cluster_wordcloud23.png" width="30%" alt="Wordcloud Cluster 6"/>
</div>

## Conclusion

The low **purity** and **silhouette** scores indicate presence of high impurity in the data. Similarly, **noise ratio** is also pretty high, showing that the model was not able to group many points into clusters.

The silver lining here is that the **WordClouds** show that clusters are interpretable. For improvement, clusters created on impurities can be used to systematically remove such data and clean input data for next iteration.

By following this approach, you can effectively categorize merchants using NLP and clustering techniques. This methodology facilitates better data organization, enhances analytical capabilities, and supports strategic decision-making in financial and e-commerce applications.
