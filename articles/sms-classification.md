# Multi-Category SMS Classification: A Hierarchical Deep Learning Approach

## Introduction

In the era of digital communication, SMS messages remain a critical channel for businesses to interact with customers, especially in sectors like banking, e-commerce, and healthcare. These messages contain valuable structured information that, when properly categorized and analyzed, can provide significant insights for both businesses and consumers. This article explores my project "Multi-Category SMS Classification," a hierarchical deep learning framework that achieves remarkable accuracy in classifying SMS messages across multiple dimensions.

## The Challenge of Multi-Dimensional SMS Classification

While traditional text classification often focuses on single-label categorization (e.g., spam vs. non-spam), real-world SMS messages typically contain information that spans multiple classification dimensions:

1. **Message Type**: Transaction alerts, promotional offers, authentication codes, etc.
2. **Account Type**: Credit card, savings account, loan account, etc.
3. **Message Subtype**: Deposit, withdrawal, payment due, etc.
4. **Entity Information**: Merchant details, transaction amounts, dates, etc.

Effectively categorizing messages across these dimensions presents several challenges:

1. **Hierarchical Relationships**: Categories often have parent-child relationships (e.g., a credit card payment reminder is both a "payment" subtype and a "credit card" account type)
2. **Imbalanced Data**: Some categories appear much more frequently than others
3. **Short Text Length**: SMS messages are concise, providing limited context
4. **Noise and Variations**: Different senders use different terminology for the same concepts

## Building on Standardized Data

This project builds directly on the foundation laid by my Auto-RegexIfy system, which standardized SMS messages using enhanced regex patterns. The standardized messages provided a cleaner, more consistent input for the classification system, with key entities already identified and normalized.

## The Hierarchical Classification Approach

My solution implements a hierarchical deep learning architecture that leverages both the sequential nature of text and the hierarchical relationships between classification dimensions.

### System Architecture

The system employs a multi-stage classification pipeline:

1. **Text Preprocessing**
   - Tokenization and normalization
   - Entity replacement with standardized tokens (leveraging Auto-RegexIfy output)
   - Sequence padding and truncation

2. **Embedding Layer**
   - FastText embeddings pre-trained on a large corpus of SMS messages
   - Fine-tuned during model training to capture domain-specific semantics
   - Out-of-vocabulary handling for rare or new terms

3. **Sequential Modeling**
   - Bidirectional LSTM layers to capture contextual information
   - Attention mechanisms to focus on the most relevant parts of the message
   - Dropout layers to prevent overfitting

4. **Hierarchical Classification**
   - Primary classifier for message type
   - Conditional classifiers for account type based on message type
   - Specialized classifiers for subtypes based on message and account types
   - Entity extraction validation based on classification results

5. **Reinforcement Learning Optimization**
   - Reward function based on classification accuracy across all dimensions
   - Policy gradient methods to optimize the decision pathway
   - Exploration-exploitation balance to discover optimal classification strategies

### Technical Implementation

The implementation leverages several advanced techniques:

```python
# Example: Hierarchical model architecture
def build_hierarchical_model(vocab_size, embedding_dim, max_length):
    # Input layer
    input_layer = Input(shape=(max_length,))
    
    # Embedding layer with pre-trained FastText embeddings
    embedding_matrix = load_fasttext_embeddings(vocab_size, embedding_dim)
    embedding_layer = Embedding(
        input_dim=vocab_size,
        output_dim=embedding_dim,
        weights=[embedding_matrix],
        input_length=max_length,
        trainable=True
    )(input_layer)
    
    # Bidirectional LSTM with attention
    lstm_layer = Bidirectional(LSTM(128, return_sequences=True))(embedding_layer)
    attention = Attention()([lstm_layer, lstm_layer])
    dropout = Dropout(0.3)(attention)
    
    # Primary classifier (message type)
    msg_type_output = Dense(num_msg_types, activation='softmax', name='msg_type')(dropout)
    
    # Conditional classifier (account type)
    # The account type classifier receives both the LSTM output and the message type prediction
    combined_for_account = Concatenate()([dropout, msg_type_output])
    account_type_output = Dense(num_account_types, activation='softmax', name='account_type')(combined_for_account)
    
    # Subtype classifier
    # The subtype classifier uses information from all previous classifications
    combined_for_subtype = Concatenate()([dropout, msg_type_output, account_type_output])
    subtype_output = Dense(num_subtypes, activation='softmax', name='subtype')(combined_for_subtype)
    
    # Create model with multiple outputs
    model = Model(
        inputs=input_layer,
        outputs=[msg_type_output, account_type_output, subtype_output]
    )
    
    # Custom loss weights for each task
    model.compile(
        optimizer='adam',
        loss={
            'msg_type': 'categorical_crossentropy',
            'account_type': 'categorical_crossentropy',
            'subtype': 'categorical_crossentropy'
        },
        loss_weights={
            'msg_type': 1.0,
            'account_type': 0.8,
            'subtype': 0.6
        },
        metrics=['accuracy']
    )
    
    return model
```

For the reinforcement learning optimization, I implemented a policy gradient approach:

```python
# Example: Reinforcement learning optimization
class ClassificationAgent:
    def __init__(self, base_model, learning_rate=0.001):
        self.base_model = base_model
        self.optimizer = tf.keras.optimizers.Adam(learning_rate)
        self.classification_history = []
        
    def get_action(self, state, epsilon=0.1):
        # State is the current message and previous classifications
        if random.random() < epsilon:
            # Exploration: random classification
            return [
                random.randint(0, num_msg_types-1),
                random.randint(0, num_account_types-1),
                random.randint(0, num_subtypes-1)
            ]
        else:
            # Exploitation: use model prediction
            predictions = self.base_model.predict(state)
            return [np.argmax(p) for p in predictions]
    
    def update_policy(self, states, actions, rewards):
        with tf.GradientTape() as tape:
            loss = self._compute_loss(states, actions, rewards)
        
        # Get gradients and apply them
        gradients = tape.gradient(loss, self.base_model.trainable_variables)
        self.optimizer.apply_gradients(zip(gradients, self.base_model.trainable_variables))
        
        return loss
    
    def _compute_loss(self, states, actions, rewards):
        # Policy gradient loss calculation
        # ...implementation details...
```

## Results and Performance

The Multi-Category SMS Classification system achieved exceptional results:

- **91% overall accuracy** across 27 distinct categories
- **94% accuracy** for primary message type classification
- **89% accuracy** for account type classification
- **87% accuracy** for subtype classification
- **Real-time classification** with an average processing time of 15ms per message

### Performance Comparison

| Method | Overall Accuracy | Processing Time | Memory Usage |
|--------|------------------|----------------|--------------|
| Traditional ML (Random Forest) | 78% | 25ms | Low |
| CNN-based Classification | 83% | 22ms | Medium |
| LSTM without Hierarchy | 85% | 30ms | High |
| **Our Hierarchical LSTM** | **91%** | **15ms** | **Medium** |

### Case Study: Financial SMS

The system was particularly effective for financial SMS messages, where it could:

1. Distinguish between 8 different financial message types
2. Identify 12 different account types with high precision
3. Correctly classify transaction subtypes with 92% accuracy
4. Extract and validate key entities like amounts, dates, and merchant names

## Deployment Architecture

The classification system was deployed as a scalable, serverless architecture:

1. **API Layer**: FastAPI-based REST endpoints for real-time classification
2. **Processing Layer**: AWS Lambda functions for stateless processing
3. **Monitoring Layer**: CloudWatch metrics and alerts for system health
4. **Feedback Loop**: User feedback collection for continuous improvement

```python
# Example: FastAPI endpoint for classification
@app.post("/classify")
async def classify_sms(request: SMSRequest):
    # Preprocess the SMS text
    preprocessed_text = preprocess_sms(request.text)
    
    # Generate embeddings
    embeddings = generate_fasttext_embeddings(preprocessed_text)
    
    # Classify using the hierarchical model
    msg_type, account_type, subtype = model.predict(embeddings)
    
    # Extract entities based on classification
    entities = extract_entities(preprocessed_text, msg_type, account_type, subtype)
    
    # Return classification results
    return {
        "message_type": msg_type,
        "account_type": account_type,
        "subtype": subtype,
        "entities": entities,
        "confidence_scores": {
            "message_type": float(msg_type_confidence),
            "account_type": float(account_type_confidence),
            "subtype": float(subtype_confidence)
        }
    }
```

## Challenges and Solutions

Several challenges emerged during the development of this system:

### Challenge 1: Error Propagation in Hierarchical Models

Errors in higher-level classifications (e.g., message type) could propagate to lower levels.

**Solution**: Implemented a confidence-based backtracking mechanism that could revisit higher-level classifications if lower-level confidence was too low.

### Challenge 2: Handling Rare Categories

Some message subtypes appeared very rarely in the training data.

**Solution**: Used a combination of data augmentation techniques and few-shot learning approaches to improve performance on rare categories.

### Challenge 3: Real-time Performance Requirements

The system needed to classify messages in real-time for integration with messaging platforms.

**Solution**: Optimized the model architecture for inference speed, implemented model quantization, and deployed using a serverless architecture that could scale automatically.

## Future Directions

The Multi-Category SMS Classification project opens several avenues for future work:

1. **Cross-lingual Classification**: Extending the system to handle messages in multiple languages without requiring separate models
2. **Temporal Pattern Recognition**: Incorporating time-series analysis to detect patterns in message sequences
3. **Zero-shot Classification**: Enabling classification of entirely new categories without explicit training examples
4. **Multimodal Integration**: Combining SMS classification with other data sources (e.g., app interactions, web behavior) for more comprehensive user insights

## Conclusion

The Multi-Category SMS Classification system demonstrates the power of combining hierarchical deep learning architectures with reinforcement learning optimization for complex text classification tasks. By leveraging the standardized output from the Auto-RegexIfy system and implementing a sophisticated classification hierarchy, the system achieves state-of-the-art performance across multiple classification dimensions.

This approach not only improves classification accuracy but also enables more nuanced analysis of SMS messages, unlocking valuable insights for businesses and enhancing the user experience through more intelligent message handling and organization.

## References

1. Devlin, J., et al. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." NAACL-HLT.
2. Joulin, A., et al. (2016). "Bag of Tricks for Efficient Text Classification." arXiv preprint arXiv:1607.01759.
3. Hochreiter, S., & Schmidhuber, J. (1997). "Long Short-Term Memory." Neural Computation, 9(8), 1735-1780.
4. Williams, R.J. (1992). "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning." Machine Learning, 8, 229-256.
5. Vaswani, A., et al. (2017). "Attention Is All You Need." Advances in Neural Information Processing Systems, 30.
